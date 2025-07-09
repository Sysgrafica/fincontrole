// Função para obter a data local corrigida no formato YYYY-MM-DD
window.getDataLocalCorrigida = function() {
    const data = new Date();
    // Configurar para o fuso horário de São Paulo/Brasil (GMT-3)
    const options = { timeZone: 'America/Sao_Paulo' };
    const dataLocal = new Intl.DateTimeFormat('pt-BR', options).format(data).split('/');
    const dia = dataLocal[0];
    const mes = dataLocal[1];
    const ano = dataLocal[2];
    return `${ano}-${mes}-${dia}`;
};

// Função movida para main-app.js para evitar duplicação

// Função otimizada movida para main-app.js

// Função para alternar entre visualização de tabela e cards
function alternarVisualizacaoGastos() {
    const tableView = document.getElementById('gastos-table-view');
    const cardsView = document.getElementById('gastos-cards-view');
    const toggleBtn = document.getElementById('toggle-gastos-view');

    if (tableView.style.display === 'none') {
        // Mudar para visualização de tabela
        tableView.style.display = 'block';
        cardsView.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-th"></i>';
        toggleBtn.title = 'Ver como cards';
    } else {
        // Mudar para visualização de cards
        tableView.style.display = 'none';
        cardsView.style.display = 'block';
        transformarGastosParaCards();
        toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
        toggleBtn.title = 'Ver como tabela';
    }
}

// Adicionar evento para chamar a função quando a página carregar e quando redimensionar
document.addEventListener('DOMContentLoaded', function() {
    // Cartões: Verificar se estamos na página de cartões
    const cartoesPage = document.getElementById('cartoes-page');
    if (cartoesPage) {
        // Transformar tabela em cards se for mobile
        transformarTabelaEmCards();

        // Adicionar evento para quando o cartão for selecionado
        document.addEventListener('click', function(e) {
            const cartaoItem = e.target.closest('.cartao-sidebar-item');
            if (cartaoItem) {
                setTimeout(function() {
                    transformarTabelaEmCards();
                }, 300);
            }
        });

        // Adicionar evento de mudança de fatura
        const btnFaturaAnterior = document.getElementById('btn-fatura-anterior');
        const btnFaturaAtual = document.getElementById('btn-fatura-atual');
        const btnFaturaProxima = document.getElementById('btn-fatura-proxima');

        if (btnFaturaAnterior) btnFaturaAnterior.addEventListener('click', () => setTimeout(transformarTabelaEmCards, 300));
        if (btnFaturaAtual) btnFaturaAtual.addEventListener('click', () => setTimeout(transformarTabelaEmCards, 300));
        if (btnFaturaProxima) btnFaturaProxima.addEventListener('click', () => setTimeout(transformarTabelaEmCards, 300));
    }

    // Gastos: Verificar se estamos na página de gastos
    const gastosPage = document.getElementById('gastos-page');
    if (gastosPage) {
        // Configurar botão para alternar visualização
        const toggleBtn = document.getElementById('toggle-gastos-view');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', alternarVisualizacaoGastos);
        }

        // Em dispositivos móveis, mostrar cards por padrão
        if (window.innerWidth <= 768) {
            const tableView = document.getElementById('gastos-table-view');
            const cardsView = document.getElementById('gastos-cards-view');

            if (tableView && cardsView) {
                tableView.style.display = 'none';
                cardsView.style.display = 'block';
                transformarGastosParaCards();

                if (toggleBtn) {
                    toggleBtn.innerHTML = '<i class="fas fa-list"></i>';
                    toggleBtn.title = 'Ver como tabela';
                }
            }
        }

        // Observer para modificações na tabela de gastos
        const gastosTableObserver = new MutationObserver(function(mutations) {
            // Se a visualização em cards estiver ativa, atualize os cards
            if (document.getElementById('gastos-cards-view').style.display === 'block') {
                transformarGastosParaCards();
            }
        });

        const gastosTableBody = document.getElementById('gastos-table-body');
        if (gastosTableBody) {
            gastosTableObserver.observe(gastosTableBody, { childList: true, subtree: true });
        }
    }
});

// Adicionar evento de redimensionamento para adaptar interface
window.addEventListener('resize', function() {
    // Cartões: Verificar se estamos na página de cartões
    const cartoesPage = document.getElementById('cartoes-page');
    if (cartoesPage) {
        const isMobile = window.innerWidth <= 576;
        const cardView = document.querySelector('.data-table-card-view');
        const faturaTable = document.querySelector('.fatura-tabela-container table');

        if (isMobile) {
            if (!cardView) {
                transformarTabelaEmCards();
            } else {
                // Mostrar cards e esconder tabela
                if (cardView) cardView.style.display = 'flex';
                if (faturaTable) faturaTable.style.display = 'none';
            }
        } else {
            // Em telas maiores, mostrar a tabela e esconder os cards
            if (cardView) cardView.style.display = 'none';
            if (faturaTable) faturaTable.style.display = 'table';
        }
    }

    // Gastos: Verificar se estamos na página de gastos
    const gastosPage = document.getElementById('gastos-page');
    if (gastosPage) {
        const isMobile = window.innerWidth <= 768;
        const tableView = document.getElementById('gastos-table-view');
        const cardsView = document.getElementById('gastos-cards-view');
        const toggleBtn = document.getElementById('toggle-gastos-view');

        // Em dispositivos móveis, mostrar cards por padrão
        if (isMobile && tableView && cardsView) {
            if (cardsView.style.display !== 'block') {
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

    // Dashboard: Verificar se estamos na página de dashboard
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        const isMobile = window.innerWidth <= 576;

        if (isMobile) {
            // Transformar tabelas em cards quando redimensionar para mobile
            transformarTabelasDashboardEmCards();
        } else {
            // Em telas maiores, esconder os cards e mostrar as tabelas
            const cardViews = dashboardPage.querySelectorAll('.dashboard-card-view');
            cardViews.forEach(cardView => {
                cardView.style.display = 'none';
            });

            const tables = dashboardPage.querySelectorAll('.data-table');
            tables.forEach(table => {
                table.style.display = 'table';
            });
        }
    }

    // Rendas: Verificar se estamos na página de rendas
    const rendasPage = document.getElementById('rendas-page');
    if (rendasPage) {
        const isMobile = window.innerWidth <= 768;
        const tableView = rendasPage.querySelector('.rendas-table-view');
        const cardsView = rendasPage.querySelector('.rendas-cards-view');
        const cardsButton = rendasPage.querySelector('.rendas-view-toggle .view-btn[data-view="cards"]');
        const tableButton = rendasPage.querySelector('.rendas-view-toggle .view-btn[data-view="table"]');

        if (isMobile && tableView && cardsView) {
            if (tableView.style.display !== 'none') {
                tableView.style.display = 'none';
                cardsView.style.display = 'block';

                if (tableButton && cardsButton) {
                    tableButton.classList.remove('active');
                    cardsButton.classList.add('active');
                }
            }
        }
    }
});

// Função para corrigir datas em formulários
function inicializarCamposData() {
    // Substitui todas as strings de template que usam new Date().toISOString() por obterDataAtualBrasilFormatada()
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (input.value === '') {
            input.value = window.getDataLocalCorrigida();
        }
    });
}

// Adiciona a função ao carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    inicializarCamposData();
});

// Função para transformar tabelas do dashboard em cards (placeholder - implementar conforme necessário)
function transformarTabelasDashboardEmCards() {
    // Esta função será implementada conforme necessário
    console.log('Transformando tabelas do dashboard em cards para mobile');
}