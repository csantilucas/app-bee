-- ========================================================
-- Políticas de Segurança (Row Level Security - RLS)
-- Permite leitura e votação pública para anon role
-- ========================================================

ALTER TABLE "polls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "poll_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "poll_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "poll_vote_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Polls" ON "polls";
CREATE POLICY "Public Read Polls" ON "polls" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Poll Items" ON "poll_items";
CREATE POLICY "Public Read Poll Items" ON "poll_items" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Poll Votes" ON "poll_votes";
CREATE POLICY "Public Read Poll Votes" ON "poll_votes" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Vote Items" ON "poll_vote_items";
CREATE POLICY "Public Read Vote Items" ON "poll_vote_items" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Votes" ON "poll_votes";
CREATE POLICY "Public Insert Votes" ON "poll_votes" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Insert Vote Items" ON "poll_vote_items";
CREATE POLICY "Public Insert Vote Items" ON "poll_vote_items" FOR INSERT WITH CHECK (true);
