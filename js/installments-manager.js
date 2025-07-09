
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
        
        console.log(`Criando gasto parcelado: ${numerosParcelas}x de R$ ${valorParcela.toFixed(2)} = R$ ${valorTotal}`);
        
        // Buscar dados do cartão para calcular vencimentos corretos
        const cartaoRef = doc(db, 'users', currentUser.uid, 'cartoes', dadosGasto.cartaoId);
        const cartaoDoc = await getDoc(cartaoRef);
        
        let diaFechamento = 5;
        let diaVencimento = 10;
        
        if (cartaoDoc.exists()) {
            const cartaoData = cartaoDoc.data();
            diaFechamento = parseInt(cartaoData.fechamento) || diaFechamento;
            diaVencimento = parseInt(cartaoData.vencimento) || diaVencimento;
        }
        
        // Criar cada parcela sequencialmente
        for (let i = 0; i < numerosParcelas; i++) {
            // Calcular data da parcela
            const dataParcela = new Date(dataBase);
            dataParcela.setMonth(dataBase.getMonth() + i);
            
            // Calcular o mês da fatura baseado na data de compra e fechamento
            let mesFatura = dataParcela.getMonth() + 1;
            let anoFatura = dataParcela.getFullYear();
            
            // Se a compra foi após o fechamento, vai para a fatura do próximo mês
            if (dataParcela.getDate() > diaFechamento) {
                mesFatura = mesFatura + 1;
                if (mesFatura > 12) {
                    mesFatura = 1;
                    anoFatura = anoFatura + 1;
                }
            }
            
            const dadosParcela = {
                descricao: `${dadosGasto.descricao} (${i + 1}/${numerosParcelas})`,
                categoria: dadosGasto.categoria,
                valor: parseFloat(valorParcela.toFixed(2)), // Valor individual da parcela
                data: dataParcela.toISOString().split('T')[0],
                metodoPagamento: `Cartão de Crédito`,
                observacao: `${dadosGasto.observacao || ''} - Parcela ${i + 1}/${numerosParcelas} do valor total R$ ${valorTotal.toFixed(2)}`.trim(),
                parcelaAtual: i + 1,
                totalParcelas: numerosParcelas,
                grupoParcelasId: grupoParcelasId,
                valorOriginal: valorTotal,
                isParcelado: true,
                cartaoId: dadosGasto.cartaoId,
                status: 'Pago',
                pago: true,
                parcela: `${i + 1}/${numerosParcelas}`,
                valorTotal: valorTotal.toString(),
                numeroParcela: i + 1,
                criadoEm: serverTimestamp()
            };
            
            // Criar o gasto primeiro para obter o ID
            const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
            const gastoDoc = await addDoc(gastosRef, dadosParcela);
            
            // Integrar apenas o valor da parcela com a fatura do mês correto
            if (dadosGasto.cartaoId) {
                await integrarParcelaComFatura({
                    ...dadosParcela,
                    gastoId: gastoDoc.id,
                    mesFatura: mesFatura,
                    anoFatura: anoFatura
                }, dadosGasto.cartaoId);
            }
        }
        
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
        // Usar o mês e ano calculados na função anterior
        const mesFatura = dadosParcela.mesFatura;
        const anoFatura = dadosParcela.anoFatura;
        
        // Criar ID da fatura no formato correto
        const faturaId = `${anoFatura}-${String(mesFatura).padStart(2, '0')}`;
        const faturaRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId, 'faturas', faturaId);
        
        const faturaDoc = await getDoc(faturaRef);
        const valorParcela = parseFloat(dadosParcela.valor);
        
        console.log(`Integrando parcela ${dadosParcela.parcelaAtual}/${dadosParcela.totalParcelas} de R$ ${valorParcela.toFixed(2)} na fatura ${faturaId}`);
        
        if (faturaDoc.exists()) {
            // Atualizar fatura existente - somar apenas o valor da parcela
            const faturaAtual = faturaDoc.data();
            const valorAtual = parseFloat(faturaAtual.valorTotal || 0);
            const novoValor = valorAtual + valorParcela;
            
            // Obter gastos existentes na fatura
            const gastosExistentes = faturaAtual.gastos || {};
            gastosExistentes[dadosParcela.gastoId] = {
                valor: valorParcela,
                descricao: dadosParcela.descricao,
                categoria: dadosParcela.categoria,
                data: dadosParcela.data,
                parcela: dadosParcela.parcela,
                isParcelado: true,
                grupoParcelasId: dadosParcela.grupoParcelasId,
                valorOriginal: dadosParcela.valorOriginal
            };
            
            await updateDoc(faturaRef, {
                valorTotal: parseFloat(novoValor.toFixed(2)),
                gastos: gastosExistentes,
                ultimaAtualizacao: serverTimestamp()
            });
        } else {
            // Criar nova fatura com apenas o valor da parcela
            const cartaoRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId);
            const cartaoDoc = await getDoc(cartaoRef);
            
            let diaVencimento = 10;
            if (cartaoDoc.exists()) {
                const cartaoData = cartaoDoc.data();
                diaVencimento = parseInt(cartaoData.vencimento) || diaVencimento;
            }
            
            const dataVencimento = new Date(anoFatura, mesFatura - 1, diaVencimento);
            
            const gastosFatura = {};
            gastosFatura[dadosParcela.gastoId] = {
                valor: valorParcela,
                descricao: dadosParcela.descricao,
                categoria: dadosParcela.categoria,
                data: dadosParcela.data,
                parcela: dadosParcela.parcela,
                isParcelado: true,
                grupoParcelasId: dadosParcela.grupoParcelasId,
                valorOriginal: dadosParcela.valorOriginal
            };
            
            await setDoc(faturaRef, {
                valorTotal: valorParcela,
                mes: mesFatura,
                ano: anoFatura,
                dataVencimento: dataVencimento,
                status: 'Aberta',
                pago: false,
                gastos: gastosFatura,
                criadoEm: serverTimestamp(),
                ultimaAtualizacao: serverTimestamp()
            });
        }
        
        console.log(`Parcela ${dadosParcela.parcelaAtual}/${dadosParcela.totalParcelas} de R$ ${valorParcela.toFixed(2)} adicionada à fatura ${faturaId}`);
        
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
    const valorOriginal = gasto.valorOriginal || parseFloat(gasto.valorTotal || 0);
    
    return `
        <div class="parcelamento-info">
            <small class="text-info">
                <i class="fas fa-credit-card"></i>
                Parcela ${parcela}/${total} de R$ ${valorOriginal.toFixed(2)}
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
