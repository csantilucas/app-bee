import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Poll, PollItem } from '@/types/poll';
import crypto from 'crypto';

export interface CreatePollDTO {
  adminId: string;
  title: string;
  description?: string;
  code: string;
  requireName: boolean;
  isPublicResults: boolean;
}

export interface UpdatePollDTO {
  title?: string;
  description?: string;
  status?: 'open' | 'closed';
  requireName?: boolean;
  isPublicResults?: boolean;
  items?: Array<{ id?: string; title: string }>;
}

export class PollRepository {
  /**
   * Cria uma enquete e seus respectivos itens
   */
  async create(data: CreatePollDTO, items: string[]): Promise<{ poll: Poll; items: PollItem[] }> {
    const supabase = await createServerSupabaseClient();
    const pollId = crypto.randomUUID();

    // 1. Inserir a enquete
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        id: pollId,
        admin_id: data.adminId,
        title: data.title,
        description: data.description || null,
        code: data.code.toUpperCase(),
        status: 'open',
        require_name: data.requireName,
        is_public_results: data.isPublicResults,
      })
      .select()
      .single();

    if (pollError || !poll) {
      throw new Error(`Falha ao criar enquete: ${pollError?.message}`);
    }

    // 2. Inserir os itens da enquete
    const itemsToInsert = items.map((title, index) => ({
      id: crypto.randomUUID(),
      poll_id: poll.id,
      title: title.trim(),
      initial_order: index,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('poll_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError || !insertedItems) {
      await supabase.from('polls').delete().eq('id', poll.id);
      throw new Error(`Falha ao inserir itens da enquete: ${itemsError?.message}`);
    }

    return {
      poll,
      items: insertedItems,
    };
  }

  /**
   * Busca uma enquete pelo seu código público (ex: BEE-4891) com seus itens
   */
  async findByCode(code: string): Promise<(Poll & { poll_items: PollItem[] }) | null> {
    const supabase = await createServerSupabaseClient();

    const { data: poll, error } = await supabase
      .from('polls')
      .select('*, poll_items(*)')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !poll) {
      return null;
    }

    if (poll.poll_items) {
      poll.poll_items.sort((a: PollItem, b: PollItem) => a.initial_order - b.initial_order);
    }

    return poll;
  }

  /**
   * Busca uma enquete pelo ID
   */
  async findById(id: string): Promise<Poll | null> {
    const supabase = await createServerSupabaseClient();

    const { data: poll, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !poll) {
      return null;
    }

    return poll;
  }

  /**
   * Lista todas as enquetes pertencentes a um administrador
   */
  async listByAdminId(adminId: string): Promise<any[]> {
    const supabase = await createServerSupabaseClient();

    const { data: polls, error } = await supabase
      .from('polls')
      .select('*, poll_items(*), poll_votes(count)')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Falha ao listar enquetes: ${error.message}`);
    }

    return polls || [];
  }

  /**
   * Atualiza os dados de uma enquete e opcionalmente seus itens
   */
  async update(id: string, data: UpdatePollDTO): Promise<Poll> {
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.requireName !== undefined) updatePayload.require_name = data.requireName;
    if (data.isPublicResults !== undefined) updatePayload.is_public_results = data.isPublicResults;

    const { data: updatedPoll, error } = await supabase
      .from('polls')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedPoll) {
      throw new Error(`Falha ao atualizar enquete: ${error?.message}`);
    }

    // Se itens foram fornecidos, sincronizar
    if (data.items && Array.isArray(data.items)) {
      const cleanItems = data.items.map((i) => ({
        id: i.id,
        title: i.title.trim(),
      })).filter((i) => i.title.length > 0);

      // Obter itens atuais do banco
      const { data: currentItems } = await supabase
        .from('poll_items')
        .select('id')
        .eq('poll_id', id);

      const currentIds = new Set<string>((currentItems || []).map((ci: any) => ci.id));
      const incomingIds = new Set<string>(cleanItems.filter((ci) => Boolean(ci.id)).map((ci) => ci.id as string));

      // 1. Atualizar itens existentes
      for (let idx = 0; idx < cleanItems.length; idx++) {
        const item = cleanItems[idx];
        if (item.id && currentIds.has(item.id)) {
          await supabase
            .from('poll_items')
            .update({ title: item.title, initial_order: idx })
            .eq('id', item.id);
        } else {
          // 2. Criar novo item
          await supabase.from('poll_items').insert({
            id: crypto.randomUUID(),
            poll_id: id,
            title: item.title,
            initial_order: idx,
          });
        }
      }

      // 3. Remover itens que não estão mais na lista
      const idsToDelete = Array.from(currentIds).filter((cId: string) => !incomingIds.has(cId));
      if (idsToDelete.length > 0) {
        // Remover de poll_vote_items primeiro para evitar erro de FK se houver
        await supabase.from('poll_vote_items').delete().in('item_id', idsToDelete);
        await supabase.from('poll_items').delete().in('id', idsToDelete);
      }
    }

    return updatedPoll;
  }

  /**
   * Exclui uma enquete permanentemente com todos os seus votos e itens
   */
  async delete(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();

    // 1. Obter todos os votos associados
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id);

    if (votes && votes.length > 0) {
      const voteIds = (votes as any[]).map((v: any) => v.id);
      await supabase.from('poll_vote_items').delete().in('vote_id', voteIds);
      await supabase.from('poll_votes').delete().eq('poll_id', id);
    }

    // 2. Apagar itens da enquete
    await supabase.from('poll_items').delete().eq('poll_id', id);

    // 3. Apagar a enquete
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (error) {
      throw new Error(`Falha ao excluir enquete: ${error.message}`);
    }
  }

  /**
   * Atualiza o status da enquete (aberta/fechada)
   */
  async updateStatus(id: string, status: 'open' | 'closed'): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('polls')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Falha ao atualizar status da enquete: ${error.message}`);
    }
  }
}
