# Tech Challenge 04 — Blog Escolar (React Native)

Aplicativo mobile em **React Native (Expo)** para a plataforma de blogging escolar. Professores criam e gerenciam posts, professores e alunos; alunos e visitantes apenas leem os posts.

O repositório contém duas partes:

| Pasta        | Descrição                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `mobile/`    | App React Native (Expo + Expo Router + TypeScript)                                                                 |
| `backend/`   | API REST Node.js/Express/MongoDB — evolução da API do `tech-challenge-02`, com autenticação, professores e alunos |

> **Sobre o backend:** a API do `tech-challenge-02` só possuía os endpoints de `/posts`. Como o desafio exige login, CRUD de professores e de alunos, o backend foi copiado para `backend/` e estendido. Os endpoints de `/posts` mantêm **exatamente o mesmo contrato** (mesmas rotas, campos e respostas); a única diferença é que criar/editar/excluir agora exige um token de professor.

---

## Sumário

1. [Funcionalidades](#funcionalidades)
2. [Pré-requisitos](#pré-requisitos)
3. [Como rodar](#como-rodar)
4. [Credenciais de teste](#credenciais-de-teste)
5. [Guia de uso](#guia-de-uso)
6. [Arquitetura do app](#arquitetura-do-app)
7. [API utilizada](#api-utilizada)
8. [Problemas comuns](#problemas-comuns)

---

## Funcionalidades

Atendimento aos requisitos do desafio:

| # | Requisito                                              | Onde está                                                      |
| - | ------------------------------------------------------ | -------------------------------------------------------------- |
| 1 | Lista de posts (título, autor, descrição) + busca      | Aba **Posts** (`src/app/(app)/(tabs)/index.tsx`)               |
| 2 | Leitura de post                                        | `src/app/(app)/post/[id].tsx` *(comentários são opcionais e não foram implementados)* |
| 3 | Criação de postagens                                   | `src/app/(app)/post-form.tsx`                                  |
| 4 | Edição de postagens (carrega dados atuais)             | `src/app/(app)/post-form.tsx?id=...`                           |
| 5 | Criação de professores                                 | `src/app/(app)/teacher-form.tsx`                               |
| 6 | Edição de professores                                  | `src/app/(app)/teacher-form.tsx?id=...`                        |
| 7 | Listagem **paginada** de professores com editar/excluir | Aba **Professores**                                           |
| 8 | Mesmo CRUD para alunos                                 | Aba **Alunos** e `student-form.tsx`                            |
| 9 | Página administrativa de posts (editar/excluir)        | Aba **Admin**                                                  |
| 10 | Login e autorização (somente professores escrevem)    | Tela de login + rotas protegidas                               |

Extras: sessão persistida (continua logado ao reabrir o app), pull-to-refresh, estados de carregamento/erro/vazio, validação de formulários, confirmação antes de excluir, modo visitante (somente leitura).

**Permissões**

| Perfil       | Ler posts | Criar/editar/excluir posts | Gerenciar professores e alunos |
| ------------ | :-------: | :------------------------: | :----------------------------: |
| Visitante    |    ✅     |             ❌             |               ❌               |
| Aluno        |    ✅     |             ❌             |               ❌               |
| Professor    |    ✅     |             ✅             |               ✅               |

As restrições são aplicadas **nos dois lados**: o app esconde as telas (rotas protegidas) e a API responde `401/403` se alguém tentar burlar.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [Docker](https://www.docker.com/) e Docker Compose (para subir a API + MongoDB) — *ou* um MongoDB local, se preferir rodar a API sem Docker
- Para executar o app, uma das opções:
  - Aplicativo **Expo Go** no celular (iOS/Android), com o celular na **mesma rede Wi-Fi** do computador
  - Android Studio (emulador Android) e/ou Xcode (iOS Simulator)
  - Ou apenas o navegador (`npm run web`), útil para testes rápidos

---

## Como rodar

### 1. Subir o backend (API + MongoDB)

Na raiz do projeto (`tech-challenge-04/`):

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

<details>
<summary>Alternativa: rodar a API sem Docker</summary>

Requer um MongoDB rodando em `localhost:27017`.

```bash
cd backend
npm install
cp .env.example .env
echo "MONGODB_URI=mongodb://localhost:27017/blog_db" >> .env
npm run dev
```

</details>

Na primeira execução, a API cria automaticamente um professor administrador (veja [Credenciais de teste](#credenciais-de-teste)).

Variáveis opcionais (`JWT_SECRET`, `SEED_TEACHER_EMAIL` etc.) podem ser exportadas antes do `docker compose up` — os padrões já funcionam para desenvolvimento.

### 2. Rodar o app mobile

Em outro terminal:

```bash
cd mobile
npm install
npx expo start
```

O terminal exibirá um QR Code e atalhos:

- **Celular físico:** abra o **Expo Go** e escaneie o QR Code (iOS: pela câmera; Android: pelo próprio Expo Go).
- **Android Emulator:** pressione `a`.
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

### Verificações de qualidade

```bash
cd mobile
npm run typecheck      # TypeScript
npx expo-doctor        # saúde do projeto Expo
```

---

## Credenciais de teste

Professor criado automaticamente na primeira execução da API:

| Campo  | Valor            |
| ------ | ---------------- |
| E-mail | `admin@blog.com` |
| Senha  | `admin123`       |

Fluxo sugerido para testar todos os perfis:

1. Entre como professor e cadastre um aluno na aba **Alunos** (ex.: `maria@escola.com` / `123456`).
2. Saia (aba **Perfil → Sair**) e entre com o aluno — apenas leitura é permitido.
3. Ou toque em **Continuar como visitante** na tela de login.

Para trocar o professor inicial, defina `SEED_TEACHER_EMAIL` / `SEED_TEACHER_PASSWORD` antes de subir a API pela primeira vez (ou rode `docker compose down -v` para recriar o banco).

---

## Guia de uso

**Login** — informe e-mail e senha. Professores e alunos usam a mesma tela; o perfil é identificado pela API. "Continuar como visitante" libera apenas a leitura.

**Posts (todos)** — lista com título, autor, data e um resumo do conteúdo. O campo de busca filtra por palavra-chave no título ou conteúdo (com *debounce*). Puxe a lista para baixo para atualizar. Toque em um post para ler o conteúdo completo.

**Professores — o que mais aparece**
- **Novo** (na aba Posts) ou **Novo post** (aba Admin): formulário com título, autor (pré-preenchido com seu nome) e conteúdo.
- **Admin**: lista todos os posts com **Editar** e **Excluir**. Também é possível editar/excluir dentro da leitura do post.
- **Professores / Alunos**: listagem paginada (10 por página, botões *Anterior/Próxima*) com **Editar** e **Excluir**, além do botão **Novo professor/aluno**. Na edição, deixe a senha em branco para mantê-la. Não é possível excluir a própria conta.
- **Perfil**: dados da conta e botão **Sair**.

Se a sessão expirar (token inválido), o app volta automaticamente para o login.

---

## Arquitetura do app

### Tecnologias

- **React Native 0.88 + Expo SDK 58** — componentes funcionais e hooks
- **Expo Router** (navegação por arquivos) com *Protected Routes* para autorização
- **TypeScript** (modo `strict`)
- **Context API** para o estado de autenticação
- **AsyncStorage** para persistir a sessão
- `fetch` nativo encapsulado em um cliente HTTP próprio (sem bibliotecas extras)

### Estrutura de pastas

```
mobile/src
├── app/                     # Rotas (cada arquivo é uma tela)
│   ├── _layout.tsx          # Provider de auth + guard login x app
│   ├── login.tsx
│   └── (app)/               # Área com sessão (professor, aluno ou visitante)
│       ├── _layout.tsx      # Stack; telas de formulário protegidas p/ professor
│       ├── (tabs)/          # Abas: Posts, Admin*, Professores*, Alunos*, Perfil
│       ├── post/[id].tsx    # Leitura do post
│       ├── post-form.tsx    # Criar/editar post (*)
│       ├── teacher-form.tsx # Criar/editar professor (*)
│       └── student-form.tsx # Criar/editar aluno (*)
├── components/              # UI reutilizável (Button, TextField, PostCard, UserListScreen...)
├── context/AuthContext.tsx  # Sessão, login, logout, perfil
├── services/                # Camada de acesso à API (api, auth, posts, users)
├── hooks/                   # useDebounce
├── utils/                   # confirm/alert multiplataforma, formatação
├── config.ts                # URL da API
├── theme.ts                 # Cores, espaçamentos, raios
└── types.ts                 # Tipos de domínio
```

`(*)` = somente professores.

### Decisões principais

- **Autorização em camadas.** `Stack.Protected` / `Tabs.Protected` (Expo Router) removem as rotas que o perfil não pode acessar; a API valida o token e o perfil em cada operação de escrita.
- **Camada de serviços.** As telas nunca chamam `fetch` diretamente. `services/api.ts` centraliza URL base, token `Bearer`, timeout, tradução de erros para português e tratamento de `401` (que encerra a sessão).
- **Telas genéricas para professores e alunos.** `UserListScreen` e `UserFormScreen` recebem o tipo (`teachers` | `students`) e evitam duplicar código, já que os requisitos 5–7 são replicados para alunos.
- **Dados sempre atualizados.** As listas recarregam com `useFocusEffect` ao voltar de um formulário.
- **Sessão.** Token e usuário ficam no AsyncStorage; na abertura, o token é revalidado em `/auth/me`. Sem internet, a sessão salva é mantida.

### Backend (`backend/`)

- Express + Mongoose; senhas com `bcryptjs`; autenticação com JWT (`jsonwebtoken`).
- Modelos `Teacher` e `Student` (gerados por `createUserModel`), `Post` (inalterado).
- Middleware `authenticate` (valida o token) e `authorize('teacher')` (restringe por perfil).

---

## API utilizada

Base: `http://localhost:3000`. Rotas que exigem token enviam `Authorization: Bearer <token>`.

| Método | Rota              | Acesso      | Descrição                                       |
| ------ | ----------------- | ----------- | ----------------------------------------------- |
| POST   | `/auth/login`     | público     | `{ email, password }` → `{ token, data: user }` |
| GET    | `/auth/me`        | autenticado | Dados do usuário logado                         |
| GET    | `/posts`          | público     | Lista posts                                     |
| GET    | `/posts/search?q=`| público     | Busca por título/conteúdo                       |
| GET    | `/posts/:id`      | público     | Lê um post                                      |
| POST   | `/posts`          | professor   | `{ title, content, author }`                    |
| PUT    | `/posts/:id`      | professor   | Edita post                                      |
| DELETE | `/posts/:id`      | professor   | Exclui post                                     |
| GET    | `/teachers?page=&limit=&q=` | professor | Lista paginada (`total`, `page`, `pages`) |
| GET/POST/PUT/DELETE | `/teachers[/:id]` | professor | CRUD de professores (`name`, `email`, `password`, `subject`) |
| GET    | `/students?page=&limit=&q=` | professor | Lista paginada                          |
| GET/POST/PUT/DELETE | `/students[/:id]` | professor | CRUD de alunos (`name`, `email`, `password`, `grade`) |

---

## Problemas comuns

**"Não foi possível conectar à API" no celular**
- Confirme que a API está rodando (`http://localhost:3000/health` no computador).
- Celular e computador precisam estar na **mesma rede Wi-Fi**; redes corporativas/universitárias costumam isolar dispositivos — use um roteador/hotspot pessoal.
- Libere a porta `3000` no firewall do computador.
- Se necessário, defina `EXPO_PUBLIC_API_URL` (veja acima) e reinicie com `npx expo start --clear`.

**Android Emulator não acessa a API** — o emulador enxerga o computador em `10.0.2.2`. O app já usa esse endereço como fallback; se definir `EXPO_PUBLIC_API_URL`, use `http://10.0.2.2:3000`.

**Alterei variáveis `EXPO_PUBLIC_*` e nada mudou** — reinicie com `npx expo start --clear`.

**Porta 3000 em uso** — defina outra porta: `PORT=3001 docker compose up --build` e ajuste `EXPO_PUBLIC_API_URL` para a nova porta.

**Resetar os dados** — `docker compose down -v` apaga o volume do MongoDB; o professor inicial é recriado na próxima subida.
