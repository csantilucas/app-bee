export interface Poll {
  id: string;
  admin_id?: string | null;
  title: string;
  description?: string | null;
  code: string;
  status: 'open' | 'closed';
  require_name: boolean;
  is_public_results: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollItem {
  id: string;
  poll_id: string;
  title: string;
  description?: string | null;
  initial_order: number;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  voter_session_id: string;
  voter_name?: string | null;
  created_at: string;
}

export interface PollVoteItem {
  id: string;
  vote_id: string;
  item_id: string;
  position: number;
  score: number;
  created_at?: string;
}

export interface RankedItemResult {
  itemId: string;
  title: string;
  description?: string | null;
  totalScore: number;
  firstChoiceCount: number;
  voteCount: number;
  averagePosition: number;
  rank: number;
}

export interface PollAggregateResult {
  poll: Poll;
  totalVotes: number;
  items: RankedItemResult[];
  recentVoters: { name: string; votedAt: string }[];
}

export interface SubmitVotePayload {
  voterSessionId: string;
  voterName?: string;
  orderedItemIds: string[]; // Itens ordenados da 1ª (mais preferido) até a última
}
