import { NextRequest, NextResponse } from 'next/server';
import { PollController } from '@/controllers/poll.controller';
import { getCurrentUser } from '@/lib/auth/session';

const pollController = new PollController();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Você precisa estar logado como administrador.' },
      { status: 401 }
    );
  }

  const { code } = await params;
  return pollController.resetPollVotes(request, code, user.id);
}
