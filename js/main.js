
// Sistema de Gerenciamento de Finanças Pessoais
// Variáveis globais
let currentUser = null;
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

// Função para obter data atual formatada corretamente
function obterDataAtualBrasilFormatada() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdKJLt7fZH4XHjzBJTFaKbwNaHgXR7aY8",
    authDomain: "fincontrole-7b8d1.firebaseapp.com",
    projectId: "fincontrole-7b8d1",
    storageBucket: "fincontrole-7b8d1.appspot.com",
    messagingSenderId: "484728947385",
    appId: "1:484728947385:web:9f8a3b4c5d6e7f8g9h0i1j"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Sistema de autenticação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, verificando autenticação...');
    
    // Verificar se o Firebase está carregado
    if (typeof firebase === 'undefined') {
        console.error('Firebase não foi carregado');
        showNotification('Erro: Firebase não foi carregado', 'error');
        return;
    }
    
    // Observador de autenticação
    auth.onAuthStateChanged(function(user) {
        console.log('Estado de autenticação mudou:', user ? 'logado' : 'não logado');
        
        if (user) {
            currentUser = user;
            mostrarApp();
            carregarDashboard();
        } else {
            currentUser = null;
            mostrarAuth();
        }
    });
    
    // Configurar handlers de formulários
    configurarFormularios();
    configurarNavegacao();
});

function mostrarAuth() {
    console.log('Mostrando tela de autenticação');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer) {
        authContainer.style.display = 'block';
        authContainer.style.visibility = 'visible';
    }
    
    if (appContainer) {
        appContainer.style.display = 'none';
        appContainer.style.visibility = 'hidden';
    }
}

function mostrarApp() {
    console.log('Mostrando aplicação');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    
    if (authContainer) {
        authContainer.style.display = 'none';
        authContainer.style.visibility = 'hidden';
    }
    
    if (appContainer) {
        appContainer.style.display = 'grid';
        appContainer.style.visibility = 'visible';
    }
    
    // Mostrar página inicial (dashboard)
    mostrarPagina('dashboard');
}

function configurarFormularios() {
    // Configurar tabs de autenticação
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-tab');
            
            // Remover classe active de todas as tabs
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Esconder todos os formulários
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            
            // Mostrar formulário alvo
            const targetForm = document.getElementById(`${target}-form`);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });
    
    // Configurar formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
                showNotification('Login realizado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro no login:', error);
                showNotification('Erro no login: ' + error.message, 'error');
            }
        });
    }
    
    // Configurar formulário de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            
            if (password !== confirmPassword) {
                showNotification('As senhas não coincidem', 'error');
                return;
            }
            
            try {
                await auth.createUserWithEmailAndPassword(email, password);
                showNotification('Conta criada com sucesso!', 'success');
            } catch (error) {
                console.error('Erro no registro:', error);
                showNotification('Erro no registro: ' + error.message, 'error');
            }
        });
    }
}

function configurarNavegacao() {
    // Configurar links da sidebar
    const navLinks = document.querySelectorAll('.sidebar nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('data-page');
            if (page) {
                mostrarPagina(page);
            }
        });
    });
    
    // Configurar logout
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function mostrarPagina(pageName) {
    console.log('Mostrando página:', pageName);
    
    // Remover active de todos os links da navegação
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adicionar active ao link atual
    const currentLink = document.querySelector(`[data-page="${pageName}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
    
    // Esconder todas as páginas
    document.querySelectorAll('.main-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar página atual
    const currentPage = document.getElementById(`${pageName}-page`);
    if (currentPage) {
        currentPage.classList.add('active');
        
        // Carregar dados específicos da página
        switch(pageName) {
            case 'dashboard':
                carregarDashboard();
                break;
            case 'rendas':
                carregarRendas();
                break;
            case 'gastos':
                carregarGastos();
                break;
            case 'cartoes':
                carregarCartoes();
                break;
            case 'bancos':
                carregarBancos();
                break;
        }
    }
    
    // Atualizar título da página
    const topbarTitle = document.querySelector('.topbar h2');
    if (topbarTitle) {
        const titles = {
            'dashboard': 'Dashboard',
            'rendas': 'Rendas',
            'gastos': 'Gastos',
            'cartoes': 'Cartões de Crédito',
            'bancos': 'Contas Bancárias'
        };
        topbarTitle.textContent = titles[pageName] || 'FinControle';
    }
}

async function logout() {
    try {
        await auth.signOut();
        showNotification('Logout realizado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro no logout:', error);
        showNotification('Erro no logout: ' + error.message, 'error');
    }
}

// Funções de carregamento de dados
async function carregarDashboard() {
    console.log('Carregando dashboard...');
    
    if (!currentUser) return;
    
    try {
        // Carregar resumo financeiro
        await carregarResumoFinanceiro();
        
        // Carregar gastos recentes
        await carregarGastosRecentes();
        
        // Carregar próximos vencimentos
        await carregarProximosVencimentos();
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dashboard', 'error');
    }
}

async function carregarResumoFinanceiro() {
    // Implementar carregamento do resumo financeiro
    console.log('Carregando resumo financeiro...');
}

async function carregarGastosRecentes() {
    // Implementar carregamento de gastos recentes
    console.log('Carregando gastos recentes...');
}

async function carregarProximosVencimentos() {
    // Implementar carregamento de próximos vencimentos
    console.log('Carregando próximos vencimentos...');
}

async function carregarRendas() {
    console.log('Carregando rendas...');
    // Implementar carregamento de rendas
}

async function carregarGastos() {
    console.log('Carregando gastos...');
    // Implementar carregamento de gastos
}

async function carregarCartoes() {
    console.log('Carregando cartões...');
    // Implementar carregamento de cartões
}

async function carregarBancos() {
    console.log('Carregando bancos...');
    // Implementar carregamento de bancos
}

// Utilitários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

// Exportar funções globais
window.mostrarPagina = mostrarPagina;
window.formatarMoeda = formatarMoeda;
window.formatarData = formatarData;
window.showNotification = showNotification;
