/**
 * Melhorias no formulário de gastos com suporte a parcelamento
 */

// Função para adicionar campos de parcelamento ao formulário
function adicionarCamposParcelamento(form) {
    const metodoPagamentoSelect = form.querySelector('select[name="metodoPagamento"]');

    if (!metodoPagamentoSelect) return;

    // Criar container para campos de parcelamento
    const parcelamentoContainer = document.createElement('div');
    parcelamentoContainer.id = 'parcelamento-container';
    parcelamentoContainer.style.display = 'none';
    parcelamentoContainer.innerHTML = `
        <div class="form-group">
            <label for="numero-parcelas">Número de Parcelas</label>
            <select id="numero-parcelas" name="numeroParcelas" class="form-control">
                <option value="1">1x (À vista)</option>
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
            <div class="parcelamento-preview" id="parcelamento-preview" style="display: none;">
                <small class="text-info">
                    <i class="fas fa-info-circle"></i>
                    <span id="preview-text"></span>
                </small>
            </div>
        </div>
    `;

    // Inserir após o campo de método de pagamento
    metodoPagamentoSelect.parentNode.insertAdjacentElement('afterend', parcelamentoContainer);

    // Event listeners
    metodoPagamentoSelect.addEventListener('change', function() {
        const isCartaoCredito = this.value === 'Cartão de Crédito';
        parcelamentoContainer.style.display = isCartaoCredito ? 'block' : 'none';

        if (!isCartaoCredito) {
            document.getElementById('numero-parcelas').value = '1';
            atualizarPreviewParcelamento();
        }
    });

    // Event listener para atualizar preview
    const numeroParcelasSelect = document.getElementById('numero-parcelas');
    const valorInput = form.querySelector('input[name="valor"]');

    function atualizarPreviewParcelamento() {
        const numeroParcelas = parseInt(numeroParcelasSelect.value) || 1;
        const valor = parseFloat(valorInput.value) || 0;
        const preview = document.getElementById('parcelamento-preview');
        const previewText = document.getElementById('preview-text');

        if (numeroParcelas > 1 && valor > 0) {
            const valorParcela = (valor / numeroParcelas).toFixed(2);
            previewText.textContent = `${numeroParcelas}x de R$ ${valorParcela} = R$ ${valor.toFixed(2)}`;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    numeroParcelasSelect.addEventListener('change', atualizarPreviewParcelamento);
    valorInput.addEventListener('input', atualizarPreviewParcelamento);
}

// Função para processar formulário com parcelamento
async function processarFormularioComParcelamento(formData) {
    const numeroParcelas = parseInt(formData.get('numeroParcelas')) || 1;
    const metodoPagamento = formData.get('metodoPagamento');

    // Se não for parcelado ou não for cartão de crédito, usar fluxo normal
    if (numeroParcelas <= 1 || metodoPagamento !== 'Cartão de Crédito') {
        return await adicionarGastoNormal(formData);
    }

    // Converter FormData para objeto
    const dadosGasto = {};
    for (let [key, value] of formData.entries()) {
        dadosGasto[key] = value;
    }

    // Garantir que o número de parcelas está correto
    dadosGasto.numeroParcelas = numeroParcelas;

    // Criar gasto parcelado
    return await criarGastoParcelado(dadosGasto);
}

// Função para adicionar gasto normal (não parcelado)
async function adicionarGastoNormal(formData) {
    try {
        if (!currentUser) {
            showNotification('Você precisa estar logado para adicionar gastos.', 'error');
            return;
        }

        const dadosGasto = Object.fromEntries(formData.entries());
        dadosGasto.criadoEm = serverTimestamp();
        dadosGasto.pago = dadosGasto.metodoPagamento !== 'Pendente';
        dadosGasto.isParcelado = false;

        // Se for cartão de crédito, integrar com fatura
        if (dadosGasto.metodoPagamento === 'Cartão de Crédito' && dadosGasto.cartaoId) {
            // Criar o gasto primeiro
            const gastoDoc = await addDoc(collection(db, 'users', currentUser.uid, 'gastos'), dadosGasto);

            // Integrar com fatura do cartão
            const dadosParaFatura = {
                ...dadosGasto,
                gastoId: gastoDoc.id
            };
            await criarGastoUnicoCartao(dadosParaFatura);
        } else {
            // Para outros tipos de pagamento, adicionar normalmente
            await addDoc(collection(db, 'users', currentUser.uid, 'gastos'), dadosGasto);
        }

        showNotification('Gasto adicionado com sucesso!', 'success');

    } catch (error) {
        console.error('Erro ao adicionar gasto:', error);
        showNotification('Erro ao adicionar gasto', 'error');
        throw error;
    }
}

// Expor funções globalmente
window.adicionarCamposParcelamento = adicionarCamposParcelamento;
window.processarFormularioComParcelamento = processarFormularioComParcelamento;