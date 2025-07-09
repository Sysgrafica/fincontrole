
/**
 * Sistema de Lançamentos para Cartões de Crédito
 * Permite criar gastos diretamente na página de cartões com parcelamento
 */

// Função para abrir modal de novo lançamento no cartão
function abrirModalNovoLancamentoCartao(cartaoId, nomeCartao) {
    const formHtml = `
        <form id="lancamento-cartao-form">
            <input type="hidden" name="cartaoId" value="${cartaoId}">
            
            <div class="form-group">
                <label for="lancamento-descricao">Descrição</label>
                <input type="text" id="lancamento-descricao" name="descricao" required class="form-control" 
                       placeholder="Ex: Compra no supermercado">
            </div>
            
            <div class="form-group">
                <label for="lancamento-valor">Valor Total</label>
                <input type="number" id="lancamento-valor" name="valor" step="0.01" required class="form-control" 
                       placeholder="0.00">
            </div>
            
            <div class="form-group">
                <label for="lancamento-categoria">Categoria</label>
                <select id="lancamento-categoria" name="categoria" required class="form-control">
                    <option value="">Selecione a categoria</option>
                    <option value="Alimentação">Alimentação</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Compras">Compras</option>
                    <option value="Casa">Casa</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Outros">Outros</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="lancamento-data">Data da Compra</label>
                <input type="date" id="lancamento-data" name="data" required class="form-control">
            </div>
            
            <div class="form-group">
                <label for="lancamento-parcelas">Parcelamento</label>
                <select id="lancamento-parcelas" name="numeroParcelas" class="form-control">
                    <option value="1">À vista (1x)</option>
                    <option value="2">2x sem juros</option>
                    <option value="3">3x sem juros</option>
                    <option value="4">4x sem juros</option>
                    <option value="5">5x sem juros</option>
                    <option value="6">6x sem juros</option>
                    <option value="7">7x sem juros</option>
                    <option value="8">8x sem juros</option>
                    <option value="9">9x sem juros</option>
                    <option value="10">10x sem juros</option>
                    <option value="11">11x sem juros</option>
                    <option value="12">12x sem juros</option>
                    <option value="13">13x sem juros</option>
                    <option value="14">14x sem juros</option>
                    <option value="15">15x sem juros</option>
                    <option value="16">16x sem juros</option>
                    <option value="17">17x sem juros</option>
                    <option value="18">18x sem juros</option>
                    <option value="19">19x sem juros</option>
                    <option value="20">20x sem juros</option>
                    <option value="21">21x sem juros</option>
                    <option value="22">22x sem juros</option>
                    <option value="23">23x sem juros</option>
                    <option value="24">24x sem juros</option>
                </select>
            </div>
            
            <div class="form-group">
                <div class="parcelamento-preview" id="lancamento-preview" style="display: none;">
                    <small class="text-info">
                        <i class="fas fa-info-circle"></i>
                        <span id="lancamento-preview-text"></span>
                    </small>
                </div>
            </div>
            
            <div class="form-group">
                <label for="lancamento-observacao">Observações (opcional)</label>
                <textarea id="lancamento-observacao" name="observacao" rows="3" class="form-control" 
                          placeholder="Observações adicionais sobre esta compra"></textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" onclick="closeModal()" class="btn btn-secondary">Cancelar</button>
                <button type="submit" class="btn btn-primary">Cadastrar Lançamento</button>
            </div>
        </form>
    `;
    
    openModal(`Novo Lançamento - ${nomeCartao}`, formHtml, setupLancamentoCartaoForm, processarLancamentoCartao);
}

