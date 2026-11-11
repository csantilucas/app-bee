import { PollItem, PollVote, PollVoteItem, RankedItemResult } from '@/types/poll';

/**
 * Calcula a pontuação e ordena os itens de acordo com o método Borda Count.
 * @param items Lista de itens da enquete
 * @param voteItems Lista de todas as posições votadas
 * @param totalVotes Número total de participantes que votaram
 */
export function calculateRankings(
  items: PollItem[],
  voteItems: PollVoteItem[],
  totalVotes: number
): RankedItemResult[] {
  // Mapear estatísticas para cada item
  const itemStatsMap = new Map<
    string,
    {
      totalScore: number;
      firstChoiceCount: number;
      sumPositions: number;
      voteCount: number;
    }
  >();

  for (const item of items) {
    itemStatsMap.set(item.id, {
      totalScore: 0,
      firstChoiceCount: 0,
      sumPositions: 0,
      voteCount: 0,
    });
  }

  for (const vi of voteItems) {
    const stats = itemStatsMap.get(vi.item_id);
    if (stats) {
      stats.totalScore += vi.score;
      stats.voteCount += 1;
      stats.sumPositions += vi.position;
      if (vi.position === 1) {
        stats.firstChoiceCount += 1;
      }
    }
  }

  const results: RankedItemResult[] = items.map((item) => {
    const stats = itemStatsMap.get(item.id) || {
      totalScore: 0,
      firstChoiceCount: 0,
      sumPositions: 0,
      voteCount: 0,
    };

    const avgPos =
      stats.voteCount > 0 ? stats.sumPositions / stats.voteCount : items.length;

    return {
      itemId: item.id,
      title: item.title,
      description: item.description,
      totalScore: stats.totalScore,
      firstChoiceCount: stats.firstChoiceCount,
      voteCount: stats.voteCount,
      averagePosition: Number(avgPos.toFixed(2)),
      rank: 1,
    };
  });

  // Ordenar por score decrescente, depois por firstChoiceCount, depois por título
  results.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.firstChoiceCount !== a.firstChoiceCount) {
      return b.firstChoiceCount - a.firstChoiceCount;
    }
    return a.title.localeCompare(b.title);
  });

  // Atribuir o rank final
  results.forEach((r, index) => {
    r.rank = index + 1;
  });

  return results;
}

/**
 * Gera um código curto e amigável para a enquete (ex: BEE-9241)
 */
export function generatePollCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  let prefix = '';
  for (let i = 0; i < 3; i++) {
    prefix += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return `${prefix}-${suffix}`;
}
