
/**
 * Sistema de Backup e Restauração
 * Permite exportar e importar todos os dados do usuário
 */

// Função para exportar todos os dados
async function exportarDados() {
    if (!currentUser) {
        showNotification('Você precisa estar logado para exportar dados', 'error');
        return;
    }
    
    try {
        // Mostrar loading
        openModal('Exportando Dados', `
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Preparando seus dados para exportação...</p>
                <div id="export-progress"></div>
            </div>
        `);
        
        const progressDiv = document.getElementById('export-progress');
        const dadosExportacao = {
            versao: '1.0',
            dataExportacao: new Date().toISOString(),
            usuario: {
                uid: currentUser.uid,
                email: currentUser.email,
                nome: currentUser.displayName
            },
            dados: {}
        };
        
        // 1. Exportar gastos
        progressDiv.innerHTML = '<p>Exportando gastos...</p>';
        const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
        const gastosSnap = await getDocs(gastosRef);
        dadosExportacao.dados.gastos = [];
        gastosSnap.forEach(doc => {
            dadosExportacao.dados.gastos.push({ id: doc.id, ...doc.data() });
        });
        
        // 2. Exportar rendas
        progressDiv.innerHTML = '<p>Exportando rendas...</p>';
        const rendasRef = collection(db, 'users', currentUser.uid, 'rendas');
        const rendasSnap = await getDocs(rendasRef);
        dadosExportacao.dados.rendas = [];
        rendasSnap.forEach(doc => {
            dadosExportacao.dados.rendas.push({ id: doc.id, ...doc.data() });
        });
        
        // 3. Exportar bancos
        progressDiv.innerHTML = '<p>Exportando bancos...</p>';
        const bancosRef = collection(db, 'users', currentUser.uid, 'bancos');
        const bancosSnap = await getDocs(bancosRef);
        dadosExportacao.dados.bancos = [];
        bancosSnap.forEach(doc => {
            dadosExportacao.dados.bancos.push({ id: doc.id, ...doc.data() });
        });
        
        // 4. Exportar cartões
        progressDiv.innerHTML = '<p>Exportando cartões...</p>';
        const cartoesRef = collection(db, 'users', currentUser.uid, 'cartoes');
        const cartoesSnap = await getDocs(cartoesRef);
        dadosExportacao.dados.cartoes = [];
        
        for (const cartaoDoc of cartoesSnap.docs) {
            const cartaoData = { id: cartaoDoc.id, ...cartaoDoc.data() };
            
            // Exportar faturas do cartão
            const faturasRef = collection(db, 'users', currentUser.uid, 'cartoes', cartaoDoc.id, 'faturas');
            const faturasSnap = await getDocs(faturasRef);
            cartaoData.faturas = [];
            
            for (const faturaDoc of faturasSnap.docs) {
                const faturaData = { id: faturaDoc.id, ...faturaDoc.data() };
                
                // Exportar lançamentos da fatura
                const lancamentosRef = collection(db, 'users', currentUser.uid, 'cartoes', cartaoDoc.id, 'faturas', faturaDoc.id, 'lancamentos');
                const lancamentosSnap = await getDocs(lancamentosRef);
                faturaData.lancamentos = [];
                lancamentosSnap.forEach(lancDoc => {
                    faturaData.lancamentos.push({ id: lancDoc.id, ...lancDoc.data() });
                });
                
                cartaoData.faturas.push(faturaData);
            }
            
            dadosExportacao.dados.cartoes.push(cartaoData);
        }
        
        // 5. Exportar categorias personalizadas
        progressDiv.innerHTML = '<p>Exportando categorias...</p>';
        const categoriasRef = collection(db, 'users', currentUser.uid, 'categorias');
        const categoriasSnap = await getDocs(categoriasRef);
        dadosExportacao.dados.categorias = [];
        categoriasSnap.forEach(doc => {
            dadosExportacao.dados.categorias.push({ id: doc.id, ...doc.data() });
        });
        
        // Preparar arquivo para download
        progressDiv.innerHTML = '<p>Preparando arquivo...</p>';
        const dadosJson = JSON.stringify(dadosExportacao, null, 2);
        const blob = new Blob([dadosJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const dataFormatada = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        const nomeArquivo = `fincontrole-backup-${dataFormatada}.json`;
        
        // Criar link de download
        const linkDownload = document.createElement('a');
        linkDownload.href = url;
        linkDownload.download = nomeArquivo;
        document.body.appendChild(linkDownload);
        linkDownload.click();
        document.body.removeChild(linkDownload);
        URL.revokeObjectURL(url);
        
        // Mostrar resultado
        progressDiv.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="color: green; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Dados exportados com sucesso!</p>
                <p><strong>Arquivo:</strong> ${nomeArquivo}</p>
                <p><strong>Total de registros:</strong></p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Gastos: ${dadosExportacao.dados.gastos.length}</li>
                    <li>Rendas: ${dadosExportacao.dados.rendas.length}</li>
                    <li>Bancos: ${dadosExportacao.dados.bancos.length}</li>
                    <li>Cartões: ${dadosExportacao.dados.cartoes.length}</li>
                    <li>Categorias: ${dadosExportacao.dados.categorias.length}</li>
                </ul>
                <button onclick="closeModal()" class="btn btn-primary" style="margin-top: 1rem;">Fechar</button>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showNotification('Erro ao exportar dados: ' + error.message, 'error');
        closeModal();
    }
}

// Função para importar dados
async function importarDados() {
    if (!currentUser) {
        showNotification('Você precisa estar logado para importar dados', 'error');
        return;
    }
    
    const formHtml = `
        <form id="import-form">
            <div class="form-group">
                <label for="backup-file">Selecione o arquivo de backup (.json)</label>
                <input type="file" id="backup-file" accept=".json" required>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="sobrescrever-dados" name="sobrescrever">
                    Sobrescrever dados existentes (cuidado: isso apagará todos os dados atuais)
                </label>
            </div>
            
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Atenção:</strong> A importação irá adicionar os dados do backup aos seus dados atuais. 
                Se marcar a opção "Sobrescrever", todos os dados atuais serão perdidos.
            </div>
            
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-upload"></i> Importar Dados
            </button>
        </form>
    `;
    
    openModal('Importar Dados', formHtml, () => {
        const form = document.getElementById('import-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await processarImportacao();
            });
        }
    });
}

