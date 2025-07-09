
/**
 * Integração entre Gastos Parcelados e Faturas de Cartão
 */

// Função para exibir detalhes de parcelamento na fatura
async function carregarDetalhesParcelamentoFatura(cartaoId, mesReferencia) {
    try {
        if (!currentUser) return;
        
        // Buscar gastos parcelados do cartão no mês
        const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
        const dataInicio = new Date(mesReferencia);
        const dataFim = new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 1, 0);
        
        const q = query(
            gastosRef,
            where('isParcelado', '==', true),
            where('data', '>=', dataInicio.toISOString().split('T')[0]),
            where('data', '<=', dataFim.toISOString().split('T')[0]),
            where('metodoPagamento', '==', cartaoId)
        );
        
        const querySnapshot = await getDocs(q);
        const gastosParcelados = [];
        
        querySnapshot.forEach(doc => {
            gastosParcelados.push({ id: doc.id, ...doc.data() });
        });
        
        // Agrupar por grupoParcelasId
        const gruposParcelamento = {};
        gastosParcelados.forEach(gasto => {
            const grupoId = gasto.grupoParcelasId;
            if (!gruposParcelamento[grupoId]) {
                gruposParcelamento[grupoId] = [];
            }
            gruposParcelamento[grupoId].push(gasto);
        });
        
        return gruposParcelamento;
        
    } catch (error) {
        console.error('Erro ao carregar detalhes de parcelamento da fatura:', error);
        return {};
    }
}

// Função para exibir resumo de parcelamentos na tabela de fatura
function criarResumoParcelamentos(gastosParcelados) {
    if (Object.keys(gastosParcelados).length === 0) {
        return '';
    }
    
    let resumoHtml = `
        <div class="parcelamentos-resumo">
            <h5><i class="fas fa-credit-card"></i> Parcelamentos Nesta Fatura</h5>
            <div class="parcelamentos-lista">
    `;
    
    Object.keys(gastosParcelados).forEach(grupoId => {
        const parcelas = gastosParcelados[grupoId];
        const primeiraParcela = parcelas[0];
        
        resumoHtml += `
            <div class="parcelamento-item">
                <div class="parcelamento-header">
                    <span class="parcelamento-descricao">${primeiraParcela.descricao}</span>
                    <span class="parcelamento-valor">R$ ${primeiraParcela.valor}</span>
                </div>
                <div class="parcelamento-detalhes">
                    <small class="text-muted">
                        Parcela ${primeiraParcela.parcelaAtual}/${primeiraParcela.totalParcelas} 
                        de R$ ${parseFloat(primeiraParcela.valorOriginal).toFixed(2)}
                    </small>
                </div>
            </div>
        `;
    });
    
    resumoHtml += `
            </div>
        </div>
    `;
    
    return resumoHtml;
}

// Função para atualizar visualização da fatura com parcelamentos
async function atualizarFaturaComParcelamentos(cartaoId, mesReferencia) {
    const gastosParcelados = await carregarDetalhesParcelamentoFatura(cartaoId, mesReferencia);
    const resumoHtml = criarResumoParcelamentos(gastosParcelados);
    
    // Inserir o resumo na tabela de fatura
    const faturaTableBody = document.getElementById('fatura-table-body');
    if (faturaTableBody && resumoHtml) {
        const resumoRow = document.createElement('tr');
        resumoRow.className = 'parcelamentos-resumo-row';
        resumoRow.innerHTML = `
            <td colspan="6" style="padding: 0;">
                ${resumoHtml}
            </td>
        `;
        
        // Remover resumo anterior se existir
        const resumoAnterior = faturaTableBody.querySelector('.parcelamentos-resumo-row');
        if (resumoAnterior) {
            resumoAnterior.remove();
        }
        
        // Adicionar no final da tabela
        faturaTableBody.appendChild(resumoRow);
    }
}

// Função para destacar gastos parcelados na fatura
function destacarGastosParceladosNaFatura() {
    const faturaRows = document.querySelectorAll('#fatura-table-body tr');
    
    faturaRows.forEach(row => {
        const observacaoCell = row.cells[1]; // Assumindo que observação está na segunda coluna
        if (observacaoCell && observacaoCell.textContent.includes('Parcela')) {
            row.classList.add('gasto-parcelado');
            
            // Adicionar ícone de parcelamento
            const firstCell = row.cells[0];
            if (firstCell) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-credit-card text-info';
                icon.style.marginRight = '0.5rem';
                firstCell.insertBefore(icon, firstCell.firstChild);
            }
        }
    });
}

// Expor funções globalmente
window.carregarDetalhesParcelamentoFatura = carregarDetalhesParcelamentoFatura;
window.atualizarFaturaComParcelamentos = atualizarFaturaComParcelamentos;
window.destacarGastosParceladosNaFatura = destacarGastosParceladosNaFatura;
