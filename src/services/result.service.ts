import { PollRepository } from '@/repositories/poll.repository';
import { VoteRepository } from '@/repositories/vote.repository';
import { calculateRankings } from '@/lib/ranking-calculator';
import { PollAggregateResult } from '@/types/poll';

export class ResultService {
  constructor(
    private pollRepository: PollRepository = new PollRepository(),
    private voteRepository: VoteRepository = new VoteRepository()
  ) {}

  async getPollResults(code: string): Promise<PollAggregateResult> {
    if (!code) {
      throw new Error('Código da enquete ausente.');
    }

    // 1. Obter a enquete com seus itens
    const poll = await this.pollRepository.findByCode(code);
    if (!poll) {
      const error: any = new Error('Enquete não encontrada.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Obter todos os votos
    const votes = await this.voteRepository.getVotesByPollId(poll.id);
    const voteIds = votes.map((v) => v.id);

    // 3. Obter todos os itens votados
    const voteItems = await this.voteRepository.getVoteItemsByVoteIds(voteIds);

    // 4. Executar cálculo do Borda Count
    const items = poll.poll_items || [];
    const totalVotes = votes.length;
    const rankedItems = calculateRankings(items, voteItems, totalVotes);

    // 5. Lista de participantes recentes (se houver identificação por nome)
    const recentVoters = votes
      .filter((v) => Boolean(v.voter_name))
      .slice(0, 15)
      .map((v) => ({
        name: v.voter_name as string,
        votedAt: v.created_at,
      }));

    return {
      poll,
      totalVotes,
      items: rankedItems,
      recentVoters,
    };
  }
}
