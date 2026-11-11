import { NextRequest, NextResponse } from 'next/server';
import { ResultService } from '@/services/result.service';

export class ResultController {
  constructor(private resultService: ResultService = new ResultService()) {}

  async getResults(request: NextRequest, code: string) {
    try {
      const results = await this.resultService.getPollResults(code);
      return NextResponse.json(results, { status: 200 });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return NextResponse.json({ error: err.message || 'Erro ao carregar resultados.' }, { status });
    }
  }
}
