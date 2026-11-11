import { NextRequest } from 'next/server';
import { ResultController } from '@/controllers/result.controller';

const resultController = new ResultController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return resultController.getResults(request, code);
}
