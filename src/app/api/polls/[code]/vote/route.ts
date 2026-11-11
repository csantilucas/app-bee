import { NextRequest } from 'next/server';
import { VoteController } from '@/controllers/vote.controller';

const voteController = new VoteController();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return voteController.submitVote(request, code);
}
