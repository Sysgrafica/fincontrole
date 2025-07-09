// Função para transformar tabelas em cards para visualização mobile
function transformarTabelasDashboardEmCards() {
    // Verificar se estamos em um dispositivo móvel
    const isMobile = window.innerWidth <= 576;
    if (!isMobile) return;
    
    // Transformar tabela de bancos
    transformarTabelaEmCardsDashboard('dashboard-bancos-list', 'bancos');
    
    // Transformar tabela de faturas
    transformarTabelaEmCardsDashboard('dashboard-faturas-list', 'faturas');
    
    // Transformar tabela de rendas
    transformarTabelaEmCardsDashboard('dashboard-rendas-list', 'rendas');
    
    // Transformar tabela de gastos pendentes
    transformarTabelaEmCardsDashboard('dashboard-gastos-pendentes-list', 'gastos');
}

// Função genérica para transformar uma tabela específica em cards
function transformarTabelaEmCardsDashboard(containerId, tipo) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Verificar se já existe uma visualização em cards
    if (container.querySelector('.dashboard-card-view')) return;
    
    // Encontrar a tabela dentro do container
    const tabela = container.querySelector('table');
    if (!tabela) return;
    
    // Criar o container para os cards
    const cardView = document.createElement('div');
    cardView.className = 'dashboard-card-view';
    
    // Obter os cabeçalhos da tabela
    const headers = Array.from(tabela.querySelectorAll('thead th')).map(th => th.textContent.trim());
    
    // Obter as linhas de dados
    const rows = tabela.querySelectorAll('tbody tr');
    if (!rows.length) return;
    
    // Para cada linha, criar um card
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (!cells.length) return;
        
        // Criar o card
        const card = document.createElement('div');
        card.className = 'dashboard-data-card';
        
        // Conteúdo do card varia dependendo do tipo
        switch(tipo) {
            case 'bancos':
                criarCardBanco(card, cells, headers);
                break;
            case 'faturas':
                criarCardFatura(card, cells, headers);
                break;
            case 'rendas':
                criarCardRenda(card, cells, headers);
                break;
            case 'gastos':
                criarCardGasto(card, cells, headers);
                break;
            default:
                criarCardGenerico(card, cells, headers);
        }
        
        // Adicionar o card ao container
        cardView.appendChild(card);
    });
    
    // Adicionar a visualização em cards ao container
    container.appendChild(cardView);
}

// Função para criar um card de banco
function criarCardBanco(card, cells, headers) {
    // Cabeçalho do card com nome do banco e saldo
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = cells[0].textContent.trim(); // Nome do banco
    
    const value = document.createElement('div');
    value.className = 'card-value';
    const saldo = cells[3].textContent.trim(); // Saldo
    value.textContent = saldo;
    
    // Adicionar classe baseada no valor (positivo/negativo)
    if (saldo.includes('-')) {
        value.classList.add('negative');
    } else {
        value.classList.add('positive');
    }
    
    header.appendChild(title);
    header.appendChild(value);
    card.appendChild(header);
    
    // Conteúdo do card com detalhes do banco
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Tipo de conta
    const tipoItem = document.createElement('div');
    tipoItem.className = 'card-item';
    
    const tipoLabel = document.createElement('div');
    tipoLabel.className = 'card-label';
    tipoLabel.textContent = 'Tipo de Conta';
    
    const tipoText = document.createElement('div');
    tipoText.className = 'card-text';
    tipoText.textContent = cells[1].textContent.trim(); // Tipo de conta
    
    tipoItem.appendChild(tipoLabel);
    tipoItem.appendChild(tipoText);
    content.appendChild(tipoItem);
    
    // Agência/Conta
    const contaItem = document.createElement('div');
    contaItem.className = 'card-item';
    
    const contaLabel = document.createElement('div');
    contaLabel.className = 'card-label';
    contaLabel.textContent = 'Agência/Conta';
    
    const contaText = document.createElement('div');
    contaText.className = 'card-text';
    contaText.textContent = cells[2].textContent.trim(); // Agência/Conta
    
    contaItem.appendChild(contaLabel);
    contaItem.appendChild(contaText);
    content.appendChild(contaItem);
    
    card.appendChild(content);
    
    // Adicionar rodapé se houver
    criarRodapeCard(card, cells);
}

// Função para criar um card de fatura
function criarCardFatura(card, cells, headers) {
    // Cabeçalho do card com nome do cartão e valor da fatura
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = cells[0].textContent.trim(); // Nome do cartão
    
    const value = document.createElement('div');
    value.className = 'card-value negative';
    value.textContent = cells[1].textContent.trim(); // Valor da fatura
    
    header.appendChild(title);
    header.appendChild(value);
    card.appendChild(header);
    
    // Conteúdo do card com detalhes da fatura
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Vencimento
    const vencItem = document.createElement('div');
    vencItem.className = 'card-item';
    
    const vencLabel = document.createElement('div');
    vencLabel.className = 'card-label';
    vencLabel.textContent = 'Vencimento';
    
    const vencText = document.createElement('div');
    vencText.className = 'card-text';
    vencText.textContent = cells[2].textContent.trim(); // Vencimento
    
    vencItem.appendChild(vencLabel);
    vencItem.appendChild(vencText);
    content.appendChild(vencItem);
    
    // Status
    const statusItem = document.createElement('div');
    statusItem.className = 'card-item';
    
    const statusLabel = document.createElement('div');
    statusLabel.className = 'card-label';
    statusLabel.textContent = 'Status';
    
    const statusText = document.createElement('div');
    statusText.className = 'card-text';
    statusText.innerHTML = cells[3].innerHTML; // Status (mantém formatação HTML)
    
    statusItem.appendChild(statusLabel);
    statusItem.appendChild(statusText);
    content.appendChild(statusItem);
    
    card.appendChild(content);
    
    // Adicionar rodapé se houver
    criarRodapeCard(card, cells);
}

