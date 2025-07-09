
/**
 * Sistema de Gerenciamento de Parcelamentos
 * Gerencia gastos parcelados e sua integração com faturas de cartão
 */

// Função para criar gasto parcelado
async function criarGastoParcelado(dadosGasto) {
    try {
        if (!currentUser) return;
        
        const numerosParcelas = parseInt(dadosGasto.numeroParcelas) || 1;
        const valorTotal = parseFloat(dadosGasto.valor);
        const valorParcela = valorTotal / numerosParcelas;
        
        // Data base para as parcelas
        const dataBase = new Date(dadosGasto.data);
        
        // ID único para o grupo de parcelas
        const grupoParcelasId = `parcelas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const parcelasPromises = [];
        
        for (let i = 0; i < numerosParcelas; i++) {
            // Calcular data da parcela (adicionar meses)
            const dataParcela = new Date(dataBase);
            dataParcela.setMonth(dataParcela.getMonth() + i);
            
            const dadosParcela = {
                ...dadosGasto,
                valor: parseFloat(valorParcela.toFixed(2)),
                data: dataParcela.toISOString().split('T')[0],
                observacao: `${dadosGasto.observacao || ''} - Parcela ${i + 1}/${numerosParcelas}`.trim(),
                parcelaAtual: i + 1,
                totalParcelas: numerosParcelas,
                grupoParcelasId: grupoParcelasId,
                valorOriginal: valorTotal,
                isParcelado: true,
                status: 'Pago', // Parcelas de cartão são consideradas pagas (vão para fatura)
                criadoEm: serverTimestamp()
            };
            
            // Se for cartão de crédito, integrar com fatura
            if (dadosGasto.metodoPagamento && dadosGasto.metodoPagamento.includes('Cartão')) {
                await integrarParcelaComFatura(dadosParcela, dadosGasto.cartaoId);
            }
            
            const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
            parcelasPromises.push(addDoc(gastosRef, dadosParcela));
        }
        
        await Promise.all(parcelasPromises);
        
        showNotification(`Gasto parcelado em ${numerosParcelas}x criado com sucesso!`, 'success');
        
        return grupoParcelasId;
        
    } catch (error) {
        console.error('Erro ao criar gasto parcelado:', error);
        showNotification('Erro ao criar gasto parcelado', 'error');
        throw error;
    }
}

// Função para integrar parcela com fatura do cartão
async function integrarParcelaComFatura(dadosParcela, cartaoId) {
    if (!cartaoId) return;
    
    try {
        // Buscar cartão
        const cartaoRef = doc(db, 'users', currentUser.uid, 'cartoes', cartaoId);
        const cartaoDoc = await getDoc(cartaoRef);
        
        if (!cartaoDoc.exists()) return;
        
        const cartaoData = cartaoDoc.data();
        const diaVencimento = cartaoData.diaVencimento || 10;
        
        // Calcular período da fatura para esta parcela
        const dataParcela = new Date(dadosParcela.data);
        const anoFatura = dataParcela.getFullYear();
        const mesFatura = dataParcela.getMonth() + 1; // +1 porque getMonth() retorna 0-11
        
        // Criar ID da fatura no formato correto
        const faturaId = `${anoFatura}-${String(mesFatura).padStart(2, '0')}`;
        const faturaRef = doc(db, 'users', currentUser.uid, 'cartoes', cartaoId, 'faturas', faturaId);
        
        const faturaDoc = await getDoc(faturaRef);
        
        if (faturaDoc.exists()) {
            // Atualizar fatura existente - somar apenas o valor da parcela
            const faturaAtual = faturaDoc.data();
            const valorAtual = parseFloat(faturaAtual.valorTotal || faturaAtual.valor || 0);
            const novoValor = valorAtual + parseFloat(dadosParcela.valor);
            
            await updateDoc(faturaRef, {
                valorTotal: novoValor,
                ultimaAtualizacao: serverTimestamp()
            });
        } else {
            // Criar nova fatura com apenas o valor da parcela
            const dataVencimento = new Date(anoFatura, mesFatura, diaVencimento);
            
            await setDoc(faturaRef, {
                valorTotal: parseFloat(dadosParcela.valor),
                mes: mesFatura,
                ano: anoFatura,
                dataVencimento: dataVencimento,
                status: 'Aberta',
                ultimaAtualizacao: serverTimestamp()
            });
        }
        
    } catch (error) {
        console.error('Erro ao integrar parcela com fatura:', error);
    }
}

// Função para buscar gastos parcelados agrupados
async function buscarGastosParcelados() {
    try {
        if (!currentUser) return {};
        
        const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
        const q = query(gastosRef, where('isParcelado', '==', true));
        const querySnapshot = await getDocs(q);
        
        const gastosAgrupados = {};
        
        querySnapshot.forEach(doc => {
            const gasto = { id: doc.id, ...doc.data() };
            const grupoId = gasto.grupoParcelasId;
            
            if (!gastosAgrupados[grupoId]) {
                gastosAgrupados[grupoId] = [];
            }
            
            gastosAgrupados[grupoId].push(gasto);
        });
        
        // Ordenar parcelas dentro de cada grupo
        Object.keys(gastosAgrupados).forEach(grupoId => {
            gastosAgrupados[grupoId].sort((a, b) => a.parcelaAtual - b.parcelaAtual);
        });
        
        return gastosAgrupados;
        
    } catch (error) {
        console.error('Erro ao buscar gastos parcelados:', error);
        return {};
    }
}

// Função para exibir detalhes de parcelamento na página de gastos
function exibirDetalhesParcelamento(gasto) {
    if (!gasto.isParcelado) return '';
    
    const parcela = gasto.parcelaAtual || 1;
    const total = gasto.totalParcelas || 1;
    const valorOriginal = gasto.valorOriginal || gasto.valor;
    
    return `
        <div class="parcelamento-info">
            <small class="text-info">
                <i class="fas fa-credit-card"></i>
                Parcela ${parcela}/${total} de R$ ${parseFloat(valorOriginal).toFixed(2)}
            </small>
        </div>
    `;
}

// Função para calcular valor total restante de um parcelamento
function calcularValorRestanteParcelamento(parcelas, parcelaAtual) {
    const parcelasRestantes = parcelas.filter(p => p.parcelaAtual >= parcelaAtual && !p.pago);
    return parcelasRestantes.reduce((total, parcela) => total + parseFloat(parcela.valor), 0);
}

// Função para marcar parcela como paga e atualizar fatura
async function pagarParcela(parcelaId, dadosPagamento) {
    try {
        const gastoRef = doc(db, 'users', currentUser.uid, 'gastos', parcelaId);
        
        await updateDoc(gastoRef, {
            pago: true,
            dataPagamento: dadosPagamento.dataPagamento || new Date().toISOString().split('T')[0],
            metodoPagamentoReal: dadosPagamento.metodoPagamento,
            atualizadoEm: serverTimestamp()
        });
        
        showNotification('Parcela marcada como paga!', 'success');
        
    } catch (error) {
        console.error('Erro ao pagar parcela:', error);
        showNotification('Erro ao pagar parcela', 'error');
    }
}

// Expor funções globalmente
window.criarGastoParcelado = criarGastoParcelado;
window.buscarGastosParcelados = buscarGastosParcelados;
window.exibirDetalhesParcelamento = exibirDetalhesParcelamento;
window.calcularValorRestanteParcelamento = calcularValorRestanteParcelamento;
window.pagarParcela = pagarParcela;
