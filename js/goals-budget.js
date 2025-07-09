
/**
 * Sistema de Metas e Orçamentos
 * Permite definir metas de economia e limites de gastos por categoria
 */

// Variáveis globais
let metasUsuario = [];
let orcamentosUsuario = [];

// Função para carregar metas do usuário
async function carregarMetas() {
    if (!currentUser) return [];
    
    try {
        const metasRef = collection(db, 'users', currentUser.uid, 'metas');
        const querySnapshot = await getDocs(metasRef);
        
        const metas = [];
        querySnapshot.forEach(doc => {
            metas.push({ id: doc.id, ...doc.data() });
        });
        
        metasUsuario = metas;
        return metas;
    } catch (error) {
        console.error('Erro ao carregar metas:', error);
        return [];
    }
}

// Função para carregar orçamentos do usuário
async function carregarOrcamentos() {
    if (!currentUser) return [];
    
    try {
        const orcamentosRef = collection(db, 'users', currentUser.uid, 'orcamentos');
        const querySnapshot = await getDocs(orcamentosRef);
        
        const orcamentos = [];
        querySnapshot.forEach(doc => {
            orcamentos.push({ id: doc.id, ...doc.data() });
        });
        
        orcamentosUsuario = orcamentos;
        return orcamentos;
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        return [];
    }
}

// Função para abrir modal de gerenciamento de metas
async function abrirModalGerenciarMetas() {
    await carregarMetas();
    
    const formHtml = `
        <div class="metas-manager">
            <div class="tabs">
                <button class="tab-btn active" data-tab="metas">Metas de Economia</button>
                <button class="tab-btn" data-tab="orcamentos">Limites de Gastos</button>
            </div>
            
            <!-- Tab de Metas -->
            <div id="tab-metas" class="tab-content active">
                <div class="metas-section">
                    <h4>Suas Metas de Economia</h4>
                    <div id="metas-list">
                        ${await renderizarMetas()}
                    </div>
                    
                    <div class="add-meta-section">
                        <h5>Nova Meta</h5>
                        <form id="nova-meta-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="meta-titulo">Título da Meta</label>
                                    <input type="text" id="meta-titulo" name="titulo" required maxlength="50" placeholder="Ex: Viagem para o Japão">
                                </div>
                                <div class="form-group">
                                    <label for="meta-valor">Valor Alvo (R$)</label>
                                    <input type="number" step="0.01" id="meta-valor" name="valorAlvo" required min="0" placeholder="5000.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="meta-data-limite">Data Limite</label>
                                    <input type="date" id="meta-data-limite" name="dataLimite" required>
                                </div>
                                <div class="form-group">
                                    <label for="meta-categoria">Categoria</label>
                                    <select id="meta-categoria" name="categoria" required>
                                        <option value="Viagem">Viagem</option>
                                        <option value="Emergência">Emergência</option>
                                        <option value="Educação">Educação</option>
                                        <option value="Casa">Casa</option>
                                        <option value="Veículo">Veículo</option>
                                        <option value="Aposentadoria">Aposentadoria</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="meta-descricao">Descrição (opcional)</label>
                                <textarea id="meta-descricao" name="descricao" rows="2" maxlength="200"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Criar Meta
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Tab de Orçamentos -->
            <div id="tab-orcamentos" class="tab-content">
                <div class="orcamentos-section">
                    <h4>Limites de Gastos por Categoria</h4>
                    <div id="orcamentos-list">
                        ${await renderizarOrcamentos()}
                    </div>
                    
                    <div class="add-orcamento-section">
                        <h5>Novo Limite de Gasto</h5>
                        <form id="novo-orcamento-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="orcamento-categoria">Categoria</label>
                                    <select id="orcamento-categoria" name="categoria" required>
                                        <option value="">Selecione uma categoria</option>
                                        ${await gerarOpcoesCategoriasOrcamento()}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="orcamento-limite">Limite Mensal (R$)</label>
                                    <input type="number" step="0.01" id="orcamento-limite" name="limiteMensal" required min="0" placeholder="1000.00">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="orcamento-alerta">Alertar quando atingir (%)</label>
                                    <input type="number" id="orcamento-alerta" name="percentualAlerta" value="80" min="1" max="100">
                                </div>
                                <div class="form-group">
                                    <label for="orcamento-ativo">Status</label>
                                    <select id="orcamento-ativo" name="ativo">
                                        <option value="true">Ativo</option>
                                        <option value="false">Inativo</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Criar Limite
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .metas-manager {
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .tabs {
                display: flex;
                border-bottom: 1px solid var(--border-color);
                margin-bottom: 1rem;
            }
            
            .tab-btn {
                flex: 1;
                padding: 0.75rem;
                background: none;
                border: none;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.2s ease;
            }
            
            .tab-btn.active {
                border-bottom-color: var(--primary-color);
                color: var(--primary-color);
                font-weight: 600;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .metas-section, .orcamentos-section {
                margin-bottom: 1rem;
            }
            
            .meta-item, .orcamento-item {
                background-color: var(--surface-color);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: 1rem;
                margin-bottom: 1rem;
                position: relative;
            }
            
            .meta-header, .orcamento-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 0.75rem;
            }
            
            .meta-title, .orcamento-title {
                font-weight: 600;
                font-size: 1.1rem;
            }
            
            .meta-progress, .orcamento-progress {
                width: 100%;
                height: 20px;
                background-color: var(--border-color);
                border-radius: 10px;
                overflow: hidden;
                margin: 0.75rem 0;
            }
            
            .meta-progress-bar, .orcamento-progress-bar {
                height: 100%;
                background-color: var(--secondary-color);
                transition: width 0.3s ease;
            }
            
            .meta-info, .orcamento-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 0.75rem;
                font-size: 0.9rem;
            }
            
            .meta-actions, .orcamento-actions {
                position: absolute;
                top: 1rem;
                right: 1rem;
                display: flex;
                gap: 0.25rem;
                opacity: 0.7;
            }
            
            .meta-actions button, .orcamento-actions button {
                background: none;
                border: none;
                padding: 0.25rem;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .meta-actions button:hover, .orcamento-actions button:hover {
                background-color: var(--border-color);
            }
            
            .add-meta-section, .add-orcamento-section {
                background-color: var(--background-color);
                padding: 1rem;
                border-radius: var(--border-radius);
                margin-top: 1rem;
            }
            
            .form-row {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .form-row .form-group {
                flex: 1;
            }
            
            @media (max-width: 768px) {
                .form-row {
                    flex-direction: column;
                }
                
                .meta-header, .orcamento-header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .meta-actions, .orcamento-actions {
                    position: static;
                    margin-top: 0.5rem;
                }
            }
        </style>
    `;
    
    openModal('Metas e Orçamentos', formHtml, () => {
        // Setup das abas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Atualizar botões
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Atualizar conteúdo
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
        
        // Setup dos formulários
        const formMeta = document.getElementById('nova-meta-form');
        if (formMeta) {
            formMeta.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(formMeta);
                const data = Object.fromEntries(formData.entries());
                await criarMeta(data);
            });
        }
        
        const formOrcamento = document.getElementById('novo-orcamento-form');
        if (formOrcamento) {
            formOrcamento.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(formOrcamento);
                const data = Object.fromEntries(formData.entries());
                await criarOrcamento(data);
            });
        }
    });
}

