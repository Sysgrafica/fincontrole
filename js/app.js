
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

// Função para transformar a tabela de faturas em cards em dispositivos móveis
function transformarTabelaEmCards() {
    const isMobile = window.innerWidth <= 576;
    const faturaTableBody = document.getElementById('fatura-table-body');
    const faturaTable = document.querySelector('.fatura-tabela-container table');
    
    // Se não for mobile ou ainda não temos a tabela carregada, não fazemos nada
    if (!isMobile || !faturaTableBody || !faturaTable) return;
    
    // Se já existe a visualização em cards, não precisamos criar novamente
    if (document.querySelector('.data-table-card-view')) return;
    
    // Criar container para os cards
    const cardContainer = document.createElement('div');
    cardContainer.className = 'data-table-card-view';
    
    // Obter todas as linhas da tabela
    const rows = faturaTableBody.querySelectorAll('tr');
    
    // Se não tiver linhas, não precisa fazer nada
    if (!rows || rows.length === 0) return;
    
    // Obter os títulos das colunas
    const headers = Array.from(faturaTable.querySelectorAll('thead th')).map(th => th.textContent.trim());
    
    // Para cada linha da tabela, criar um card
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;
        
        const card = document.createElement('div');
        card.className = 'data-table-card';
        
        // Criar conteúdo principal: Descrição e Valor
        const mainInfo = document.createElement('div');
        mainInfo.className = 'card-main-info';
        
        const descricao = cells[1].textContent.trim();
        const valor = cells[4].textContent.trim();
        
        const descricaoEl = document.createElement('div');
        descricaoEl.className = 'card-valor';
        descricaoEl.textContent = descricao;
        mainInfo.appendChild(descricaoEl);
        
        const valorEl = document.createElement('div');
        valorEl.className = 'card-valor';
        valorEl.textContent = valor;
        mainInfo.appendChild(valorEl);
        
        card.appendChild(mainInfo);
        
        // Criar linhas para dados adicionais
        const dataRow = document.createElement('div');
        dataRow.className = 'card-row';
        
        // Data
        const dataCol = document.createElement('div');
        dataCol.className = 'card-col';
        
        const dataLabel = document.createElement('span');
        dataLabel.className = 'data-label';
        dataLabel.textContent = 'Data';
        dataCol.appendChild(dataLabel);
        
        const dataValue = document.createElement('div');
        dataValue.className = 'data-value';
        dataValue.textContent = cells[0].textContent.trim();
        dataCol.appendChild(dataValue);
        
        dataRow.appendChild(dataCol);
        
        // Categoria
        const categoriaCol = document.createElement('div');
        categoriaCol.className = 'card-col';
        
        const categoriaLabel = document.createElement('span');
        categoriaLabel.className = 'data-label';
        categoriaLabel.textContent = 'Categoria';
        categoriaCol.appendChild(categoriaLabel);
        
        const categoriaValue = document.createElement('div');
        categoriaValue.className = 'data-value';
        categoriaValue.textContent = cells[2].textContent.trim();
        categoriaCol.appendChild(categoriaValue);
        
        dataRow.appendChild(categoriaCol);
        
        card.appendChild(dataRow);
        
        // Parcelas - Melhorar exibição
        const parcelasRow = document.createElement('div');
        parcelasRow.className = 'card-row';
        
        const parcelasCol = document.createElement('div');
        parcelasCol.className = 'card-col';
        
        const parcelasLabel = document.createElement('span');
        parcelasLabel.className = 'data-label';
        parcelasLabel.textContent = 'Parcelas';
        parcelasCol.appendChild(parcelasLabel);
        
        const parcelasValue = document.createElement('div');
        parcelasValue.className = 'data-value';
        const parcelasText = cells[3].textContent.trim();
        
        // Se for parcelamento, destacar visualmente
        if (parcelasText !== '-' && parcelasText !== '1x') {
            parcelasValue.innerHTML = `<span class="badge badge-info">${parcelasText}</span>`;
        } else {
            parcelasValue.textContent = parcelasText;
        }
        
        parcelasCol.appendChild(parcelasValue);
        parcelasRow.appendChild(parcelasCol);
        card.appendChild(parcelasRow);
        
        // Adicionar botões de ações
        const actionsCell = cells[5];
        if (actionsCell) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';
            actions.innerHTML = actionsCell.innerHTML;
            card.appendChild(actions);
        }
        
        // Adicionar o card ao container
        cardContainer.appendChild(card);
    });
    
    // Esconder a tabela original e adicionar os cards após ela
    faturaTable.style.display = 'none';
    faturaTable.parentNode.appendChild(cardContainer);
}

