usuario do seed
admin@beerank.com
AdminPassword123!

# BeeRank 🐝 — Ranking Colaborativo em Tempo Real

Plataforma interativa de enquetes ordenadas com **ranking colaborativo (Ranked-Choice Voting / Borda Count)** em tempo real, construída com Next.js (App Router + Route Handlers) e Supabase.

---

## 🚀 Funcionalidades

- **Painel do Administrador**:
  - Login seguro com Supabase Auth.
  - Criação de enquetes com título, descrição e opções ranqueáveis.
  - **Controle de Identificação**: Escolha na criação entre **100% Anônimo** ou **Identificado (Nome obrigatório)**.
  - **QR Code & Link**: Geração instantânea de QR Code com download em PNG e link rápido de compartilhamento.
- **Experiência do Participante**:
  - Acesso sem necessidade de cadastro.
  - Interface otimizada para mobile com ordenação por **arrastar (Drag & Drop)** e botões de subir/descer (▲ / ▼).
  - Prevenção de votos duplicados por sessão no navegador.
- **Cálculo de Pontuação (Borda Count)**:
  - Se houver $N$ itens, a 1ª opção recebe $N$ pontos, a 2ª recebe $N-1$ pontos, até a última receber 1 ponto.
  - Critério de desempate por total de 1º lugares conquistados.
- **Telão e Pódio ao Vivo (Realtime)**:
  - Pódio Top 3 (1º Ouro, 2º Prata, 3º Bronze).
  - Barras animadas com porcentagem em relação à pontuação máxima.
  - Atualização instantânea com Supabase Realtime a cada novo voto submetido.
  - Modo Telão (Fullscreen) para eventos e reuniões.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Route Handlers, React 19, TypeScript).
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) v4.
- **Banco de Dados & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL com RLS e canais Realtime).
- **Ícones**: [Lucide React](https://lucide.dev/).
- **QR Code**: [qrcode.react](https://github.com/zpao/qrcode.react).
- **Celebração**: [canvas-confetti](https://github.com/catdad/canvas-confetti).

---

## ⚙️ Configuração e Execução

### 1. Clonar e Instalar Dependências

```bash
npm install
```

### 2. Configurar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. No painel do seu projeto Supabase, acesse **SQL Editor**, cole todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
3. Obtenha a URL do projeto e a Chave Pública Anon em **Project Settings > API**.
4. Crie ou edite o arquivo `.env.local` na raiz do projeto com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🏗️ Arquitetura em Camadas (Clean Pattern)

O projeto agora segue estritamente a separação em camadas para máxima manutenibilidade e escalabilidade:

```
src/
├── repositories/          # Acesso a Dados e Queries
│   ├── poll.repository.ts # Operações de banco para enquetes e opções
│   └── vote.repository.ts # Operações de banco para votos e pontuações
├── services/              # Regras de Negócio e Cálculos
│   ├── poll.service.ts    # Validações e regras de criação/listagem
│   ├── vote.service.ts    # Validação de regras (anonimato/nome/duplicidade) e Borda Count
│   └── result.service.ts  # Agregação estatística e ranking consolidado
├── controllers/           # Camada de Entrada e Resposta HTTP
│   ├── poll.controller.ts
│   ├── vote.controller.ts
│   └── result.controller.ts
├── app/api/               # Route Handlers do Next.js (apenas delegam para os Controllers)
│   ├── auth/[...all]/     # Better Auth Handler
│   └── polls/...
└── lib/auth/              # Configuração do Better Auth (Server e Client)
```

---

## 🔐 Autenticação com Better Auth

A autenticação administrativa é 100% gerenciada pelo **Better Auth**:
- **Backend**: Endpoint dinâmico em `/api/auth/[...all]`.
- **Client React**: Hooks e funções reativas (`signIn`, `signUp`, `signOut`, `useSession`) em `src/lib/auth/auth-client.ts`.
- **Sessão Segura**: Verificação de token de sessão nos Route Handlers através de `src/lib/auth/session.ts`.
- `/admin/login` — Login do administrador.
- `/admin/dashboard` — Painel de gerenciamento de enquetes e QR Codes.
- `/admin/polls/new` — Formulário de criação de nova enquete.
- `/p/[code]` — Página de votação do participante (Drag & drop).
- `/p/[code]/results` — Telão de resultados e pódio ao vivo em tempo real.
- `/api/polls` — Route Handler para listar e criar enquetes.
- `/api/polls/[code]` — Route Handler para consulta pública da enquete.
- `/api/polls/[code]/vote` — Route Handler para computar voto (Borda Count).
- `/api/polls/[code]/results` — Route Handler com ranking consolidado.
