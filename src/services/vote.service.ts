import { PollRepository } from '@/repositories/poll.repository';
import { VoteRepository } from '@/repositories/vote.repository';
import { SubmitVotePayload } from '@/types/poll';

export class VoteService {
  constructor(
    private pollRepository: PollRepository = new PollRepository(),
    private voteRepository: VoteRepository = new VoteRepository()
  ) {}

  async submitVote(code: string, payload: SubmitVotePayload): Promise<{ success: boolean; voteId: string; message: string }> {
    const { voterSessionId, voterName, orderedItemIds } = payload;

    if (!code) {
      throw new Error('Código da enquete ausente.');
    }

    if (!voterSessionId) {
      throw new Error('Identificador de sessão ausente.');
    }

    if (!orderedItemIds || !Array.isArray(orderedItemIds) || orderedItemIds.length === 0) {
      throw new Error('Nenhuma ordem de itens enviada para o ranking.');
    }

    // 1. Validar existência e status da enquete
    const poll = await this.pollRepository.findByCode(code);
    if (!poll) {
      const error: any = new Error('Enquete não encontrada.');
      error.statusCode = 404;
      throw error;
    }

    if (poll.status !== 'open') {
      const error: any = new Error('Esta enquete já foi encerrada.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validar regra de obrigatoriedade do nome
    if (poll.require_name && (!voterName || !voterName.trim())) {
      const error: any = new Error('Esta enquete exige que você informe seu nome ou apelido para votar.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Prevenir voto duplicado
    const alreadyVoted = await this.voteRepository.hasUserVoted(poll.id, voterSessionId);
    if (alreadyVoted) {
      const error: any = new Error('Você já registrou seu voto nesta enquete!');
      error.statusCode = 409;
      error.alreadyVoted = true;
      throw error;
    }

    // 4. Criar registro principal do voto
    const vote = await this.voteRepository.createVote(
      poll.id,
      voterSessionId,
      voterName ? voterName.trim() : null
    );

    // 5. Calcular pontuação de Borda Count e preparar itens
    // Se há N itens: o 1º ganha N pontos, o 2º ganha N-1, etc.
    const totalItems = orderedItemIds.length;
    const voteItems = orderedItemIds.map((itemId, index) => ({
      vote_id: vote.id,
      item_id: itemId,
      position: index + 1,
      score: totalItems - index,
    }));

    try {
      await this.voteRepository.createVoteItems(voteItems);
    } catch (err: any) {
      // rollback do voto caso a inserção dos itens falhe
      await this.voteRepository.deleteVote(vote.id);
      throw new Error(`Falha ao registrar ordenação dos itens: ${err.message}`);
    }

    return {
      success: true,
      voteId: vote.id,
      message: 'Voto computado com sucesso no BeeRank!',
    };
  }
}
