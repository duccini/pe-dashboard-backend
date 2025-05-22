# Passatempo Educativo - Plataforma Web

Esta é uma API RESTful desenvolvida com **NestJS** e **Fastify**, utilizando **TypeScript**, **Drizzle ORM** e **SQLite**. A API permite operações de autenticação e gerenciamento de usuários, incluindo criação, listagem, atualização e remoção. A documentação da API está disponível via **Swagger**.

---

## 📦 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) com [Fastify](https://www.fastify.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [SQLite](https://www.sqlite.org/)
- [Swagger](https://swagger.io/) para documentação automática
- Segurança com:
  - CORS
  - Helmet
  - Rate Limiting (`@fastify/rate-limit`)
- Validação com `class-validator` e `class-transformer`

---

## 🚀 Instalação

```bash
git clone https://github.com/duccini/pe-dasjboard-backend.git
cd user-management-api
npm install
```

---

## 🗃️ Banco de Dados

O banco de dados padrão é SQLite, ideal para desenvolvimento local.

Para rodar as migrações (caso configuradas):

```bash
npm run drizzle:generate
npm run drizzle:push
```

---

## ⚙️ Execução

### Desenvolviemento

A aplicação será exposta por padrão em http://localhost:3000.

```bash
npm start:dev
```

### Produção

```bash
npm build
npm start
```

---

## 📘 Documentação da API

Acesse a documentação Swagger no endpoint:

```bash
GET http://localhost:3000/api
```

---

## 🔐 Autenticação

A API utiliza autenticação via email e senha com JWT.

- Rota pública:

  - POST /auth/login

- Rotas protegidas:
  - GET /users
  - POST /users
  - PATCH /users/:id
  - DELETE /users/:id

---

## 📂 Estrutura de Pastas

```css
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── dto/
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── app.module.ts
├── app.controller.ts
└── main.ts
```

---

## 🛡️ Segurança

A aplicação implementa os seguintes mecanismos de segurança:

CORS: habilitado globalmente para todas as origens.

Helmet: define cabeçalhos HTTP seguros.

Rate Limiting: limita a 100 requisições por minuto por IP.

Essas proteções estão configuradas no main.ts.

---

## 🧪 Testes

Você pode configurar testes com Vitest ou Jest para validar funcionalidades da aplicação.

---

## ✨ Exemplos de Requisições

Criar usuário

```http
POST /users
Content-Type: application/json

{
  "name": "João da Silva",
  "email": "joao@email.com",
  "password": "senhaSegura123",
  "role": "user"
}
```

Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "senhaSegura123"
}
```

---

## ⚙️ Execução

```bash

```