// Função para configurar o formulário de lançamento
function setupLancamentoCartaoForm() {
    // Definir data padrão como hoje
    const dataInput = document.getElementById('lancamento-data');
    if (dataInput) {
        dataInput.value = obterDataAtualBrasilFormatada();
    }
    
    // Configurar preview de parcelamento
    const parcelasSelect = document.getElementById('lancamento-parcelas');
    const valorInput = document.getElementById('lancamento-valor');
    
    function atualizarPreview() {
        const parcelas = parseInt(parcelasSelect.value) || 1;
        const valor = parseFloat(valorInput.value) || 0;
        const preview = document.getElementById('lancamento-preview');
        const previewText = document.getElementById('lancamento-preview-text');
        
        if (parcelas > 1 && valor > 0) {
            const valorParcela = (valor / parcelas).toFixed(2);
            previewText.textContent = `${parcelas}x de R$ ${valorParcela} = R$ ${valor.toFixed(2)}`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }
    
    if (parcelasSelect && valorInput) {
        parcelasSelect.addEventListener('change', atualizarPreview);
        valorInput.addEventListener('input', atualizarPreview);
    }
}

// Função para processar o lançamento no cartão
async function processarLancamentoCartao(dadosForm) {
    try {
        if (!currentUser) {
            showNotification('Você precisa estar logado.', 'error');
            return;
        }
        
        const numeroParcelas = parseInt(dadosForm.numeroParcelas) || 1;
        const valor = parseFloat(dadosForm.valor);
        
        if (!valor || valor <= 0) {
            showNotification('Valor deve ser maior que zero.', 'error');
            return;
        }
        
        // Buscar dados do cartão
        const cartaoRef = doc(db, 'users', currentUser.uid, 'cartoes', dadosForm.cartaoId);
        const cartaoDoc = await getDoc(cartaoRef);
        
        if (!cartaoDoc.exists()) {
            showNotification('Cartão não encontrado.', 'error');
            return;
        }
        
        const cartaoData = cartaoDoc.data();
        
        // Preparar dados do gasto
        const dadosGasto = {
            descricao: dadosForm.descricao,
            valor: valor,
            categoria: dadosForm.categoria,
            data: dadosForm.data,
            observacao: dadosForm.observacao || '',
            cartaoId: dadosForm.cartaoId,
            metodoPagamento: `Cartão de Crédito`,
            numeroParcelas: numeroParcelas
        };
        
        if (numeroParcelas > 1) {
            // Criar gasto parcelado
            await criarGastoParcelado(dadosGasto);
        } else {
            // Criar gasto único
            await criarGastoUnicoCartao(dadosGasto);
        }
        
        closeModal();
        
        // Atualizar a página de cartões se estiver aberta
        if (typeof loadCartoesData === 'function') {
            loadCartoesData();
        }
        
    } catch (error) {
        console.error('Erro ao processar lançamento do cartão:', error);
        showNotification('Erro ao processar lançamento', 'error');
    }
}

// Função para criar gasto único no cartão
async function criarGastoUnicoCartao(dadosGasto) {
    try {
        // Buscar dados do cartão para calcular a fatura correta
        const cartaoRef = doc(db, 'users', currentUser.uid, 'cartoes', dadosGasto.cartaoId);
        const cartaoDoc = await getDoc(cartaoRef);
        
        let diaFechamento = 5;
        let diaVencimento = 10;
        
        if (cartaoDoc.exists()) {
            const cartaoData = cartaoDoc.data();
            diaFechamento = parseInt(cartaoData.fechamento) || diaFechamento;
            diaVencimento = parseInt(cartaoData.vencimento) || diaVencimento;
        }
        
        // Calcular o mês da fatura baseado na data de compra e fechamento
        const dataCompra = new Date(dadosGasto.data);
        let mesFatura = dataCompra.getMonth() + 1;
        let anoFatura = dataCompra.getFullYear();
        
        // Se a compra foi após o fechamento, vai para a fatura do próximo mês
        if (dataCompra.getDate() > diaFechamento) {
            mesFatura = mesFatura + 1;
            if (mesFatura > 12) {
                mesFatura = 1;
                anoFatura = anoFatura + 1;
            }
        }
        
        const dadosCompletos = {
            ...dadosGasto,
            isParcelado: false,
            parcela: 'À vista',
            status: 'Pago',
            pago: true,
            criadoEm: serverTimestamp()
        };
        
        // Criar o gasto
        const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
        const gastoDoc = await addDoc(gastosRef, dadosCompletos);
        
        // Integrar com fatura
        await integrarGastoUnicoComFatura({
            ...dadosCompletos,
            gastoId: gastoDoc.id,
            mesFatura: mesFatura,
            anoFatura: anoFatura
        }, dadosGasto.cartaoId);
        
        showNotification('Lançamento cadastrado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao criar gasto único:', error);
        throw error;
    }
}

// Função para integrar gasto único com fatura
async function integrarGastoUnicoComFatura(dadosGasto, cartaoId) {
    try {
        // Usar o mês e ano calculados na função anterior
        const mesFatura = dadosGasto.mesFatura;
        const anoFatura = dadosGasto.anoFatura;
        
        const faturaId = `${anoFatura}-${String(mesFatura).padStart(2, '0')}`;
        const faturaRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId, 'faturas', faturaId);
        
        const faturaDoc = await getDoc(faturaRef);
        const valorGasto = parseFloat(dadosGasto.valor);
        
        console.log(`Integrando gasto único de R$ ${valorGasto.toFixed(2)} na fatura ${faturaId}`);
        
        if (faturaDoc.exists()) {
            // Atualizar fatura existente
            const faturaAtual = faturaDoc.data();
            const valorAtual = parseFloat(faturaAtual.valorTotal || 0);
            const novoValor = valorAtual + valorGasto;
            
            const gastosExistentes = faturaAtual.gastos || {};
            gastosExistentes[dadosGasto.gastoId] = {
                valor: valorGasto,
                descricao: dadosGasto.descricao,
                categoria: dadosGasto.categoria,
                data: dadosGasto.data,
                parcela: 'À vista',
                isParcelado: false
            };
            
            await updateDoc(faturaRef, {
                valorTotal: parseFloat(novoValor.toFixed(2)),
                gastos: gastosExistentes,
                ultimaAtualizacao: serverTimestamp()
            });
        } else {
            // Criar nova fatura
            const cartaoRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId);
            const cartaoDoc = await getDoc(cartaoRef);
            
            let diaVencimento = 10;
            if (cartaoDoc.exists()) {
                const cartaoData = cartaoDoc.data();
                diaVencimento = parseInt(cartaoData.vencimento) || diaVencimento;
            }
            
            const dataVencimento = new Date(anoFatura, mesFatura - 1, diaVencimento);
            
            const gastosFatura = {};
            gastosFatura[dadosGasto.gastoId] = {
                valor: valorGasto,
                descricao: dadosGasto.descricao,
                categoria: dadosGasto.categoria,
                data: dadosGasto.data,
                parcela: 'À vista',
                isParcelado: false
            };
            
            await setDoc(faturaRef, {
                valorTotal: valorGasto,
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
        
        console.log(`Gasto único de R$ ${valorGasto.toFixed(2)} adicionado à fatura ${faturaId}`);
        
    } catch (error) {
        console.error('Erro ao integrar gasto único com fatura:', error);
    }
}

// Expor funções globalmente
window.abrirModalNovoLancamentoCartao = abrirModalNovoLancamentoCartao;
window.processarLancamentoCartao = processarLancamentoCartao;
window.criarGastoUnicoCartao = criarGastoUnicoCartao;
