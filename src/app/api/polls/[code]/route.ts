import { NextRequest } from 'next/server';
import { PollController } from '@/controllers/poll.controller';

const pollController = new PollController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return pollController.getPollByCode(request, code);
}
