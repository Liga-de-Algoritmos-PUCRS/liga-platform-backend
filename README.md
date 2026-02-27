# 🚀 Plataforma - Liga de Algoritmos da PUCRS 🚀

Olá! 👋 Bem-vindo(a) ao repositório oficial da nossa plataforma.

## 📖 Sobre o Projeto

Este projeto é o coração do nosso backend e da nossa API. É por aqui que gerenciamos os membros da liga, nossos recursos internos e fazemos todas as integrações necessárias para manter tudo funcionando perfeitamente! ⚙️

## 🛠️ Dependências:

Antes de começar, certifique-se de ter as seguintes ferramentas prontas na sua máquina:

- **Node.js** (v22.14.0) 🟢
- **Nest.js** (11.0.5) 🐈
- **Docker** 🐳

## ⚙️ Setup:

Primeiro, vamos instalar tudo o que o projeto precisa. Abra o seu terminal e rode o comando abaixo:

```bash
npm install
```

## ▶️ Rodando a Aplicação

Agora vem a parte divertida! Siga os passos abaixo para levantar o projeto e começar a codar:

**1. Suba os serviços e o banco de dados:**

```bash
docker compose up -d --build
```

**2. Gere o client do Prisma (nosso ORM):**

```bash
npx prisma generate
```

**3. Tudo pronto! Inicie o servidor em ambiente de desenvolvimento:**

```bash
npm run dev
```
