/**
 * Este script corrige o problema de elementos modais não encontrados
 * alterando as funções para usar o ID correto do modal 'generic-modal' em vez de 'modal'
 * e também corrige o problema de datas sendo registradas com um dia a menos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicando patch para corrigir IDs dos modais e problemas de data...');
    
    // Função para obter a data local corrigida no formato YYYY-MM-DD
    window.getDataLocalCorrigida = function() {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    };

    // Sobrescrever todas as chamadas de new Date().toISOString().split('T')[0]
    const originalDateToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = function() {
        // Se estamos tentando obter uma data para um input date, retorne a data local
        const stack = new Error().stack || '';
        if (stack.includes('split') && stack.includes('[0]')) {
            const ano = this.getFullYear();
            const mes = String(this.getMonth() + 1).padStart(2, '0');
            const dia = String(this.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}T00:00:00.000Z`;
        }
        
        // Caso contrário, usar o comportamento original
        return originalDateToISOString.call(this);
    };

    // Corrigir os inputs de data nos formulários
    const corrigirInputsData = function() {
        // Procurar por todos os inputs de data no documento
        document.querySelectorAll('input[type="date"]').forEach(input => {
            // Se for um input de data atual (hoje)
            if (input.value) {
                const dataAtual = new Date();
                const dataInput = new Date(input.value + 'T12:00:00'); // Meio-dia para evitar problemas de fuso horário
                
                // Se a data do input for ontem, corrija para hoje
                if (dataInput.getDate() === dataAtual.getDate() - 1 && 
                    dataInput.getMonth() === dataAtual.getMonth() && 
                    dataInput.getFullYear() === dataAtual.getFullYear()) {
                    input.value = window.getDataLocalCorrigida();
                }
            } else {
                // Se não tiver valor, define para hoje
                input.value = window.getDataLocalCorrigida();
            }
        });
    };

    // Aplicar correção quando um modal é aberto
    const originalOpenModal = window.openModal;
    if (typeof originalOpenModal === 'function') {
        window.openModal = function(title, formHtml, setupCallbackOrSubmitCallback, submitCallbackOrUndefined) {
            // Substituir todas as ocorrências de new Date().toISOString().split('T')[0] por getDataLocalCorrigida()
            formHtml = formHtml.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'window.getDataLocalCorrigida()');
            
            // Chamar a função original
            originalOpenModal(title, formHtml, setupCallbackOrSubmitCallback, submitCallbackOrUndefined);
            
            // Aplicar correção aos inputs de data
            setTimeout(() => {
                // Procurar por todos os inputs de data no modal
                document.querySelectorAll('input[type="date"]').forEach(input => {
                    // Se for um input de data atual (hoje)
                    if (input.value) {
                        const dataAtual = new Date();
                        const dataInput = new Date(input.value + 'T12:00:00'); // Meio-dia para evitar problemas de fuso horário
                        
                        // Se a data do input for ontem, corrija para hoje
                        if (dataInput.getDate() === dataAtual.getDate() - 1 && 
                            dataInput.getMonth() === dataAtual.getMonth() && 
                            dataInput.getFullYear() === dataAtual.getFullYear()) {
                            input.value = window.getDataLocalCorrigida();
                        }
                    } else {
                        // Se não tiver valor, define para hoje
                        input.value = window.getDataLocalCorrigida();
                    }
                });
            }, 100);
        };
    }

    // Sobrescrever a função abrirModalNovaHoraExtra para usar generic-modal e corrigir a data
    if (typeof window.abrirModalNovaHoraExtra === 'function') {
        const originalFn = window.abrirModalNovaHoraExtra;
        
        window.abrirModalNovaHoraExtra = function() {
            console.log('Função abrirModalNovaHoraExtra corrigida chamada');
            const hoje = window.getDataLocalCorrigida();
            
            // Verificar se o modal existe
            const modal = document.getElementById('generic-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            
            if (!modal || !modalTitle || !modalBody) {
                console.error('Elementos do modal não encontrados!');
                alert('Erro ao abrir o formulário. Por favor, recarregue a página.');
                return;
            }
            
            const formHtml = `
                <form id="hora-extra-form">
                    <div class="form-group">
                        <label for="hora-extra-data">Data</label>
                        <input type="date" id="hora-extra-data" name="data" value="${hoje}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="hora-extra-entrada">Hora de Entrada</label>
                            <input type="time" id="hora-extra-entrada" name="entrada" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="hora-extra-saida">Hora de Saída</label>
                            <input type="time" id="hora-extra-saida" name="saida" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="hora-extra-motivo">Motivo</label>
                        <input type="text" id="hora-extra-motivo" name="motivo" required>
                    </div>
                    <div class="form-group">
                        <label for="hora-extra-observacao">Observações (opcional)</label>
                        <textarea id="hora-extra-observacao" name="observacao" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="hora-extra-valor-hora">Valor da Hora (R$)</label>
                        <input type="number" step="0.01" id="hora-extra-valor-hora" name="valorHora" value="${valorHoraNormal}">
                    </div>
                    <button type="submit" class="btn btn-primary">Registrar Hora Extra</button>
                </form>
            `;
            
            try {
                console.log('Abrindo modal manualmente');
                
                // Configurar o modal manualmente
                modalTitle.textContent = 'Nova Hora Extra';
                modalBody.innerHTML = formHtml;
                modal.classList.add('is-open');
                
                // Adicionar evento de submit ao formulário
                const form = modalBody.querySelector('form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        registrarHoraExtra(data);
                    });
                }
                
                console.log('Modal aberto com sucesso');
                
                // Adicionar evento para cálculo automático
                const entradaInput = document.getElementById('hora-extra-entrada');
                const saidaInput = document.getElementById('hora-extra-saida');
                
                if (entradaInput && saidaInput) {
                    const atualizarCalculo = () => {
                        if (entradaInput.value && saidaInput.value) {
                            const { horasExtras, adicionalNoturno } = calcularHorasExtrasENoturno(entradaInput.value, saidaInput.value);
                            console.log(`Cálculo: ${horasExtras}h extras, ${adicionalNoturno}h noturno`);
                        }
                    };
                    
                    entradaInput.addEventListener('change', atualizarCalculo);
                    saidaInput.addEventListener('change', atualizarCalculo);
                }
            } catch (error) {
                console.error('Erro ao abrir modal:', error);
                alert('Erro ao abrir o formulário. Por favor, recarregue a página.');
            }
        };
    }
    
    // Sobrescrever a função abrirModalEditarHoraExtra para usar generic-modal
    if (typeof window.abrirModalEditarHoraExtra === 'function') {
        const originalEditFn = window.abrirModalEditarHoraExtra;
        
        window.abrirModalEditarHoraExtra = function(id) {
            console.log('Função abrirModalEditarHoraExtra corrigida chamada');
            
            // Verificar se o modal existe
            const modal = document.getElementById('generic-modal');
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            
            if (!modal || !modalTitle || !modalBody) {
                console.error('Elementos do modal não encontrados!');
                alert('Erro ao abrir o formulário. Por favor, recarregue a página.');
                return;
            }
            
            // Buscar o registro pelo ID
            const registro = horasExtrasRegistros.find(r => r.id === id);
            if (!registro) {
                console.error('Registro não encontrado!');
                alert('Registro não encontrado!');
                return;
            }
            
            const formHtml = `
                <form id="hora-extra-edit-form">
                    <input type="hidden" name="id" value="${registro.id}">
                    <div class="form-group">
                        <label for="hora-extra-data-edit">Data</label>
                        <input type="date" id="hora-extra-data-edit" name="data" value="${registro.data}" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label for="hora-extra-entrada-edit">Hora de Entrada</label>
                            <input type="time" id="hora-extra-entrada-edit" name="entrada" value="${registro.entrada}" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="hora-extra-saida-edit">Hora de Saída</label>
                            <input type="time" id="hora-extra-saida-edit" name="saida" value="${registro.saida}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="hora-extra-motivo-edit">Motivo</label>
                        <input type="text" id="hora-extra-motivo-edit" name="motivo" value="${registro.motivo}" required>
                    </div>
                    <div class="form-group">
                        <label for="hora-extra-observacao-edit">Observações (opcional)</label>
                        <textarea id="hora-extra-observacao-edit" name="observacao" rows="3">${registro.observacao || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="hora-extra-valor-hora-edit">Valor da Hora (R$)</label>
                        <input type="number" step="0.01" id="hora-extra-valor-hora-edit" name="valorHora" value="${registro.valorHora || valorHoraNormal}">
                    </div>
                    <button type="submit" class="btn btn-primary">Atualizar</button>
                </form>
            `;
            
            try {
                // Configurar o modal manualmente
                modalTitle.textContent = 'Editar Hora Extra';
                modalBody.innerHTML = formHtml;
                modal.classList.add('is-open');
                
                // Adicionar evento de submit ao formulário
                const form = modalBody.querySelector('form');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData.entries());
                        atualizarHoraExtra(data);
                    });
                }
            } catch (error) {
                console.error('Erro ao abrir modal de edição:', error);
            }
        };
    }
    
    // Sobrescrever a função registrarHoraExtra para fechar o modal correto
    if (typeof window.registrarHoraExtra === 'function') {
        const originalRegistrarFn = window.registrarHoraExtra;
        
        window.registrarHoraExtra = function(data) {
            console.log('Função registrarHoraExtra corrigida chamada', data);
            
            try {
                // Calcular horas extras e adicional noturno
                const { horasExtras, adicionalNoturno } = calcularHorasExtras(data.entrada, data.saida);
                
                // Calcular valor estimado
                const valorHora = parseFloat(data.valorHora) || valorHoraNormal;
                const valorEstimado = calcularValorEstimado(horasExtras, adicionalNoturno, valorHora);
                
                // Gerar ID único
                const id = Date.now().toString();
                
                // Criar registro
                const novoRegistro = {
                    id,
                    data: data.data,
                    entrada: data.entrada,
                    saida: data.saida,
                    horasExtras,
                    adicionalNoturno,
                    motivo: data.motivo,
                    observacao: data.observacao || '',
                    valorHora,
                    valorEstimado,
                    recebida: false,
                    dataRecebimento: null
                };
                
                // Adicionar ao array
                horasExtrasRegistros.push(novoRegistro);
                
                console.log('Registro adicionado:', novoRegistro);
                
                // Fechar o modal
                const modal = document.getElementById('generic-modal');
                if (modal) {
                    modal.classList.remove('is-open');
                    const modalBody = document.getElementById('modal-body');
                    if (modalBody) {
                        modalBody.innerHTML = '';
                    }
                }
                
                // Atualizar a visualização
                setTimeout(() => {
                    aplicarFiltros();
                    
                    // Mostrar notificação
                    if (typeof showNotification === 'function') {
                        showNotification('Hora extra registrada com sucesso!', 'success');
                    } else {
                        alert('Hora extra registrada com sucesso!');
                    }
                }, 100);
            } catch (error) {
                console.error('Erro ao registrar hora extra:', error);
                alert('Erro ao registrar hora extra: ' + error.message);
            }
        };
    }
    
    // Sobrescrever a função atualizarHoraExtra para fechar o modal correto
    if (typeof window.atualizarHoraExtra === 'function') {
        const originalAtualizarFn = window.atualizarHoraExtra;
        
        window.atualizarHoraExtra = function(data) {
            console.log('Função atualizarHoraExtra corrigida chamada', data);
            
            try {
                // Calcular horas extras e adicional noturno
                const { horasExtras, adicionalNoturno } = calcularHorasExtras(data.entrada, data.saida);
                
                // Calcular valor estimado
                const valorHora = parseFloat(data.valorHora) || valorHoraNormal;
                const valorEstimado = calcularValorEstimado(horasExtras, adicionalNoturno, valorHora);
                
                // Encontrar registro pelo ID
                const index = horasExtrasRegistros.findIndex(r => r.id === data.id);
                if (index === -1) {
                    throw new Error('Registro não encontrado!');
                }
                
                // Preservar status de recebimento
                const statusRecebida = horasExtrasRegistros[index].recebida;
                const dataRecebimento = horasExtrasRegistros[index].dataRecebimento;
                
                // Atualizar registro
                horasExtrasRegistros[index] = {
                    ...horasExtrasRegistros[index],
                    data: data.data,
                    entrada: data.entrada,
                    saida: data.saida,
                    horasExtras,
                    adicionalNoturno,
                    motivo: data.motivo,
                    observacao: data.observacao || '',
                    valorHora,
                    valorEstimado,
                    recebida: statusRecebida,
                    dataRecebimento: dataRecebimento
                };
                
                console.log('Registro atualizado:', horasExtrasRegistros[index]);
                
                // Fechar o modal
                const modal = document.getElementById('generic-modal');
                if (modal) {
                    modal.classList.remove('is-open');
                    const modalBody = document.getElementById('modal-body');
                    if (modalBody) {
                        modalBody.innerHTML = '';
                    }
                }
                
                // Atualizar a visualização
                setTimeout(() => {
                    aplicarFiltros();
                    
                    // Mostrar notificação
                    if (typeof showNotification === 'function') {
                        showNotification('Hora extra atualizada com sucesso!', 'success');
                    } else {
                        alert('Hora extra atualizada com sucesso!');
                    }
                }, 100);
            } catch (error) {
                console.error('Erro ao atualizar hora extra:', error);
                alert('Erro ao atualizar hora extra: ' + error.message);
            }
        };
    }

    console.log('Patch aplicado com sucesso!');
}); 