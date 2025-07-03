/**
 * Script para corrigir os gastos via PIX que não foram corretamente deduzidos da conta bancária.
 * Este script adiciona uma função que verifica todos os gastos do tipo PIX, Transferência ou Cartão de Débito
 * e sincroniza o saldo bancário daqueles que não foram processados corretamente.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Módulo de correção de gastos PIX carregado');
    
    // Função removida - Não adicionar mais botão de correção PIX
    
    // Função principal para verificar e corrigir gastos PIX
    async function verificarECorrigirGastosPix() {
        try {
            if (!currentUser) {
                showNotification('Você precisa estar logado para executar esta operação.', 'error');
                return;
            }
            
            // Mostrar modal de progresso
            openModal('Verificando Gastos PIX', `
                <div style="text-align:center">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Verificando gastos via PIX, Transferência e Cartão de Débito que possam não ter sido deduzidos corretamente do saldo bancário...</p>
                    <div id="progresso-correcao">
                        <p>Aguarde, isso pode levar alguns instantes...</p>
                    </div>
                </div>
            `);
            
            // Buscar todos os gastos PIX, Transferência ou Cartão de Débito
            const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
            const q = query(
                gastosRef, 
                where("metodoPagamento", "in", ["Pix", "Transferência", "Cartão de Débito"]),
                where("status", "==", "Pago")
            );
            
            const progressoElement = document.getElementById('progresso-correcao');
            progressoElement.innerHTML = '<p>Buscando gastos...</p>';
            
            const gastosSnap = await getDocs(q);
            
            if (gastosSnap.empty) {
                progressoElement.innerHTML = '<p>Nenhum gasto via PIX, Transferência ou Débito encontrado.</p>';
                setTimeout(() => closeModal(), 2000);
                return;
            }
            
            progressoElement.innerHTML = `<p>Encontrados ${gastosSnap.size} gastos para verificação.</p>`;
            
            // Agrupar gastos por banco
            const gastosPorBanco = {};
            
            gastosSnap.forEach(doc => {
                const gasto = doc.data();
                if (gasto.bancoId) {
                    if (!gastosPorBanco[gasto.bancoId]) {
                        gastosPorBanco[gasto.bancoId] = [];
                    }
                    gastosPorBanco[gasto.bancoId].push({
                        id: doc.id,
                        ...gasto
                    });
                }
            });
            
            // Se não encontrou nenhum gasto com banco associado
            if (Object.keys(gastosPorBanco).length === 0) {
                progressoElement.innerHTML = '<p>Nenhum gasto com banco associado encontrado.</p>';
                setTimeout(() => closeModal(), 2000);
                return;
            }
            
            // Verificar cada banco
            const bancosIds = Object.keys(gastosPorBanco);
            let totalGastosCorrigidos = 0;
            let totalBancosCorrigidos = 0;
            
            for (const bancoId of bancosIds) {
                const gastosDoBanco = gastosPorBanco[bancoId];
                
                progressoElement.innerHTML = `<p>Verificando ${gastosDoBanco.length} gastos do banco ID: ${bancoId}...</p>`;
                
                const bancoRef = firestoreDoc(db, 'users', currentUser.uid, 'bancos', bancoId);
                const bancoSnap = await getDoc(bancoRef);
                
                if (bancoSnap.exists()) {
                    const banco = bancoSnap.data();
                    const nomeBanco = banco.nome;
                    
                    // Mostrar lista de gastos para o usuário confirmar
                    progressoElement.innerHTML = `
                        <p>Banco: <strong>${nomeBanco}</strong></p>
                        <p>Encontrados ${gastosDoBanco.length} gastos associados a este banco.</p>
                        <p>Deseja verificar e corrigir o saldo considerando estes gastos?</p>
                        <div style="max-height: 200px; overflow-y: auto; margin: 10px 0; border: 1px solid #eee; padding: 10px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; padding: 5px;">Descrição</th>
                                        <th style="text-align: right; padding: 5px;">Valor</th>
                                        <th style="text-align: left; padding: 5px;">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${gastosDoBanco.map(g => `
                                        <tr>
                                            <td style="padding: 5px;">${g.descricao}</td>
                                            <td style="text-align: right; padding: 5px;">R$ ${parseFloat(g.valor).toFixed(2)}</td>
                                            <td style="padding: 5px;">${g.data}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 15px;">
                            <button id="btn-confirmar-correcao-${bancoId}" class="btn btn-primary">Confirmar Correção</button>
                            <button id="btn-pular-banco-${bancoId}" class="btn">Pular Este Banco</button>
                        </div>
                    `;
                    
                    // Aguardar a decisão do usuário
                    await new Promise(resolve => {
                        document.getElementById(`btn-confirmar-correcao-${bancoId}`).addEventListener('click', async () => {
                            // Calcular o total a ser deduzido
                            const totalDeduzir = gastosDoBanco.reduce((acc, gasto) => acc + parseFloat(gasto.valor), 0);
                            
                            // Confirmar com o usuário
                            if (confirm(`Isso irá deduzir R$ ${totalDeduzir.toFixed(2)} do saldo atual do banco ${nomeBanco}. Confirma a operação?`)) {
                                progressoElement.innerHTML = `<p>Atualizando saldo do banco ${nomeBanco}...</p>`;
                                
                                await runTransaction(db, async (transaction) => {
                                    const bancoSnapAtual = await transaction.get(bancoRef);
                                    if (bancoSnapAtual.exists()) {
                                        const saldoAtual = parseFloat(bancoSnapAtual.data().saldo);
                                        const novoSaldo = saldoAtual - totalDeduzir;
                                        transaction.update(bancoRef, { saldo: novoSaldo });
                                    }
                                });
                                
                                totalGastosCorrigidos += gastosDoBanco.length;
                                totalBancosCorrigidos++;
                                
                                showNotification(`Saldo do banco ${nomeBanco} corrigido com sucesso!`, 'success');
                            }
                            resolve();
                        });
                        
                        document.getElementById(`btn-pular-banco-${bancoId}`).addEventListener('click', () => {
                            resolve();
                        });
                    });
                }
            }
            
            // Resumo final
            progressoElement.innerHTML = `
                <p>Correção finalizada!</p>
                <p>Bancos corrigidos: ${totalBancosCorrigidos}</p>
                <p>Total de gastos processados: ${totalGastosCorrigidos}</p>
                <button id="btn-fechar-correcao" class="btn btn-primary" style="margin-top: 15px;">Fechar</button>
            `;
            
            document.getElementById('btn-fechar-correcao').addEventListener('click', () => {
                closeModal();
                if (totalBancosCorrigidos > 0) {
                    // Recarregar a página para mostrar os saldos atualizados
                    setTimeout(() => window.location.reload(), 500);
                }
            });
            
        } catch (error) {
            console.error('Erro ao verificar e corrigir gastos PIX:', error);
            showNotification('Erro ao verificar gastos: ' + error.message, 'error');
            closeModal();
        }
    }
    
    // Função para adicionar botão removida
}); 