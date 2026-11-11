import { PollRepository } from '@/repositories/poll.repository';
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
  constructor(private pollRepository: PollRepository = new PollRepository()) {}

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
}
