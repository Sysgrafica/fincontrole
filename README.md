# FinControle - Sistema de Controle Financeiro Pessoal

Sistema de controle financeiro pessoal com tema Argon Dashboard 2 Tailwind.

## Sobre o Tema

O sistema utiliza o tema Argon Dashboard 2 Tailwind, um tema premium desenvolvido pela Creative Tim. O tema foi adaptado para uso no FinControle, proporcionando uma interface moderna e responsiva.

### Características do Tema

- Design moderno e elegante
- Interface responsiva
- Componentes pré-estilizados
- Paleta de cores harmoniosa
- Efeitos visuais sutis e agradáveis

## Arquivos do Tema

Os arquivos principais do tema são:

- `css/argon-dashboard-tailwind.css` - Estilos principais do tema
- `js/argon-dashboard.js` - Funcionalidades JavaScript do tema
- `css/style.css` - Estilos personalizados complementares

## Como Usar

O tema já está integrado ao sistema. Para utilizar componentes específicos do tema, consulte as classes CSS disponíveis no arquivo `css/argon-dashboard-tailwind.css`.

### Classes Úteis

- `.container` - Container responsivo
- `.card` - Cartões com sombra e bordas arredondadas
- `.btn`, `.btn-primary`, `.btn-secondary` - Botões estilizados
- `.shadow`, `.shadow-sm`, `.shadow-lg` - Diferentes níveis de sombra
- `.rounded`, `.rounded-circle` - Bordas arredondadas

## Personalização

Para personalizar o tema, você pode modificar as variáveis CSS no arquivo `css/style.css`:

```css
:root {
    --primary-color: #5e72e4; /* Cor primária */
    --secondary-color: #2dce89; /* Cor secundária */
    --danger-color: #f5365c; /* Cor de perigo */
    --text-color: #344767; /* Cor de texto */
    --subtle-text-color: #67748e;
    --border-color: #e9ecef;
    --surface-color: #ffffff;
    --background-color: #f8f9fa;
    --shadow: 0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08);
    --border-radius: 8px;
}
```

## Créditos

O tema Argon Dashboard 2 Tailwind foi desenvolvido pela [Creative Tim](https://www.creative-tim.com/product/argon-dashboard-tailwind).

## Licença

Este projeto utiliza o tema Argon Dashboard 2 Tailwind sob a licença MIT.

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