// Função para transformar a tabela de gastos em cards
function transformarGastosParaCards() {
    const gastosTableBody = document.getElementById('gastos-table-body');
    const gastosTable = document.querySelector('#gastos-table-view table');
    const gastosCardsView = document.getElementById('gastos-cards-view');
    
    // Limpa a visualização em cards anterior
    gastosCardsView.innerHTML = '';
    
    // Verifica se há dados na tabela
    const rows = gastosTableBody.querySelectorAll('tr');
    if (!rows.length) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-state';
        emptyMsg.innerHTML = `
            <i class="fas fa-receipt" style="font-size: 3rem; color: var(--subtle-text-color); opacity: 0.3; margin-bottom: 1rem;"></i>
            <p>Nenhum gasto encontrado.</p>
        `;
        gastosCardsView.appendChild(emptyMsg);
        return;
    }
    
    // Para cada linha da tabela, criar um card
    rows.forEach(row => {
        if (row.querySelector('td[colspan]')) {
            // Esta é uma linha de mensagem (como "Nenhum gasto encontrado")
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-state';
            emptyMsg.innerHTML = row.innerHTML;
            gastosCardsView.appendChild(emptyMsg);
            return;
        }
        
        const cells = row.querySelectorAll('td');
        if (!cells.length) return;
        
        // Cria o card
        const card = document.createElement('div');
        card.className = 'gasto-card';
        
        // Verifica se é um gasto pendente
        if (row.classList.contains('gasto-pendente')) {
            card.classList.add('pendente');
        }
        
        // Cabeçalho com descrição e valor
        const header = document.createElement('div');
        header.className = 'gasto-card-header';
        
        const title = document.createElement('div');
        title.className = 'gasto-card-title';
        title.textContent = cells[0].textContent.trim(); // Descrição
        
        const valor = document.createElement('div');
        valor.className = 'gasto-card-valor';
        valor.textContent = cells[1].textContent.trim(); // Valor
        
        header.appendChild(title);
        header.appendChild(valor);
        card.appendChild(header);
        
        // Informações adicionais (Data, Categoria, Método)
        const info = document.createElement('div');
        info.className = 'gasto-card-info';
        
        // Data
        const dataItem = document.createElement('div');
        dataItem.className = 'gasto-card-info-item';
        
        const dataLabel = document.createElement('div');
        dataLabel.className = 'gasto-card-label';
        dataLabel.textContent = 'Data';
        
        const dataValue = document.createElement('div');
        dataValue.className = 'gasto-card-value';
        dataValue.textContent = cells[2].textContent.trim(); // Data
        
        dataItem.appendChild(dataLabel);
        dataItem.appendChild(dataValue);
        info.appendChild(dataItem);
        
        // Verificar se há informações de parcelamento na observação
        const observacao = cells[5] ? cells[5].textContent.trim() : '';
        if (observacao.includes('Parcela') && observacao.includes('/')) {
            const parcelamentoInfo = document.createElement('div');
            parcelamentoInfo.className = 'gasto-card-parcelamento';
            parcelamentoInfo.innerHTML = `
                <i class="fas fa-credit-card text-info"></i>
                <small class="text-info">${observacao}</small>
            `;
            info.appendChild(parcelamentoInfo);
        }
        
        // Categoria
        const categoriaItem = document.createElement('div');
        categoriaItem.className = 'gasto-card-info-item';
        
        const categoriaLabel = document.createElement('div');
        categoriaLabel.className = 'gasto-card-label';
        categoriaLabel.textContent = 'Categoria';
        
        const categoriaValue = document.createElement('div');
        categoriaValue.className = 'gasto-card-value';
        categoriaValue.textContent = cells[3].textContent.trim(); // Categoria
        
        categoriaItem.appendChild(categoriaLabel);
        categoriaItem.appendChild(categoriaValue);
        info.appendChild(categoriaItem);
        
        // Método
        const metodoItem = document.createElement('div');
        metodoItem.className = 'gasto-card-info-item';
        
        const metodoLabel = document.createElement('div');
        metodoLabel.className = 'gasto-card-label';
        metodoLabel.textContent = 'Método';
        
        const metodoValue = document.createElement('div');
        metodoValue.className = 'gasto-card-value';
        metodoValue.textContent = cells[4].textContent.trim(); // Método
        
        metodoItem.appendChild(metodoLabel);
        metodoItem.appendChild(metodoValue);
        info.appendChild(metodoItem);
        
        card.appendChild(info);
        
        // Detalhes (se existirem)
        if (cells[5] && cells[5].textContent.trim() !== '-') {
            const details = document.createElement('div');
            details.className = 'gasto-card-details';
            details.innerHTML = cells[5].innerHTML; // Detalhes
            card.appendChild(details);
        }
        
        // Ações
        if (cells[6]) {
            const actions = document.createElement('div');
            actions.className = 'gasto-card-actions';
            actions.innerHTML = cells[6].innerHTML; // Ações
            card.appendChild(actions);
        }
        
        gastosCardsView.appendChild(card);
    });
}

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
