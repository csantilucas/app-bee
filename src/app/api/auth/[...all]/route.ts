import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const { all } = await params;
  const path = all.join('/');

  try {
    // 1. Rota de Login: /api/auth/sign-in/email
    if (path === 'sign-in/email' || path === 'sign-in') {
      const body = await request.json();
      const { email, password } = body;

      const result = await AuthService.signIn(email, password);
      return NextResponse.json(result, { status: 200 });
    }

    // 2. Rota de Logout: /api/auth/sign-out
    if (path === 'sign-out') {
      const result = await AuthService.signOut();
      return NextResponse.json(result, { status: 200 });
    }

    return NextResponse.json({ error: 'Rota de autenticação não encontrada' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro interno de autenticação', error: err.message },
      { status: 401 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const { all } = await params;
  const path = all.join('/');

  try {
    // 3. Rota de Sessão: /api/auth/get-session ou /api/auth/session
    if (path === 'get-session' || path === 'session') {
      const session = await AuthService.getSession();
      return NextResponse.json(session, { status: 200 });
    }

    return NextResponse.json({ error: 'Rota de autenticação não encontrada' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Erro ao carregar sessão', error: err.message },
      { status: 500 }
    );
  }
}
