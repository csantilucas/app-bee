import { NextRequest, NextResponse } from 'next/server';
import { PollController } from '@/controllers/poll.controller';
import { getCurrentUser } from '@/lib/auth/session';

const pollController = new PollController();

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Você precisa estar logado como administrador.' }, { status: 401 });
  }

  return pollController.listAdminPolls(request, user.id);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Você precisa estar logado como administrador.' }, { status: 401 });
  }

  return pollController.createPoll(request, user.id);
}
