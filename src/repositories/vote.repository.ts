import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PollVote, PollVoteItem } from '@/types/poll';
import crypto from 'crypto';

export class VoteRepository {
  /**
   * Verifica se o participante já registrou voto nesta enquete
   */
  async hasUserVoted(pollId: string, voterSessionId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { data } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('voter_session_id', voterSessionId)
      .maybeSingle();

    return Boolean(data);
  }

  /**
   * Cria o registro do voto do participante
   */
  async createVote(
    pollId: string,
    voterSessionId: string,
    voterName?: string | null
  ): Promise<PollVote> {
    const supabase = await createServerSupabaseClient();
    const voteId = crypto.randomUUID();

    const { data: vote, error } = await supabase
      .from('poll_votes')
      .insert({
        id: voteId,
        poll_id: pollId,
        voter_session_id: voterSessionId,
        voter_name: voterName ? voterName.trim() : null,
      })
      .select()
      .single();

    if (error || !vote) {
      throw new Error(`Erro ao registrar voto: ${error?.message}`);
    }

    return vote;
  }

  /**
   * Insere em lote as pontuações e posições de cada item do voto
   */
  async createVoteItems(
    voteItems: Array<{
      vote_id: string;
      item_id: string;
      position: number;
      score: number;
    }>
  ): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const itemsToInsert = voteItems.map((item) => ({
      id: crypto.randomUUID(),
      ...item,
    }));

    const { error } = await supabase
      .from('poll_vote_items')
      .insert(itemsToInsert);

    if (error) {
      throw new Error(`Erro ao salvar itens do voto: ${error.message}`);
    }
  }

  /**
   * Remove um voto criado (para fins de rollback em falhas)
   */
  async deleteVote(voteId: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    await supabase.from('poll_votes').delete().eq('id', voteId);
  }

  /**
   * Obtém todos os votos de uma enquete
   */
  async getVotesByPollId(pollId: string): Promise<Array<{ id: string; voter_name: string | null; created_at: string }>> {
    const supabase = await createServerSupabaseClient();

    const { data: votes, error } = await supabase
      .from('poll_votes')
      .select('id, voter_name, created_at')
      .eq('poll_id', pollId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao carregar votos: ${error.message}`);
    }

    return votes || [];
  }

  /**
   * Obtém os itens votados correspondentes a um conjunto de votos
   */
  async getVoteItemsByVoteIds(voteIds: string[]): Promise<PollVoteItem[]> {
    if (!voteIds || voteIds.length === 0) return [];

    const supabase = await createServerSupabaseClient();

    const { data: items, error } = await supabase
      .from('poll_vote_items')
      .select('*')
      .in('vote_id', voteIds);

    if (error) {
      throw new Error(`Erro ao carregar itens votados: ${error.message}`);
    }

    return items || [];
  }

  /**
   * Zera todos os votos registrados para uma determinada enquete
   */
  async deleteVotesByPollId(pollId: string): Promise<number> {
    const supabase = await createServerSupabaseClient();

    // 1. Obter IDs dos votos da enquete
    const { data: votes, error: fetchErr } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId);

    if (fetchErr) {
      throw new Error(`Erro ao buscar votos para zerar: ${fetchErr.message}`);
    }

    if (!votes || votes.length === 0) {
      return 0;
    }

    const voteIds = (votes as any[]).map((v: any) => v.id);

    // 2. Apagar itens dos votos (garantindo limpeza mesmo sem cascade)
    await supabase
      .from('poll_vote_items')
      .delete()
      .in('vote_id', voteIds);

    // 3. Apagar os votos
    const { error: delError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', pollId);

    if (delError) {
      throw new Error(`Erro ao excluir votos da enquete: ${delError.message}`);
    }

    return voteIds.length;
  }
}
