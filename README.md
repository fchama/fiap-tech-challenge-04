# Tech Challenge 04 (React Native)

Aplicativo mobile em **React Native (Expo)**. Professores criam e gerenciam posts, professores e alunos/visitantes apenas leem os posts.

O repo contém duas partes:

| Pasta      | Descrição                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `mobile/`  | App React Native (Expo + Expo Router + TypeScript)                                                        |
| `backend/` | API REST Node.js/Express/MongoDB — API do `tech-challenge-02`, com autenticação para professores e alunos |

---

## Funcionalidades

| #   | Requisito                                               | Onde está                                        |
| --- | ------------------------------------------------------- | ------------------------------------------------ |
| 1   | Lista de posts (título, autor, descrição) + busca       | Aba **Posts** (`src/app/(app)/(tabs)/index.tsx`) |
| 2   | Leitura de post                                         | `src/app/(app)/post/[id].tsx`                    |
| 3   | Criação de postagens                                    | `src/app/(app)/post-form.tsx`                    |
| 4   | Edição de postagens (carrega dados atuais)              | `src/app/(app)/post-form.tsx?id=...`             |
| 5   | Criação de professores                                  | `src/app/(app)/teacher-form.tsx`                 |
| 6   | Edição de professores                                   | `src/app/(app)/teacher-form.tsx?id=...`          |
| 7   | Listagem **paginada** de professores com editar/excluir | Aba **Professores**                              |
| 8   | Mesmo CRUD para alunos                                  | Aba **Alunos** e `student-form.tsx`              |
| 9   | Página administrativa de posts (editar/excluir)         | Aba **Admin**                                    |
| 10  | Login e autorização (somente professores escrevem)      | Tela de login + rotas protegidas                 |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [Docker](https://www.docker.com/) e Docker Compose (para subir a API + MongoDB)
- Para executar o app, uma das opções:
  - Aplicativo **Expo Go** no celular (iOS/Android), com o celular na **mesma rede Wi-Fi** do computador
  - Android Studio (emulador Android) e/ou Xcode (iOS Simulator)
  - Ou apenas o navegador (`npm run web`), útil para testes rápidos

## Como rodar

### 1. Subir o backend (API + MongoDB)

```bash
docker compose up --build
```

A API ficará disponível em `http://localhost:3000`. Teste em `http://localhost:3000/health`.

Comandos úteis:

```bash
docker compose up --build -d   # em segundo plano
docker compose logs -f api     # acompanhar logs
docker compose down            # encerrar (os dados ficam no volume)
docker compose down -v         # encerrar e apagar o banco
```

Na primeira execução, a API cria automaticamente um professor administrador.

Variáveis opcionais (`JWT_SECRET`, `SEED_TEACHER_EMAIL` etc.) podem ser exportadas antes do `docker compose up` — os padrões já funcionam para desenvolvimento.

### 2. Rodar o app mobile

```bash
cd mobile && npm install && npx expo start
```

O terminal exibirá um QR Code e atalhos:

- **Celular físico:** abra o **Expo Go** e escaneie o QR Code
- **iOS Simulator (macOS):** pressione `i`.
- **Navegador:** pressione `w` (ou rode `npm run web`).

> Se o `npm install` reclamar de conflito de dependências, o arquivo `mobile/.npmrc` (`legacy-peer-deps=true`) já resolve — ele é usado automaticamente.

#### Como o app encontra a API

A URL base é definida em `mobile/src/config.ts`, nesta ordem:

1. Variável `EXPO_PUBLIC_API_URL` (arquivo `mobile/.env`, veja `mobile/.env.example`).
2. IP do computador que serve o Expo (o mesmo usado pelo Expo Go) + porta `3000` — funciona automaticamente no **celular físico** e no **iOS Simulator**.
3. Fallback: `10.0.2.2:3000` no Android Emulator e `localhost:3000` nos demais.

Normalmente **não é preciso configurar nada**. Se a descoberta automática falhar (rede com isolamento de clientes, VPN etc.):

```bash
cd mobile
echo "EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000" > .env
npx expo start --clear
```

A URL em uso aparece no rodapé da aba **Perfil**.

## Para teste local

É criado um usuário adm automaticamente na primeira execução da API:

| Campo  | Valor            |
| ------ | ---------------- |
| E-mail | `admin@blog.com` |
| Senha  | `admin123`       |

## Arquitetura do app

- **React Native 0.88 + Expo SDK 58** — componentes funcionais e hooks
- **Expo Router** (navegação por arquivos) com _Protected Routes_ para autorização
- **TypeScript** (modo `strict`)
- **Context API** para o estado de autenticação
- **AsyncStorage** para persistir a sessão
- `fetch` nativo encapsulado em um cliente HTTP próprio (sem bibliotecas extras)
- Express + Mongoose; senhas com `bcryptjs`; autenticação com JWT (`jsonwebtoken`).
- Modelos `Teacher` e `Student` (gerados por `createUserModel`), `Post` (inalterado).
- Middleware `authenticate` (valida o token) e `authorize('teacher')` (restringe por perfil).

## API utilizada

Base: `http://localhost:3000`. Rotas que exigem token enviam `Authorization: Bearer <token>`.

| Método              | Rota                        | Acesso      | Descrição                                                    |
| ------------------- | --------------------------- | ----------- | ------------------------------------------------------------ |
| POST                | `/auth/login`               | público     | `{ email, password }` → `{ token, data: user }`              |
| GET                 | `/auth/me`                  | autenticado | Dados do usuário logado                                      |
| GET                 | `/posts`                    | público     | Lista posts                                                  |
| GET                 | `/posts/search?q=`          | público     | Busca por título/conteúdo                                    |
| GET                 | `/posts/:id`                | público     | Lê um post                                                   |
| POST                | `/posts`                    | professor   | `{ title, content, author }`                                 |
| PUT                 | `/posts/:id`                | professor   | Edita post                                                   |
| DELETE              | `/posts/:id`                | professor   | Exclui post                                                  |
| GET                 | `/teachers?page=&limit=&q=` | professor   | Lista paginada (`total`, `page`, `pages`)                    |
| GET/POST/PUT/DELETE | `/teachers[/:id]`           | professor   | CRUD de professores (`name`, `email`, `password`, `subject`) |
| GET                 | `/students?page=&limit=&q=` | professor   | Lista paginada                                               |
| GET/POST/PUT/DELETE | `/students[/:id]`           | professor   | CRUD de alunos (`name`, `email`, `password`, `grade`)        |
