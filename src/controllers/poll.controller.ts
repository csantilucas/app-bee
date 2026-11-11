import { NextRequest, NextResponse } from 'next/server';
import { PollService } from '@/services/poll.service';

export class PollController {
  constructor(private pollService: PollService = new PollService()) {}

  async createPoll(request: NextRequest, userId: string) {
    try {
      if (!userId) {
        return NextResponse.json({ error: 'Você precisa estar logado como administrador.' }, { status: 401 });
      }

      const body = await request.json();
      const result = await this.pollService.createPoll({
        adminId: userId,
        title: body.title,
        description: body.description,
        items: body.items,
        requireName: body.requireName,
        isPublicResults: body.isPublicResults,
      });

      return NextResponse.json(result, { status: 201 });
    } catch (err: any) {
      const status = err.statusCode || 400;
      return NextResponse.json({ error: err.message || 'Erro ao criar enquete.' }, { status });
    }
  }

  async listAdminPolls(request: NextRequest, userId: string) {
    try {
      if (!userId) {
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      }

      const polls = await this.pollService.listAdminPolls(userId);
      return NextResponse.json({ polls });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return NextResponse.json({ error: err.message || 'Erro ao listar enquetes.' }, { status });
    }
  }

  async listPublicPolls(request: NextRequest) {
    try {
      const polls = await this.pollService.listPublicPolls();
      return NextResponse.json({ polls });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return NextResponse.json({ error: err.message || 'Erro ao listar enquetes públicas.' }, { status });
    }
  }

  async getPollByCode(request: NextRequest, code: string) {
    try {
      const poll = await this.pollService.getPollByCode(code);
      return NextResponse.json({ poll });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return NextResponse.json({ error: err.message || 'Erro ao buscar enquete.' }, { status });
    }
  }

  async updatePoll(request: NextRequest, code: string, userId: string) {
    try {
      if (!userId) {
        return NextResponse.json({ error: 'Você precisa estar logado como administrador.' }, { status: 401 });
      }

      const body = await request.json();
      const updated = await this.pollService.updatePoll(code, userId, {
        title: body.title,
        description: body.description,
        status: body.status,
        requireName: body.requireName,
        isPublicResults: body.isPublicResults,
        items: body.items,
      });

      return NextResponse.json({ poll: updated });
    } catch (err: any) {
      const status = err.statusCode || 400;
      return NextResponse.json({ error: err.message || 'Erro ao atualizar enquete.' }, { status });
    }
  }

  async resetPollVotes(request: NextRequest, code: string, userId: string) {
    try {
      if (!userId) {
        return NextResponse.json({ error: 'Você precisa estar logado como administrador.' }, { status: 401 });
      }

      const result = await this.pollService.resetPollVotes(code, userId);
      return NextResponse.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return NextResponse.json({ error: err.message || 'Erro ao zerar votos da enquete.' }, { status });
    }
  }

  async deletePoll(request: NextRequest, code: string, userId: string) {
    try {
      if (!userId) {
        return NextResponse.json({ error: 'Você precisa estar logado como administrador.' }, { status: 401 });
      }

      const result = await this.pollService.deletePoll(code, userId);
      return NextResponse.json(result);
    } catch (err: any) {
      const status = err.statusCode || 400;
      return NextResponse.json({ error: err.message || 'Erro ao excluir enquete.' }, { status });
    }
  }
}
