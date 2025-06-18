# Passatempo Educativo - Plataforma Web

Esta é uma **API GraphQL** desenvolvida com **NestJS** e **Express**, utilizando **TypeScript**, **TypeORM** e **MongoDB**. A API permite operações de autenticação e gerenciamento de usuários, incluindo criação, listagem, atualização e remoção. A interface GraphQL está disponível via Apollo Playground (BUG).

---

## 📦 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) com [Express](https://expressjs.com/)
- [GraphQL](https://graphql.org/) com [@nestjs/graphql](https://docs.nestjs.com/graphql/quick-start)
- [TypeORM ORM](https://typeorm.io/)
- [MongoDB Atlas](https://www.mongodb.com/)
- Segurança com:

  - CORS
  - Helmet (comentado por padrão durante desenvolvimento)
  - Rate Limiting (comentado por padrão durante desenvolvimento)
  - JWT com Guard (`GqlAuthGuard`)

- Validação com `class-validator` e `class-transformer`
- Tipagem com GraphQL usando `@nestjs/graphql` + `class-validator`

---

## 🚀 Instalação

```bash
git clone https://github.com/duccini/pe-dashboard-backend.git
cd pe-dashboard-backend
npm install
```

---

## 📃️ Banco de Dados

O banco de dados utilizado no desenvolvimento da aplicação é o MongoDB Atlas.

É necessário atualizar as variáveis de ambiente no arquivo `.env`.

---

## ⚙️ Execução

### Desenvolvimento

A aplicação será exposta em:
📍 `http://localhost:3000/graphql`

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start
```

---

## 📘 Interface GraphQL (BUG)

Acesse o Apollo Playground no navegador:

```
http://localhost:3000/graphql
```

Você pode testar **queries** e **mutations** diretamente da interface, incluindo autenticação com JWT.

---

## 🔐 Autenticação

A API utiliza autenticação via **JWT**, com proteção de rotas por `@UseGuards(GqlAuthGuard)`.

- Mutation pública:

  - `login(email: String!, password: String!): AuthResponse`

- Queries/Mutations protegidas:

  - `users`: lista todos os usuários
  - `updateUser(id: ID!, input: UpdateUserInput!)`
  - `deleteUser(id: ID!)`

Para acessar rotas protegidas, adicione o token JWT ao **header** da requisição:

```
Authorization: Bearer <seu-token-jwt>
```

---

## 📂 Estrutura de Pastas

```txt
src/
├── auth/
│   ├── dto/
│   ├── auth.module.ts
│   ├── auth.resolver.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── gql-auth.guard.ts
├── common/
│   ├── dto/
├── users/
│   ├── dto/
│   ├── types/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── users.resolver.ts
├── utils/
├── app.module.ts
├── main.ts
├── .env
```

---

## 🛡️ Segurança

- **CORS**: habilitado para `http://localhost:3000`
- **Helmet**: desabilitado por padrão durante o desenvolvimento para evitar bloqueio do Apollo Playground
- **Rate Limiting**: também desabilitado no desenvolvimento
- **JWT Guard**: protege resolvers via `@UseGuards(GqlAuthGuard)`

As configurações de segurança estão no `main.ts`.

---

## 🥪 Testes

Testes unitários ainda não implementados.
Cobertura de testes com `Jest` está planejada para login, registro e proteção de rotas.

---

## ✨ Exemplos de Requisições GraphQL

### Criar Usuário

```graphql
mutation {
  createUser(
    input: {
      name: "João da Silva"
      email: "joao@email.com"
      password: "senhaSegura123"
      role: "user"
    }
  ) {
    id
    name
    email
    role
  }
}
```

### Login

```graphql
mutation {
  login(email: "joao@email.com", password: "senhaSegura123") {
    accessToken
    user {
      id
      name
      role
    }
  }
}
```

### Buscar Todos os Usuários (com JWT)

> Header:
> `Authorization: Bearer <seu-token-jwt>`

```graphql
query {
  users {
    id
    name
    email
    role
    createdAt
  }
}
```
