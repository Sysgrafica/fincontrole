
/**
 * Arquivo principal da aplicação FinControle
 * Contém as funcionalidades principais otimizadas
 */

// Variáveis globais
let currentUser = null;
let gastosUnsubscribe = null;
let cartoesUnsubscribe = null;
let bancosUnsubscribe = null;
let rendasUnsubscribe = null;
let dashboardMesAtual = new Date();

// Configuração de valores padrão para horas extras
window.valorHoraNormal = 20;
window.valorPercentualHoraExtra = 50;
window.valorPercentualNoturno = 20;

// Função otimizada para obter data local corrigida
window.getDataLocalCorrigida = function() {
    const data = new Date();
    const options = { timeZone: 'America/Sao_Paulo' };
    const dataLocal = new Intl.DateTimeFormat('pt-BR', options).format(data).split('/');
    return `${dataLocal[2]}-${dataLocal[1].padStart(2, '0')}-${dataLocal[0].padStart(2, '0')}`;
};

// Utilitário para querySelector seguro
function safeQuerySelector(element, selector) {
    try {
        return element ? element.querySelector(selector) : null;
    } catch (e) {
        console.error(`Erro ao buscar elemento ${selector}:`, e);
        return null;
    }
}

// Função otimizada para notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconClass = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';

    notification.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    container.appendChild(notification);

    setTimeout(() => notification.remove(), 5000);
}

// Função otimizada para modais
function openModal(title, formHtml, setupCallbackOrSubmitCallback, submitCallbackOrUndefined) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) {
        console.error('Elementos do modal não encontrados');
        return;
    }
    
    modalTitle.textContent = title;
    modalBody.innerHTML = formHtml;
    modal.classList.add('is-open');
    
    // Inicializar campos de data
    setTimeout(() => {
        initializeTooltips();
        inicializarCamposData();
    }, 100);

    // Compatibilidade com callbacks
    let setupCallback, submitCallback;
    if (typeof submitCallbackOrUndefined === 'function') {
        setupCallback = setupCallbackOrSubmitCallback;
        submitCallback = submitCallbackOrUndefined;
    } else {
        setupCallback = null;
        submitCallback = setupCallbackOrSubmitCallback;
    }

    const form = modalBody.querySelector('form');
    if (form && typeof submitCallback === 'function') {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            submitCallback(data);
        });
    }
    
    if (typeof setupCallback === 'function') {
        setTimeout(setupCallback, 10);
    }
}

function closeModal() {
    const modal = document.getElementById('generic-modal');
    const modalBody = document.getElementById('modal-body');
    if (modal) modal.classList.remove('is-open');
    if (modalBody) modalBody.innerHTML = '';
}

// Função para inicializar tooltips
function initializeTooltips() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        const tooltipText = safeQuerySelector(tooltip, '.tooltiptext');
        if (!tooltipText) return;
        
        tooltip.addEventListener('mouseenter', () => {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
        });
        
        tooltip.addEventListener('mouseleave', () => {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
        });
    });
}

// Função para converter arquivo para base64 com otimização
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
}

// Função para verificar e limitar tamanho de imagens
function verificarTamanhoBase64(base64String, maxSizeMB = 1) {
    if (!base64String) return { base64: null, redimensionada: false };
    
    const aproximateSizeInBytes = (base64String.length * 3) / 4;
    const sizeMB = aproximateSizeInBytes / (1024 * 1024);
    
    return sizeMB <= maxSizeMB 
        ? { base64: base64String, redimensionada: false }
        : redimensionarImagemBase64(base64String, maxSizeMB);
}

// Função para redimensionar imagens
function redimensionarImagemBase64(base64String, maxSizeMB) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64String;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            
            const MAX_SIZE = 1200;
            if (width > height && width > MAX_SIZE) {
                height = Math.round(height * (MAX_SIZE / width));
                width = MAX_SIZE;
            } else if (height > MAX_SIZE) {
                width = Math.round(width * (MAX_SIZE / height));
                height = MAX_SIZE;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            resolve({ base64: canvas.toDataURL('image/jpeg', 0.7), redimensionada: true });
        };
        
        img.onerror = () => resolve({ base64: base64String, redimensionada: false });
    });
}

// Funções de data otimizadas
function converterDataParaFusoBrasil(dataString) {
    if (!dataString) return new Date();
    return typeof dataString === 'string' 
        ? new Date(`${dataString}T12:00:00-03:00`)
        : dataString instanceof Date ? dataString : new Date();
}