// Função para criar um card de renda
function criarCardRenda(card, cells, headers) {
    // Cabeçalho do card com descrição da renda e valor
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = cells[0].textContent.trim(); // Descrição
    
    const value = document.createElement('div');
    value.className = 'card-value positive';
    value.textContent = cells[1].textContent.trim(); // Valor
    
    header.appendChild(title);
    header.appendChild(value);
    card.appendChild(header);
    
    // Conteúdo do card com detalhes da renda
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Categoria
    const catItem = document.createElement('div');
    catItem.className = 'card-item';
    
    const catLabel = document.createElement('div');
    catLabel.className = 'card-label';
    catLabel.textContent = 'Categoria';
    
    const catText = document.createElement('div');
    catText.className = 'card-text';
    catText.textContent = cells[2].textContent.trim(); // Categoria
    
    catItem.appendChild(catLabel);
    catItem.appendChild(catText);
    content.appendChild(catItem);
    
    // Data
    const dataItem = document.createElement('div');
    dataItem.className = 'card-item';
    
    const dataLabel = document.createElement('div');
    dataLabel.className = 'card-label';
    dataLabel.textContent = 'Data';
    
    const dataText = document.createElement('div');
    dataText.className = 'card-text';
    dataText.textContent = cells[3].textContent.trim(); // Data
    
    dataItem.appendChild(dataLabel);
    dataItem.appendChild(dataText);
    content.appendChild(dataItem);
    
    card.appendChild(content);
    
    // Adicionar rodapé se houver
    criarRodapeCard(card, cells);
}

// Função para criar um card de gasto
function criarCardGasto(card, cells, headers) {
    // Cabeçalho do card com descrição do gasto e valor
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = cells[0].textContent.trim(); // Descrição
    
    const value = document.createElement('div');
    value.className = 'card-value negative';
    value.textContent = cells[1].textContent.trim(); // Valor
    
    header.appendChild(title);
    header.appendChild(value);
    card.appendChild(header);
    
    // Conteúdo do card com detalhes do gasto
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Categoria
    const catItem = document.createElement('div');
    catItem.className = 'card-item';
    
    const catLabel = document.createElement('div');
    catLabel.className = 'card-label';
    catLabel.textContent = 'Categoria';
    
    const catText = document.createElement('div');
    catText.className = 'card-text';
    catText.textContent = cells[2].textContent.trim(); // Categoria
    
    catItem.appendChild(catLabel);
    catItem.appendChild(catText);
    content.appendChild(catItem);
    
    // Vencimento
    const vencItem = document.createElement('div');
    vencItem.className = 'card-item';
    
    const vencLabel = document.createElement('div');
    vencLabel.className = 'card-label';
    vencLabel.textContent = 'Vencimento';
    
    const vencText = document.createElement('div');
    vencText.className = 'card-text';
    vencText.textContent = cells[3].textContent.trim(); // Vencimento
    
    vencItem.appendChild(vencLabel);
    vencItem.appendChild(vencText);
    content.appendChild(vencItem);
    
    // Status
    const statusItem = document.createElement('div');
    statusItem.className = 'card-item';
    
    const statusLabel = document.createElement('div');
    statusLabel.className = 'card-label';
    statusLabel.textContent = 'Status';
    
    const statusText = document.createElement('div');
    statusText.className = 'card-text';
    statusText.innerHTML = cells[4].innerHTML; // Status (mantém formatação HTML)
    
    statusItem.appendChild(statusLabel);
    statusItem.appendChild(statusText);
    content.appendChild(statusItem);
    
    card.appendChild(content);
    
    // Adicionar rodapé se houver
    criarRodapeCard(card, cells);
}

// Função para criar um card genérico
function criarCardGenerico(card, cells, headers) {
    // Cabeçalho do card com primeiro valor
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = cells[0].textContent.trim();
    
    header.appendChild(title);
    card.appendChild(header);
    
    // Conteúdo do card com os demais valores
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // Adicionar cada par de cabeçalho/valor como um item
    for (let i = 1; i < cells.length; i++) {
        if (headers[i]) {
            const item = document.createElement('div');
            item.className = 'card-item';
            
            const label = document.createElement('div');
            label.className = 'card-label';
            label.textContent = headers[i];
            
            const text = document.createElement('div');
            text.className = 'card-text';
            text.innerHTML = cells[i].innerHTML; // Mantém formatação HTML
            
            item.appendChild(label);
            item.appendChild(text);
            content.appendChild(item);
        }
    }
    
    card.appendChild(content);
    
    // Adicionar rodapé se houver
    criarRodapeCard(card, cells);
}

// Função para criar rodapé com botão de ação (se existir)
function criarRodapeCard(card, cells) {
    // Verificar qual é o índice da última célula (pode variar dependendo do tipo de card)
    const lastIndex = cells.length - 1;
    
    // Verificar se a última célula contém botões ou ações
    if (cells[lastIndex] && cells[lastIndex].querySelector('button, a')) {
        const footer = document.createElement('div');
        footer.className = 'card-footer';
        footer.innerHTML = cells[lastIndex].innerHTML;
        card.appendChild(footer);
    }
} 