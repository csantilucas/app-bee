-- ========================================================
-- BeeRank Database Schema (Supabase / PostgreSQL)
-- Suporte completo a Better Auth e Realtime
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. Tabelas do Better Auth
-- ========================================================
CREATE TABLE IF NOT EXISTS public."user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    image TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ,
    "refreshTokenExpiresAt" TIMESTAMPTZ,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================
-- 2. Tabelas do BeeRank
-- ========================================================

-- Tabela de Enquetes (polls)
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT REFERENCES public."user"(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    code VARCHAR(10) UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    require_name BOOLEAN NOT NULL DEFAULT false,
    is_public_results BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Itens/Opções da Enquete (poll_items)
CREATE TABLE IF NOT EXISTS public.poll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    initial_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Votos Submetidos (poll_votes)
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    voter_session_id TEXT NOT NULL,
    voter_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Itens Votados e Posições (poll_vote_items)
CREATE TABLE IF NOT EXISTS public.poll_vote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vote_id UUID NOT NULL REFERENCES public.poll_votes(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.poll_items(id) ON DELETE CASCADE,
    position INT NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================
-- Índices para Alta Performance
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_polls_code ON public.polls(code);
CREATE INDEX IF NOT EXISTS idx_polls_admin ON public.polls(admin_id);
CREATE INDEX IF NOT EXISTS idx_poll_items_poll_id ON public.poll_items(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_session ON public.poll_votes(poll_id, voter_session_id);
CREATE INDEX IF NOT EXISTS idx_poll_vote_items_vote_id ON public.poll_vote_items(vote_id);
CREATE INDEX IF NOT EXISTS idx_poll_vote_items_item_id ON public.poll_vote_items(item_id);

-- ========================================================
-- Políticas de Segurança (Row Level Security - RLS)
-- ========================================================
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_vote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Polls" ON public.polls FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Poll Items" ON public.poll_items FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Poll Items" ON public.poll_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Poll Votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Public Insert Poll Votes" ON public.poll_votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Vote Items" ON public.poll_vote_items FOR SELECT USING (true);
CREATE POLICY "Public Insert Vote Items" ON public.poll_vote_items FOR INSERT WITH CHECK (true);

-- ========================================================
-- Habilitar Supabase Realtime
-- ========================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'poll_votes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'poll_vote_items'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_vote_items;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'polls'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
    END IF;
END $$;