function formatarDataBrasil(data) {
    if (!(data instanceof Date)) {
        data = typeof data === 'string' ? converterDataParaFusoBrasil(data) : new Date();
    }
    return data.toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'});
}

function obterDataAtualBrasil() {
    return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
}

function obterDataAtualBrasilFormatada() {
    return obterDataAtualBrasil().toISOString().split('T')[0];
}

// Função para inicializar campos de data
function inicializarCamposData() {
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = window.getDataLocalCorrigida();
        }
    });
}

// Função otimizada para transformar gastos em cards
function transformarGastosParaCards() {
    const gastosTableBody = document.getElementById('gastos-table-body');
    const gastosCardsView = document.getElementById('gastos-cards-view');
    
    if (!gastosTableBody || !gastosCardsView) return;
    
    gastosCardsView.innerHTML = '';
    
    const rows = gastosTableBody.querySelectorAll('tr');
    if (!rows.length) {
        gastosCardsView.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt" style="font-size: 3rem; color: var(--subtle-text-color); opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>Nenhum gasto encontrado.</p>
            </div>
        `;
        return;
    }
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;
        
        const card = document.createElement('div');
        card.className = 'gasto-card';
        card.innerHTML = `
            <div class="gasto-card-header">
                <div class="gasto-card-title">${cells[0].textContent}</div>
                <div class="gasto-card-valor">${cells[1].textContent}</div>
            </div>
            <div class="gasto-card-info">
                <div class="gasto-card-info-item">
                    <div class="gasto-card-label">Data</div>
                    <div class="gasto-card-value">${cells[2].textContent}</div>
                </div>
                <div class="gasto-card-info-item">
                    <div class="gasto-card-label">Categoria</div>
                    <div class="gasto-card-value">${cells[3].textContent}</div>
                </div>
                <div class="gasto-card-info-item">
                    <div class="gasto-card-label">Método</div>
                    <div class="gasto-card-value">${cells[4].textContent}</div>
                </div>
            </div>
            <div class="gasto-card-details">${cells[5].textContent}</div>
            <div class="gasto-card-actions">${cells[6].innerHTML}</div>
        `;
        gastosCardsView.appendChild(card);
    });
}

// Função para alternar visualização
function alternarVisualizacaoGastos() {
    const tableView = document.getElementById('gastos-table-view');
    const cardsView = document.getElementById('gastos-cards-view');
    const toggleBtn = document.getElementById('toggle-gastos-view');
    
    if (!tableView || !cardsView || !toggleBtn) return;
    
    if (tableView.style.display === 'none') {
        tableView.style.display = 'block';
        cardsView.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-th"></i>';
        toggleBtn.title = 'Ver como cards';
    } else {
        tableView.style.display = 'none';
        cardsView.style.display = 'block';
        transformarGastosParaCards();
        toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
        toggleBtn.title = 'Ver como tabela';
    }
}

// Correção de datas (integrada do fix_modals.js)
document.addEventListener('DOMContentLoaded', function() {
    // Sobrescrever toISOString para correção de datas
    const originalDateToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = function() {
        const stack = new Error().stack || '';
        if (stack.includes('split') && stack.includes('[0]')) {
            const ano = this.getFullYear();
            const mes = String(this.getMonth() + 1).padStart(2, '0');
            const dia = String(this.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}T00:00:00.000Z`;
        }
        return originalDateToISOString.call(this);
    };

    // Inicializar componentes
    inicializarCamposData();
    
    // Configurar eventos
    const toggleBtn = document.getElementById('toggle-gastos-view');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', alternarVisualizacaoGastos);
    }
    
    // Configurar modal
    const closeModalBtn = document.querySelector('.close-button');
    const modal = document.getElementById('generic-modal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }
    
    // Configurar tabs de autenticação
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab, .auth-form').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
        });
    });
});

// Event listener para redimensionamento otimizado
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        const gastosPage = document.getElementById('gastos-page');
        if (gastosPage) {
            const tableView = document.getElementById('gastos-table-view');
            const cardsView = document.getElementById('gastos-cards-view');
            const toggleBtn = document.getElementById('toggle-gastos-view');
            
            if (tableView && cardsView && cardsView.style.display !== 'block') {
                tableView.style.display = 'none';
                cardsView.style.display = 'block';
                transformarGastosParaCards();
                
                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
                    toggleBtn.title = 'Ver como tabela';
                }
            }
        }
    }
});
