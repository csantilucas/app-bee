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
