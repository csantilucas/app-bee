import { NextRequest, NextResponse } from 'next/server';
import { VoteService } from '@/services/vote.service';

export class VoteController {
  constructor(private voteService: VoteService = new VoteService()) {}

  async submitVote(request: NextRequest, code: string) {
    try {
      const body = await request.json();
      const result = await this.voteService.submitVote(code, body);

      return NextResponse.json(result, { status: 200 });
    } catch (err: any) {
      const status = err.statusCode || 400;
      return NextResponse.json(
        {
          error: err.message || 'Erro ao processar voto.',
          alreadyVoted: Boolean(err.alreadyVoted),
        },
        { status }
      );
    }
  }
}
