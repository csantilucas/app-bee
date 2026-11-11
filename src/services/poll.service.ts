import { PollRepository, UpdatePollDTO } from '@/repositories/poll.repository';
import { VoteRepository } from '@/repositories/vote.repository';
import { generatePollCode } from '@/lib/ranking-calculator';
import { Poll, PollItem } from '@/types/poll';

export interface CreatePollInput {
  adminId: string;
  title: string;
  description?: string;
  items: string[];
  requireName?: boolean;
  isPublicResults?: boolean;
}

export class PollService {
  constructor(
    private pollRepository: PollRepository = new PollRepository(),
    private voteRepository: VoteRepository = new VoteRepository()
  ) {}

  async createPoll(input: CreatePollInput): Promise<{ poll: Poll; items: PollItem[]; shareUrl: string }> {
    const { adminId, title, description, items, requireName = false, isPublicResults = true } = input;

    if (!adminId) {
      throw new Error('Administrador não autenticado.');
    }

    if (!title || !title.trim()) {
      throw new Error('O título da enquete é obrigatório.');
    }

    const cleanItems = items.map((i) => i.trim()).filter((i) => i.length > 0);
    if (cleanItems.length < 2) {
      throw new Error('A enquete precisa de pelo menos 2 opções para ranqueamento.');
    }

    const code = generatePollCode();

    const result = await this.pollRepository.create(
      {
        adminId,
        title: title.trim(),
        description: description?.trim(),
        code,
        requireName: Boolean(requireName),
        isPublicResults: Boolean(isPublicResults),
      },
      cleanItems
    );

    return {
      poll: result.poll,
      items: result.items,
      shareUrl: `/p/${result.poll.code}`,
    };
  }

  async getPollByCode(code: string): Promise<Poll & { poll_items: PollItem[] }> {
    if (!code) {
      throw new Error('Código da enquete ausente.');
    }

    const poll = await this.pollRepository.findByCode(code);
    if (!poll) {
      const notFoundError: any = new Error('Enquete não encontrada.');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    return poll;
  }

  async listAdminPolls(adminId: string): Promise<any[]> {
    if (!adminId) {
      throw new Error('Administrador não autenticado.');
    }

    return await this.pollRepository.listByAdminId(adminId);
  }

  async listPublicPolls(): Promise<any[]> {
    return await this.pollRepository.listPublicPolls();
  }

  /**
   * Atualiza uma enquete (apenas o criador admin pode atualizar)
   */
  async updatePoll(
    code: string,
    adminId: string,
    data: UpdatePollDTO
  ): Promise<Poll> {
    if (!adminId) {
      throw new Error('Administrador não autenticado.');
    }

    const poll = await this.getPollByCode(code);
    if (poll.admin_id && poll.admin_id !== adminId) {
      const err: any = new Error('Você não tem permissão para editar esta enquete.');
      err.statusCode = 403;
      throw err;
    }

    if (data.items && data.items.length < 2) {
      throw new Error('A enquete precisa de no mínimo 2 opções.');
    }

    return await this.pollRepository.update(poll.id, data);
  }

  /**
   * Zera todos os votos de uma enquete (apenas o criador admin pode zerar)
   */
  async resetPollVotes(code: string, adminId: string): Promise<{ message: string; votesDeleted: number }> {
    if (!adminId) {
      throw new Error('Administrador não autenticado.');
    }

    const poll = await this.getPollByCode(code);
    if (poll.admin_id && poll.admin_id !== adminId) {
      const err: any = new Error('Você não tem permissão para zerar esta enquete.');
      err.statusCode = 403;
      throw err;
    }

    const votesDeleted = await this.voteRepository.deleteVotesByPollId(poll.id);

    return {
      message: 'Votos da enquete zerados com sucesso.',
      votesDeleted,
    };
  }

  /**
   * Exclui uma enquete permanentemente (apenas o criador admin pode excluir)
   */
  async deletePoll(code: string, adminId: string): Promise<{ message: string }> {
    if (!adminId) {
      throw new Error('Administrador não autenticado.');
    }

    const poll = await this.getPollByCode(code);
    if (poll.admin_id && poll.admin_id !== adminId) {
      const err: any = new Error('Você não tem permissão para excluir esta enquete.');
      err.statusCode = 403;
      throw err;
    }

    await this.pollRepository.delete(poll.id);

    return {
      message: 'Enquete e todos os dados associados foram excluídos com sucesso.',
    };
  }
}