// Função para renderizar metas
async function renderizarMetas() {
    if (metasUsuario.length === 0) {
        return '<p>Você ainda não possui metas de economia.</p>';
    }
    
    return metasUsuario.map(meta => {
        const progresso = ((meta.valorAtual || 0) / meta.valorAlvo) * 100;
        const diasRestantes = Math.ceil((new Date(meta.dataLimite) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="meta-item">
                <div class="meta-header">
                    <div class="meta-title">${meta.titulo}</div>
                    <div class="meta-actions">
                        <button onclick="editarMeta('${meta.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirMeta('${meta.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="meta-progress">
                    <div class="meta-progress-bar" style="width: ${Math.min(progresso, 100)}%"></div>
                </div>
                
                <div class="meta-info">
                    <div>
                        <strong>Progresso:</strong><br>
                        R$ ${(meta.valorAtual || 0).toFixed(2)} / R$ ${meta.valorAlvo.toFixed(2)}
                    </div>
                    <div>
                        <strong>Percentual:</strong><br>
                        ${progresso.toFixed(1)}%
                    </div>
                    <div>
                        <strong>Categoria:</strong><br>
                        ${meta.categoria}
                    </div>
                    <div>
                        <strong>Prazo:</strong><br>
                        ${diasRestantes > 0 ? `${diasRestantes} dias` : 'Vencido'}
                    </div>
                </div>
                
                ${meta.descricao ? `<div style="margin-top: 0.75rem; font-style: italic;">${meta.descricao}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Função para renderizar orçamentos
async function renderizarOrcamentos() {
    if (orcamentosUsuario.length === 0) {
        return '<p>Você ainda não possui limites de gastos definidos.</p>';
    }
    
    // Calcular gastos atuais do mês para cada categoria
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
    const gastosQuery = query(gastosRef,
        where("data", ">=", inicioMes.toISOString().split('T')[0]),
        where("data", "<=", fimMes.toISOString().split('T')[0])
    );
    
    const gastosSnap = await getDocs(gastosQuery);
    const gastosPorCategoria = {};
    
    gastosSnap.forEach(doc => {
        const gasto = doc.data();
        const categoria = gasto.categoria || 'Outros';
        if (!gastosPorCategoria[categoria]) {
            gastosPorCategoria[categoria] = 0;
        }
        gastosPorCategoria[categoria] += parseFloat(gasto.valor);
    });
    
    return orcamentosUsuario.map(orcamento => {
        const gastoAtual = gastosPorCategoria[orcamento.categoria] || 0;
        const percentualGasto = (gastoAtual / orcamento.limiteMensal) * 100;
        const corBarra = percentualGasto >= 100 ? '#f5365c' : 
                        percentualGasto >= orcamento.percentualAlerta ? '#fb6340' : 
                        '#2dce89';
        
        return `
            <div class="orcamento-item">
                <div class="orcamento-header">
                    <div class="orcamento-title">${orcamento.categoria}</div>
                    <div class="orcamento-actions">
                        <button onclick="editarOrcamento('${orcamento.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirOrcamento('${orcamento.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="orcamento-progress">
                    <div class="orcamento-progress-bar" style="width: ${Math.min(percentualGasto, 100)}%; background-color: ${corBarra}"></div>
                </div>
                
                <div class="orcamento-info">
                    <div>
                        <strong>Gasto Atual:</strong><br>
                        R$ ${gastoAtual.toFixed(2)} / R$ ${orcamento.limiteMensal.toFixed(2)}
                    </div>
                    <div>
                        <strong>Percentual:</strong><br>
                        ${percentualGasto.toFixed(1)}%
                    </div>
                    <div>
                        <strong>Status:</strong><br>
                        ${orcamento.ativo ? 'Ativo' : 'Inativo'}
                    </div>
                    <div>
                        <strong>Alerta:</strong><br>
                        ${orcamento.percentualAlerta}%
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Função para gerar opções de categorias para orçamento
async function gerarOpcoesCategoriasOrcamento() {
    const categoriasPadrao = [
        'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
        'Educação', 'Lazer', 'Vestuário', 'Outros'
    ];
    
    const personalizadas = await carregarCategoriasPersonalizadas();
    const nomesPersonalizadas = personalizadas.map(cat => cat.nome);
    
    const todasCategorias = [...categoriasPadrao, ...nomesPersonalizadas];
    
    return todasCategorias.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Função para criar nova meta
async function criarMeta(data) {
    try {
        const metasRef = collection(db, 'users', currentUser.uid, 'metas');
        await addDoc(metasRef, {
            titulo: data.titulo.trim(),
            valorAlvo: parseFloat(data.valorAlvo),
            valorAtual: 0,
            dataLimite: data.dataLimite,
            categoria: data.categoria,
            descricao: data.descricao ? data.descricao.trim() : '',
            criadaEm: serverTimestamp(),
            ativa: true
        });
        
        showNotification('Meta criada com sucesso!', 'success');
        
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarMetas();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao criar meta:', error);
        showNotification('Erro ao criar meta', 'error');
    }
}

// Função para criar novo orçamento
async function criarOrcamento(data) {
    try {
        // Verificar se já existe orçamento para esta categoria
        const orcamentoExistente = orcamentosUsuario.find(orc => orc.categoria === data.categoria);
        if (orcamentoExistente) {
            showNotification('Já existe um orçamento para esta categoria', 'error');
            return;
        }
        
        const orcamentosRef = collection(db, 'users', currentUser.uid, 'orcamentos');
        await addDoc(orcamentosRef, {
            categoria: data.categoria,
            limiteMensal: parseFloat(data.limiteMensal),
            percentualAlerta: parseInt(data.percentualAlerta),
            ativo: data.ativo === 'true',
            criadoEm: serverTimestamp()
        });
        
        showNotification('Orçamento criado com sucesso!', 'success');
        
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarMetas();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        showNotification('Erro ao criar orçamento', 'error');
    }
}

// Funções para editar e excluir (placeholder - implementar conforme necessário)
window.editarMeta = function(metaId) {
    console.log('Editar meta:', metaId);
    // Implementar modal de edição
};

window.excluirMeta = async function(metaId) {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
    
    try {
        const metaRef = firestoreDoc(db, 'users', currentUser.uid, 'metas', metaId);
        await deleteDoc(metaRef);
        showNotification('Meta excluída com sucesso!', 'success');
        
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarMetas();
        }, 500);
    } catch (error) {
        console.error('Erro ao excluir meta:', error);
        showNotification('Erro ao excluir meta', 'error');
    }
};

window.editarOrcamento = function(orcamentoId) {
    console.log('Editar orçamento:', orcamentoId);
    // Implementar modal de edição
};

window.excluirOrcamento = async function(orcamentoId) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    
    try {
        const orcamentoRef = firestoreDoc(db, 'users', currentUser.uid, 'orcamentos', orcamentoId);
        await deleteDoc(orcamentoRef);
        showNotification('Orçamento excluído com sucesso!', 'success');
        
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarMetas();
        }, 500);
    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        showNotification('Erro ao excluir orçamento', 'error');
    }
};

// Expor funções globalmente
window.abrirModalGerenciarMetas = abrirModalGerenciarMetas;
window.carregarMetas = carregarMetas;
window.carregarOrcamentos = carregarOrcamentos;
