# FinControle - Sistema de Controle Financeiro Pessoal

Um sistema completo para gerenciar suas finanças pessoais, incluindo controle de gastos, receitas, cartões de crédito e contas bancárias.

## 🚀 Como usar no Replit

1. **Executar o projeto**: Clique no botão "Run" no topo da tela
2. **Acessar**: O sistema será aberto automaticamente no navegador
3. **Fazer login**: Use seu email/senha ou entre com Google

## 📋 Funcionalidades

- ✅ **Dashboard**: Visão geral das finanças
- ✅ **Gastos**: Registro e controle de despesas
- ✅ **Rendas**: Controle de receitas e ganhos
- ✅ **Cartões**: Gerenciamento de cartões de crédito e faturas
- ✅ **Bancos**: Controle de contas bancárias
- ✅ **Relatórios**: Análises e gráficos financeiros
- ✅ **Responsive**: Funciona em computador e celular

## 🔧 Configuração

O sistema já está configurado para uso imediato. As configurações do Firebase estão definidas no arquivo `firebase-config.js`.

### Primeiro Acesso

1. Clique em "Run" para iniciar o sistema
2. Faça seu cadastro na tela inicial
3. Comece adicionando seus bancos e cartões
4. Registre suas receitas e despesas

## 📱 Uso Mobile

O sistema é totalmente responsivo e se adapta automaticamente para dispositivos móveis, mudando de tabelas para cards quando necessário.

## 🎨 Personalização

Para personalizar cores e tema, edite as variáveis CSS no arquivo `css/style.css`:

```css
:root {
    --primary-color: #5e72e4; /* Cor primária */
    --secondary-color: #2dce89; /* Cor secundária */
    --danger-color: #f5365c; /* Cor de perigo */
    /* ... outras variáveis ... */
}
```

## 🔒 Segurança

- Autenticação via Firebase Auth
- Dados armazenados no Firestore
- Login com Google disponível
- Dados isolados por usuário

## 📦 Deploy

Para fazer deploy na produção:

1. Vá para a aba "Deploy" no Replit
2. Clique em "Deploy"
3. Seu sistema ficará disponível 24/7

## 🆘 Suporte

Se encontrar algum problema:
1. Verifique se está logado
2. Recarregue a página
3. Limpe o cache do navegador

---

**Desenvolvido com Firebase + Vanilla JavaScript**