// Função para processar a importação
async function processarImportacao() {
    const fileInput = document.getElementById('backup-file');
    const sobrescrever = document.getElementById('sobrescrever-dados').checked;
    
    if (!fileInput.files[0]) {
        showNotification('Selecione um arquivo de backup', 'error');
        return;
    }
    
    try {
        // Ler arquivo
        const file = fileInput.files[0];
        const text = await file.text();
        const dadosBackup = JSON.parse(text);
        
        // Validar formato do backup
        if (!dadosBackup.versao || !dadosBackup.dados) {
            throw new Error('Arquivo de backup inválido');
        }
        
        // Confirmar importação
        if (!confirm(`Tem certeza que deseja importar os dados? ${sobrescrever ? 'TODOS OS DADOS ATUAIS SERÃO PERDIDOS!' : 'Os dados serão adicionados aos existentes.'}`)) {
            return;
        }
        
        // Mostrar progresso
        openModal('Importando Dados', `
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Importando seus dados...</p>
                <div id="import-progress"></div>
            </div>
        `);
        
        const progressDiv = document.getElementById('import-progress');
        
        // Se sobrescrever, limpar dados existentes
        if (sobrescrever) {
            progressDiv.innerHTML = '<p>Limpando dados existentes...</p>';
            await limparDadosUsuario();
        }
        
        // Importar cada tipo de dado
        const batch = writeBatch(db);
        let operacoes = 0;
        
        // 1. Importar categorias primeiro
        if (dadosBackup.dados.categorias) {
            progressDiv.innerHTML = '<p>Importando categorias...</p>';
            for (const categoria of dadosBackup.dados.categorias) {
                const { id, ...categoriaData } = categoria;
                const categoriaRef = firestoreDoc(db, 'users', currentUser.uid, 'categorias', id);
                batch.set(categoriaRef, categoriaData);
                operacoes++;
            }
        }
        
        // 2. Importar bancos
        if (dadosBackup.dados.bancos) {
            progressDiv.innerHTML = '<p>Importando bancos...</p>';
            for (const banco of dadosBackup.dados.bancos) {
                const { id, ...bancoData } = banco;
                const bancoRef = firestoreDoc(db, 'users', currentUser.uid, 'bancos', id);
                batch.set(bancoRef, bancoData);
                operacoes++;
            }
        }
        
        // 3. Importar gastos
        if (dadosBackup.dados.gastos) {
            progressDiv.innerHTML = '<p>Importando gastos...</p>';
            for (const gasto of dadosBackup.dados.gastos) {
                const { id, ...gastoData } = gasto;
                const gastoRef = firestoreDoc(db, 'users', currentUser.uid, 'gastos', id);
                batch.set(gastoRef, gastoData);
                operacoes++;
            }
        }
        
        // 4. Importar rendas
        if (dadosBackup.dados.rendas) {
            progressDiv.innerHTML = '<p>Importando rendas...</p>';
            for (const renda of dadosBackup.dados.rendas) {
                const { id, ...rendaData } = renda;
                const rendaRef = firestoreDoc(db, 'users', currentUser.uid, 'rendas', id);
                batch.set(rendaRef, rendaData);
                operacoes++;
            }
        }
        
        // Executar batch das operações básicas
        if (operacoes > 0) {
            await batch.commit();
        }
        
        // 5. Importar cartões e faturas (operação separada devido à complexidade)
        if (dadosBackup.dados.cartoes) {
            progressDiv.innerHTML = '<p>Importando cartões e faturas...</p>';
            for (const cartao of dadosBackup.dados.cartoes) {
                const { id: cartaoId, faturas, ...cartaoData } = cartao;
                
                // Criar cartão
                const cartaoRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId);
                await setDoc(cartaoRef, cartaoData);
                
                // Importar faturas do cartão
                if (faturas) {
                    for (const fatura of faturas) {
                        const { id: faturaId, lancamentos, ...faturaData } = fatura;
                        
                        // Criar fatura
                        const faturaRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId, 'faturas', faturaId);
                        await setDoc(faturaRef, faturaData);
                        
                        // Importar lançamentos da fatura
                        if (lancamentos) {
                            for (const lancamento of lancamentos) {
                                const { id: lancamentoId, ...lancamentoData } = lancamento;
                                const lancamentoRef = firestoreDoc(db, 'users', currentUser.uid, 'cartoes', cartaoId, 'faturas', faturaId, 'lancamentos', lancamentoId);
                                await setDoc(lancamentoRef, lancamentoData);
                            }
                        }
                    }
                }
            }
        }
        
        // Mostrar resultado
        progressDiv.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="color: green; font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Dados importados com sucesso!</p>
                <button onclick="closeModal(); window.location.reload();" class="btn btn-primary" style="margin-top: 1rem;">
                    Recarregar Página
                </button>
            </div>
        `;
        
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        showNotification('Erro ao importar dados: ' + error.message, 'error');
        closeModal();
    }
}

// Função para limpar todos os dados do usuário
async function limparDadosUsuario() {
    const colecoes = ['gastos', 'rendas', 'bancos', 'categorias'];
    
    for (const colecao of colecoes) {
        const ref = collection(db, 'users', currentUser.uid, colecao);
        const snapshot = await getDocs(ref);
        
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        if (snapshot.docs.length > 0) {
            await batch.commit();
        }
    }
    
    // Limpar cartões e suas subcoleções
    const cartoesRef = collection(db, 'users', currentUser.uid, 'cartoes');
    const cartoesSnapshot = await getDocs(cartoesRef);
    
    for (const cartaoDoc of cartoesSnapshot.docs) {
        // Limpar faturas do cartão
        const faturasRef = collection(db, 'users', currentUser.uid, 'cartoes', cartaoDoc.id, 'faturas');
        const faturasSnapshot = await getDocs(faturasRef);
        
        for (const faturaDoc of faturasSnapshot.docs) {
            // Limpar lançamentos da fatura
            const lancamentosRef = collection(db, 'users', currentUser.uid, 'cartoes', cartaoDoc.id, 'faturas', faturaDoc.id, 'lancamentos');
            const lancamentosSnapshot = await getDocs(lancamentosRef);
            
            const lancamentosBatch = writeBatch(db);
            lancamentosSnapshot.docs.forEach(lancDoc => {
                lancamentosBatch.delete(lancDoc.ref);
            });
            
            if (lancamentosSnapshot.docs.length > 0) {
                await lancamentosBatch.commit();
            }
            
            // Deletar fatura
            await deleteDoc(faturaDoc.ref);
        }
        
        // Deletar cartão
        await deleteDoc(cartaoDoc.ref);
    }
}

// Expor funções globalmente
window.exportarDados = exportarDados;
window.importarDados = importarDados;
