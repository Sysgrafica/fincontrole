/**
 * Este script corrige o problema de elementos modais não encontrados
 * alterando as funções para usar o ID correto do modal 'generic-modal' em vez de 'modal'
 * e também corrige o problema de datas sendo registradas com um dia a menos
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicando patch para corrigir IDs dos modais e problemas de data...');
    
    // Definição de variáveis globais necessárias
    if (typeof window.valorHoraNormal === 'undefined') {
        window.valorHoraNormal = 20; // Valor padrão em reais
    }
    
    if (typeof window.valorPercentualHoraExtra === 'undefined') {
        window.valorPercentualHoraExtra = 50; // 50% de adicional
    }
    
    if (typeof window.valorPercentualNoturno === 'undefined') {
        window.valorPercentualNoturno = 20; // 20% de adicional
    }
    
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
    
    // Função para converter uma data para o formato local (Brasil)
    window.converterDataParaLocalCorrigida = function(data) {
        if (!data) return '';
        
        // Verificar se a data já está no formato correto
        if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Adicionar meio-dia para evitar problemas de fuso horário
            const dataObj = new Date(data + 'T12:00:00');
            
            // Usar o fuso horário de São Paulo/Brasil (GMT-3)
            const options = { timeZone: 'America/Sao_Paulo' };
            const dataLocal = new Intl.DateTimeFormat('en-CA', options).format(dataObj);
            
            return dataLocal; // Formato YYYY-MM-DD
        }
        
        return data; // Retornar a data original se não estiver no formato esperado
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
                            try {
                                const { horasExtras, adicionalNoturno } = calcularHorasExtrasENoturno(entradaInput.value, saidaInput.value);
                                console.log(`Cálculo: ${horasExtras}h extras, ${adicionalNoturno}h noturno`);
                            } catch (error) {
                                console.error('Erro ao calcular horas:', error);
                            }
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
                const { horasExtras, adicionalNoturno } = calcularHorasExtrasENoturno(data.entrada, data.saida);
                
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
                const { horasExtras, adicionalNoturno } = calcularHorasExtrasENoturno(data.entrada, data.saida);
                
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
    
    // Sobrescrever a função marcarHoraExtraComoRecebida para usar a data local corrigida
    if (typeof window.marcarHoraExtraComoRecebida === 'function') {
        const originalMarcarFn = window.marcarHoraExtraComoRecebida;
        
        window.marcarHoraExtraComoRecebida = function(id) {
            console.log('Função marcarHoraExtraComoRecebida corrigida chamada', id);
            
            try {
                // Encontrar registro pelo ID
                const horaIndex = horasExtrasRegistros.findIndex(r => r.id === id);
                if (horaIndex === -1) {
                    throw new Error('Registro não encontrado!');
                }
                
                // Atualizar status
                horasExtrasRegistros[horaIndex].recebida = true;
                horasExtrasRegistros[horaIndex].dataRecebimento = window.getDataLocalCorrigida();
                
                console.log('Registro marcado como recebido:', horasExtrasRegistros[horaIndex]);
                
                // Atualizar a visualização
                setTimeout(() => {
                    aplicarFiltros();
                    
                    // Mostrar notificação
                    if (typeof showNotification === 'function') {
                        showNotification('Hora extra marcada como recebida!', 'success');
                    } else {
                        alert('Hora extra marcada como recebida!');
                    }
                }, 100);
            } catch (error) {
                console.error('Erro ao marcar hora extra como recebida:', error);
                alert('Erro ao marcar hora extra como recebida: ' + error.message);
            }
        };
    }
    
    // Função para corrigir as datas nos registros existentes
    function corrigirDatasRegistrosExistentes() {
        if (typeof window.horasExtrasRegistros !== 'undefined' && Array.isArray(window.horasExtrasRegistros)) {
            console.log('Corrigindo datas em registros existentes...');
            
            let contadorCorrecoes = 0;
            
            window.horasExtrasRegistros.forEach((registro, index) => {
                // Verificar se a data do registro precisa ser corrigida
                if (registro.data) {
                    const dataOriginal = registro.data;
                    const dataCorrigida = window.converterDataParaLocalCorrigida(registro.data);
                    
                    if (dataOriginal !== dataCorrigida) {
                        console.log(`Corrigindo data do registro ${index}: ${dataOriginal} -> ${dataCorrigida}`);
                        registro.data = dataCorrigida;
                        contadorCorrecoes++;
                    }
                }
                
                // Verificar se a data de recebimento precisa ser corrigida
                if (registro.dataRecebimento) {
                    const dataOriginal = registro.dataRecebimento;
                    const dataCorrigida = window.converterDataParaLocalCorrigida(registro.dataRecebimento);
                    
                    if (dataOriginal !== dataCorrigida) {
                        console.log(`Corrigindo data de recebimento do registro ${index}: ${dataOriginal} -> ${dataCorrigida}`);
                        registro.dataRecebimento = dataCorrigida;
                        contadorCorrecoes++;
                    }
                }
            });
            
            console.log(`Total de datas corrigidas: ${contadorCorrecoes}`);
            
            // Atualizar a visualização se necessário
            if (contadorCorrecoes > 0 && typeof window.aplicarFiltros === 'function') {
                setTimeout(() => {
                    window.aplicarFiltros();
                }, 200);
            }
        }
    }
    
    // Executar correção de datas nos registros existentes
    setTimeout(corrigirDatasRegistrosExistentes, 500);

    console.log('Patch aplicado com sucesso!');

    // Funções auxiliares para cálculo de horas extras
    if (typeof window.calcularHorasExtrasENoturno === 'undefined') {
        window.calcularHorasExtrasENoturno = function(entrada, saida) {
            // Converter para minutos desde 00:00
            const entradaMinutos = window.converterHoraParaMinutos(entrada);
            const saidaMinutos = window.converterHoraParaMinutos(saida);
            
            // Calcular duração total
            let duracaoTotal;
            if (saidaMinutos < entradaMinutos) {
                // Passou da meia-noite
                duracaoTotal = (24 * 60 - entradaMinutos) + saidaMinutos;
            } else {
                duracaoTotal = saidaMinutos - entradaMinutos;
            }
            
            // Calcular horas extras (considerando jornada normal de 8h)
            const horasExtras = duracaoTotal / 60;
            
            // Calcular adicional noturno (22:00 às 05:00)
            let adicionalNoturno = 0;
            const inicioNoturno = 22 * 60; // 22:00
            const fimNoturno = 5 * 60; // 05:00
            
            // Verificar período noturno
            if (entradaMinutos < fimNoturno || entradaMinutos >= inicioNoturno) {
                // Entrada em período noturno
                if (entradaMinutos >= inicioNoturno && saidaMinutos <= 24 * 60) {
                    // Período totalmente dentro da mesma noite antes da meia-noite
                    adicionalNoturno = (saidaMinutos - entradaMinutos) / 60;
                } else if (entradaMinutos >= inicioNoturno && saidaMinutos > 24 * 60) {
                    // Começa antes da meia-noite e termina no dia seguinte
                    const minutosAntesMeiaNoite = 24 * 60 - entradaMinutos;
                    const minutosDepoisMeiaNoite = Math.min(saidaMinutos % (24 * 60), fimNoturno);
                    adicionalNoturno = (minutosAntesMeiaNoite + minutosDepoisMeiaNoite) / 60;
                } else if (entradaMinutos < fimNoturno && saidaMinutos <= fimNoturno) {
                    // Período totalmente após a meia-noite
                    adicionalNoturno = (saidaMinutos - entradaMinutos) / 60;
                } else if (entradaMinutos < fimNoturno && saidaMinutos > fimNoturno) {
                    // Começa depois da meia-noite mas termina após o período noturno
                    adicionalNoturno = (fimNoturno - entradaMinutos) / 60;
                }
            } else if (saidaMinutos > inicioNoturno || saidaMinutos < fimNoturno) {
                // Entrada fora do período noturno, mas saída no período
                if (saidaMinutos > inicioNoturno && saidaMinutos <= 24 * 60) {
                    // Saída antes da meia-noite
                    adicionalNoturno = (saidaMinutos - inicioNoturno) / 60;
                } else if (saidaMinutos < fimNoturno) {
                    // Saída após a meia-noite
                    adicionalNoturno = ((24 * 60 - inicioNoturno) + saidaMinutos) / 60;
                }
            }
            
            return {
                horasExtras: parseFloat(horasExtras.toFixed(2)),
                adicionalNoturno: parseFloat(adicionalNoturno.toFixed(2))
            };
        };
    }
    
    // Função para converter hora (HH:MM) para minutos desde 00:00
    if (typeof window.converterHoraParaMinutos === 'undefined') {
        window.converterHoraParaMinutos = function(hora) {
            const [horas, minutos] = hora.split(':').map(Number);
            return horas * 60 + minutos;
        };
    }
    
    // Função para calcular valor estimado
    if (typeof window.calcularValorEstimado === 'undefined') {
        window.calcularValorEstimado = function(horasExtras, adicionalNoturno, valorHora) {
            const valorHoraExtra = valorHora * (1 + valorPercentualHoraExtra / 100);
            const valorAdicionalNoturno = valorHora * (valorPercentualNoturno / 100);
            
            const valorTotal = (horasExtras * valorHoraExtra) + (adicionalNoturno * valorAdicionalNoturno);
            return parseFloat(valorTotal.toFixed(2));
        };
    }
}); 