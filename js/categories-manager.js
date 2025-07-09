
/**
 * Sistema de Gerenciamento de Categorias Personalizadas
 * Permite ao usuário criar, editar e excluir categorias customizadas
 */

// Variáveis globais para categorias
let categoriasPersonalizadas = [];

// Função para carregar categorias personalizadas do Firebase
async function carregarCategoriasPersonalizadas() {
    if (!currentUser) return [];
    
    try {
        const categoriasRef = collection(db, 'users', currentUser.uid, 'categorias');
        const querySnapshot = await getDocs(categoriasRef);
        
        const categorias = [];
        querySnapshot.forEach(doc => {
            categorias.push({ id: doc.id, ...doc.data() });
        });
        
        categoriasPersonalizadas = categorias;
        return categorias;
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        return [];
    }
}

// Função para abrir modal de gerenciamento de categorias
async function abrirModalGerenciarCategorias() {
    await carregarCategoriasPersonalizadas();
    
    const categoriasPadrao = [
        'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
        'Educação', 'Lazer', 'Vestuário', 'Outros'
    ];
    
    const formHtml = `
        <div class="categorias-manager">
            <div class="categorias-section">
                <h4>Categorias Padrão</h4>
                <div class="categorias-grid">
                    ${categoriasPadrao.map(cat => `
                        <div class="categoria-item padrao">
                            <i class="fas fa-tag"></i>
                            <span>${cat}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="categorias-section">
                <h4>Suas Categorias Personalizadas</h4>
                <div id="categorias-personalizadas-list" class="categorias-grid">
                    ${categoriasPersonalizadas.map(cat => `
                        <div class="categoria-item personalizada" data-id="${cat.id}">
                            <i class="fas fa-tag" style="color: ${cat.cor || '#5e72e4'}"></i>
                            <span>${cat.nome}</span>
                            <div class="categoria-actions">
                                <button class="btn-edit-categoria" data-id="${cat.id}" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete-categoria" data-id="${cat.id}" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="add-categoria-section">
                <form id="nova-categoria-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="categoria-nome">Nome da Categoria</label>
                            <input type="text" id="categoria-nome" name="nome" required maxlength="30">
                        </div>
                        <div class="form-group">
                            <label for="categoria-cor">Cor</label>
                            <input type="color" id="categoria-cor" name="cor" value="#5e72e4">
                        </div>
                        <div class="form-group">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Adicionar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <style>
            .categorias-manager {
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .categorias-section {
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .categorias-section:last-child {
                border-bottom: none;
            }
            
            .categorias-section h4 {
                margin-bottom: 1rem;
                color: var(--text-color);
            }
            
            .categorias-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 0.75rem;
            }
            
            .categoria-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                background-color: var(--surface-color);
                transition: all 0.2s ease;
                position: relative;
            }
            
            .categoria-item:hover {
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .categoria-item.padrao {
                background-color: #f8fafc;
            }
            
            .categoria-item.personalizada:hover .categoria-actions {
                opacity: 1;
            }
            
            .categoria-actions {
                position: absolute;
                right: 0.5rem;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                gap: 0.25rem;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .categoria-actions button {
                background: none;
                border: none;
                padding: 0.25rem;
                border-radius: 4px;
                cursor: pointer;
                color: var(--subtle-text-color);
                transition: all 0.2s ease;
            }
            
            .categoria-actions button:hover {
                background-color: var(--border-color);
            }
            
            .btn-edit-categoria:hover {
                color: var(--primary-color);
            }
            
            .btn-delete-categoria:hover {
                color: var(--danger-color);
            }
            
            .add-categoria-section {
                background-color: var(--background-color);
                padding: 1rem;
                border-radius: var(--border-radius);
                margin-top: 1rem;
            }
            
            .form-row {
                display: flex;
                gap: 1rem;
                align-items: end;
            }
            
            .form-row .form-group {
                flex: 1;
            }
            
            .form-row .form-group:last-child {
                flex: 0 0 auto;
            }
            
            @media (max-width: 768px) {
                .categorias-grid {
                    grid-template-columns: 1fr;
                }
                
                .form-row {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .form-row .form-group:last-child {
                    flex: 1;
                }
            }
        </style>
    `;
    
    openModal('Gerenciar Categorias', formHtml, () => {
        // Setup dos eventos após o modal ser aberto
        const form = document.getElementById('nova-categoria-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                await adicionarCategoria(data);
            });
        }
        
        // Eventos para editar categorias
        document.querySelectorAll('.btn-edit-categoria').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const categoriaId = btn.dataset.id;
                editarCategoria(categoriaId);
            });
        });
        
        // Eventos para excluir categorias
        document.querySelectorAll('.btn-delete-categoria').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const categoriaId = btn.dataset.id;
                excluirCategoria(categoriaId);
            });
        });
    });
}

