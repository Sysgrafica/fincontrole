
/**
 * Sistema Aprimorado de Notificações
 * Gerencia alertas de vencimentos, limites e metas
 */

// Função para verificar e exibir alertas importantes
async function verificarAlertas() {
    if (!currentUser) return;
    
    try {
        // Verificar gastos próximos do vencimento
        await verificarGastosVencendo();
        
        // Verificar limites de orçamento
        await verificarLimitesOrcamento();
        
        // Verificar metas próximas do prazo
        await verificarMetasVencendo();
        
        // Verificar faturas de cartão vencendo
        await verificarFaturasVencendo();
        
    } catch (error) {
        console.error('Erro ao verificar alertas:', error);
    }
}

// Verificar gastos próximos do vencimento
async function verificarGastosVencendo() {
    const hoje = new Date();
    const em3Dias = new Date(hoje.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    const gastosRef = collection(db, 'users', currentUser.uid, 'gastos');
    const q = query(gastosRef,
        where("data", ">=", hoje.toISOString().split('T')[0]),
        where("data", "<=", em3Dias.toISOString().split('T')[0]),
        where("pago", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        const gastosVencendo = [];
        querySnapshot.forEach(doc => {
            gastosVencendo.push(doc.data());
        });
        
        if (gastosVencendo.length > 0) {
            const total = gastosVencendo.reduce((acc, gasto) => acc + parseFloat(gasto.valor), 0);
            showNotification(
                `Você tem ${gastosVencendo.length} gasto(s) vencendo nos próximos 3 dias (Total: R$ ${total.toFixed(2)})`,
                'warning'
            );
        }
    }
}

// Verificar limites de orçamento
async function verificarLimitesOrcamento() {
    const orcamentosRef = collection(db, 'users', currentUser.uid, 'orcamentos');
    const orcamentosSnap = await getDocs(orcamentosRef);
    
    if (orcamentosSnap.empty) return;
    
    // Calcular gastos do mês atual por categoria
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
    
    // Verificar cada orçamento
    orcamentosSnap.forEach(doc => {
        const orcamento = doc.data();
        if (!orcamento.ativo) return;
        
        const gastoAtual = gastosPorCategoria[orcamento.categoria] || 0;
        const percentualGasto = (gastoAtual / orcamento.limiteMensal) * 100;
        
        if (percentualGasto >= 100) {
            showNotification(
                `⚠️ Orçamento de ${orcamento.categoria} foi ultrapassado! (${percentualGasto.toFixed(1)}%)`,
                'error'
            );
        } else if (percentualGasto >= orcamento.percentualAlerta) {
            showNotification(
                `⚠️ Você está próximo do limite de ${orcamento.categoria}: ${percentualGasto.toFixed(1)}%`,
                'warning'
            );
        }
    });
}

// Verificar metas próximas do prazo
async function verificarMetasVencendo() {
    const metasRef = collection(db, 'users', currentUser.uid, 'metas');
    const metasSnap = await getDocs(metasRef);
    
    if (metasSnap.empty) return;
    
    const hoje = new Date();
    
    metasSnap.forEach(doc => {
        const meta = doc.data();
        if (!meta.ativa) return;
        
        const dataLimite = new Date(meta.dataLimite);
        const diasRestantes = Math.ceil((dataLimite - hoje) / (1000 * 60 * 60 * 24));
        const progresso = ((meta.valorAtual || 0) / meta.valorAlvo) * 100;
        
        if (diasRestantes <= 7 && diasRestantes > 0 && progresso < 90) {
            showNotification(
                `🎯 Meta "${meta.titulo}" vence em ${diasRestantes} dias e está ${progresso.toFixed(1)}% completa`,
                'info'
            );
        } else if (diasRestantes <= 0 && progresso < 100) {
            showNotification(
                `⏰ Meta "${meta.titulo}" venceu! Progresso: ${progresso.toFixed(1)}%`,
                'warning'
            );
        }
    });
}

// Verificar faturas de cartão vencendo
async function verificarFaturasVencendo() {
    const cartoesRef = collection(db, 'users', currentUser.uid, 'cartoes');
    const cartoesSnap = await getDocs(cartoesRef);
    
    if (cartoesSnap.empty) return;
    
    const hoje = new Date();
    const em7Dias = new Date(hoje.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    for (const cartaoDoc of cartoesSnap.docs) {
        const cartao = cartaoDoc.data();
        
        // Verificar faturas em aberto
        const faturasRef = collection(db, 'users', currentUser.uid, 'cartoes', cartaoDoc.id, 'faturas');
        const faturasQuery = query(faturasRef, where("status", "in", ["Aberta", "Vencida"]));
        const faturasSnap = await getDocs(faturasQuery);
        
        faturasSnap.forEach(faturaDoc => {
            const fatura = faturaDoc.data();
            if (fatura.valorTotal && fatura.valorTotal > 0) {
                const dataVencimento = new Date(fatura.dataVencimento);
                const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));
                
                if (diasRestantes <= 7 && diasRestantes > 0) {
                    showNotification(
                        `💳 Fatura do ${cartao.nome} vence em ${diasRestantes} dias (R$ ${fatura.valorTotal.toFixed(2)})`,
                        'warning'
                    );
                } else if (diasRestantes <= 0) {
                    showNotification(
                        `💳 Fatura do ${cartao.nome} está vencida! (R$ ${fatura.valorTotal.toFixed(2)})`,
                        'error'
                    );
                }
            }
        });
    }
}

// Função para criar notificação persistente
function criarNotificacaoPersistente(titulo, mensagem, tipo = 'info', acoes = []) {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${tipo} persistent`;
    
    const iconClass = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    }[tipo];
    
    notification.innerHTML = `
        <div class="notification-header">
            <i class="fas ${iconClass}"></i>
            <strong>${titulo}</strong>
            <button class="notification-close">&times;</button>
        </div>
        <div class="notification-body">
            ${mensagem}
        </div>
        ${acoes.length > 0 ? `
            <div class="notification-actions">
                ${acoes.map(acao => `
                    <button class="notification-btn ${acao.classe || ''}" onclick="${acao.onclick}">
                        ${acao.texto}
                    </button>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    // Adicionar evento de fechamento
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    container.appendChild(notification);
    
    // Estilo adicional para notificações persistentes
    const style = document.createElement('style');
    style.textContent = `
        .notification.persistent {
            position: relative;
            animation: none;
            opacity: 1;
            transform: none;
            margin-bottom: 1rem;
            max-width: 400px;
        }
        
        .notification-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: auto;
            font-size: 1.2rem;
        }
        
        .notification-actions {
            margin-top: 0.75rem;
            display: flex;
            gap: 0.5rem;
        }
        
        .notification-btn {
            padding: 0.25rem 0.75rem;
            border: 1px solid rgba(255,255,255,0.3);
            background: rgba(255,255,255,0.1);
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
        }
        
        .notification-btn:hover {
            background: rgba(255,255,255,0.2);
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
}

// Executar verificação de alertas quando a aplicação carrega
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar a autenticação e depois verificar alertas
    const verificarQuandoLogado = setInterval(() => {
        if (window.currentUser) {
            setTimeout(verificarAlertas, 2000);
            clearInterval(verificarQuandoLogado);
        }
    }, 1000);
    
    // Verificar alertas periodicamente (a cada 5 minutos)
    setInterval(() => {
        if (window.currentUser) {
            verificarAlertas();
        }
    }, 5 * 60 * 1000);
});

// Expor funções globalmente
window.verificarAlertas = verificarAlertas;
window.criarNotificacaoPersistente = criarNotificacaoPersistente;
