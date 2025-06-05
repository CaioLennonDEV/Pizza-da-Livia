# Pizzaria da Livia 🍕

Sistema web completo para gerenciamento de pedidos, produtos e usuários da Pizzaria da Livia.

## Tecnologias Utilizadas

- **Backend:** Node.js com Express.js
- **Banco de Dados:** MongoDB
- **Frontend:** HTML5, CSS3, JavaScript
- **Autenticação:** JWT (JSON Web Tokens)

## Requisitos

- Node.js (v14 ou superior)
- MongoDB
- NPM ou Yarn

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd pizzaria-da-livia
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Copie o conteúdo de `.env.example` e preencha com suas configurações

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── config/         # Configurações do projeto
├── controllers/    # Controladores da aplicação
├── middlewares/    # Middlewares personalizados
├── models/         # Modelos do MongoDB
├── routes/         # Rotas da API
├── services/       # Lógica de negócios
└── utils/          # Utilitários e helpers

public/
├── assets/        # Imagens, fontes e outros recursos
├── css/           # Arquivos de estilo
├── js/            # Scripts do frontend
└── index.html     # Página principal
```

## Funcionalidades Principais

- Gerenciamento de produtos (pizzas, bebidas, acompanhamentos)
- Sistema de pedidos com carrinho de compras
- Cadastro e autenticação de usuários
- Painel administrativo
- Acompanhamento de status de pedidos
- Interface responsiva e moderna

## Licença

Este projeto está sob a licença MIT. 