// Função para adicionar nova categoria
async function adicionarCategoria(data) {
    try {
        if (!data.nome || data.nome.trim() === '') {
            showNotification('Nome da categoria é obrigatório', 'error');
            return;
        }
        
        // Verificar se já existe uma categoria com este nome
        const nomeExistente = categoriasPersonalizadas.some(cat => 
            cat.nome.toLowerCase() === data.nome.toLowerCase()
        );
        
        if (nomeExistente) {
            showNotification('Já existe uma categoria com este nome', 'error');
            return;
        }
        
        const categoriasRef = collection(db, 'users', currentUser.uid, 'categorias');
        await addDoc(categoriasRef, {
            nome: data.nome.trim(),
            cor: data.cor || '#5e72e4',
            criadaEm: serverTimestamp()
        });
        
        showNotification('Categoria adicionada com sucesso!', 'success');
        
        // Reabrir o modal para mostrar a nova categoria
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarCategorias();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        showNotification('Erro ao adicionar categoria', 'error');
    }
}

// Função para editar categoria
async function editarCategoria(categoriaId) {
    const categoria = categoriasPersonalizadas.find(cat => cat.id === categoriaId);
    if (!categoria) return;
    
    const formHtml = `
        <form id="editar-categoria-form">
            <div class="form-group">
                <label for="categoria-nome-edit">Nome da Categoria</label>
                <input type="text" id="categoria-nome-edit" name="nome" value="${categoria.nome}" required maxlength="30">
            </div>
            <div class="form-group">
                <label for="categoria-cor-edit">Cor</label>
                <input type="color" id="categoria-cor-edit" name="cor" value="${categoria.cor || '#5e72e4'}">
            </div>
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Salvar Alterações
            </button>
        </form>
    `;
    
    openModal('Editar Categoria', formHtml, () => {
        const form = document.getElementById('editar-categoria-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                await atualizarCategoria(categoriaId, data);
            });
        }
    });
}

// Função para atualizar categoria
async function atualizarCategoria(categoriaId, data) {
    try {
        if (!data.nome || data.nome.trim() === '') {
            showNotification('Nome da categoria é obrigatório', 'error');
            return;
        }
        
        const categoriaRef = firestoreDoc(db, 'users', currentUser.uid, 'categorias', categoriaId);
        await updateDoc(categoriaRef, {
            nome: data.nome.trim(),
            cor: data.cor || '#5e72e4',
            atualizadaEm: serverTimestamp()
        });
        
        showNotification('Categoria atualizada com sucesso!', 'success');
        
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarCategorias();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        showNotification('Erro ao atualizar categoria', 'error');
    }
}

// Função para excluir categoria
async function excluirCategoria(categoriaId) {
    const categoria = categoriasPersonalizadas.find(cat => cat.id === categoriaId);
    if (!categoria) return;
    
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
        return;
    }
    
    try {
        const categoriaRef = firestoreDoc(db, 'users', currentUser.uid, 'categorias', categoriaId);
        await deleteDoc(categoriaRef);
        
        showNotification('Categoria excluída com sucesso!', 'success');
        
        setTimeout(() => {
            closeModal();
            abrirModalGerenciarCategorias();
        }, 500);
        
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        showNotification('Erro ao excluir categoria', 'error');
    }
}

// Função para obter todas as categorias (padrão + personalizadas)
async function obterTodasCategorias() {
    const categoriasPadrao = [
        'Alimentação', 'Transporte', 'Moradia', 'Saúde', 
        'Educação', 'Lazer', 'Vestuário', 'Outros'
    ];
    
    const personalizadas = await carregarCategoriasPersonalizadas();
    const nomesPersonalizadas = personalizadas.map(cat => cat.nome);
    
    return [...categoriasPadrao, ...nomesPersonalizadas];
}

// Expor funções globalmente
window.abrirModalGerenciarCategorias = abrirModalGerenciarCategorias;
window.obterTodasCategorias = obterTodasCategorias;
window.carregarCategoriasPersonalizadas = carregarCategoriasPersonalizadas;
