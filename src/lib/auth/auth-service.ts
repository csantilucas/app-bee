import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyPassword } from 'better-auth/crypto';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'beerank_session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export class AuthService {
  /**
   * Realiza login por e-mail e senha
   */
  static async signIn(email: string, password: string) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const supabase = await createServerSupabaseClient();

    // 1. Buscar usuário
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (userError || !user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // 2. Buscar conta de credencial
    const { data: account, error: accError } = await supabase
      .from('account')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle();

    if (accError || !account || !account.password) {
      throw new Error('Credenciais de login inválidas.');
    }

    // 3. Verificar senha com better-auth/crypto
    const isValid = await verifyPassword({
      password,
      hash: account.password,
    });

    if (!isValid) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // 4. Criar sessão no banco
    const sessionToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
    const now = new Date().toISOString();

    const { error: sessionError } = await supabase.from('session').insert({
      id: sessionId,
      token: sessionToken,
      userId: user.id,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    if (sessionError) {
      throw new Error(`Falha ao registrar sessão: ${sessionError.message}`);
    }

    // 5. Configurar cookie seguro
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      session: {
        id: sessionId,
        token: sessionToken,
        expiresAt,
      },
    };
  }

  /**
   * Obtém a sessão ativa do usuário atual
   */
  static async getSession() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

      if (!token) return null;

      const supabase = await createServerSupabaseClient();

      const { data: session, error: sessError } = await supabase
        .from('session')
        .select('*, user:userId(*)')
        .eq('token', token)
        .maybeSingle();

      if (sessError || !session || !session.user) {
        return null;
      }

      // Verificar se a sessão expirou
      if (new Date(session.expiresAt) < new Date()) {
        await supabase.from('session').delete().eq('id', session.id);
        cookieStore.delete(SESSION_COOKIE_NAME);
        return null;
      }

      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        session: {
          id: session.id,
          token: session.token,
          expiresAt: session.expiresAt,
        },
      };
    } catch {
      return null;
    }
  }

  /**
   * Encerra a sessão ativa
   */
  static async signOut() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

      if (token) {
        const supabase = await createServerSupabaseClient();
        await supabase.from('session').delete().eq('token', token);
      }

      cookieStore.delete(SESSION_COOKIE_NAME);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
