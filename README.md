# FinControle - Sistema de Controle Financeiro Pessoal

Sistema web para controle financeiro pessoal, permitindo gerenciar gastos, receitas, cartões de crédito e contas bancárias.

## Configuração de Segurança

### Configuração do Firebase

Para proteger suas chaves de API e credenciais, siga estas etapas:

1. Crie um arquivo chamado `firebase-config.js` na raiz do projeto
2. Adicione suas configurações do Firebase neste arquivo:

```javascript
// firebase-config.js
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-messagingSenderId",
    appId: "seu-appId"
};
```

3. **IMPORTANTE**: Este arquivo já está incluído no `.gitignore` para evitar que seja enviado ao repositório. Nunca cometa este arquivo no GitHub.

### Por que isso é importante?

Chaves de API expostas publicamente podem ser utilizadas por terceiros, resultando em:
- Acesso não autorizado ao seu projeto Firebase
- Possíveis cobranças financeiras em sua conta
- Violação de segurança de dados

## Instalação e Uso

1. Clone o repositório
2. Crie o arquivo `firebase-config.js` como descrito acima
3. Abra o arquivo `index.html` em seu navegador

## Funcionalidades

- Controle de gastos e receitas
- Gerenciamento de cartões de crédito e faturas
- Controle de contas bancárias
- Dashboard com visão geral das finanças
- Relatórios e gráficos
- Gastos fixos organizados por mês
- Comprovantes de pagamento 