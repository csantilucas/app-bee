'use client';

import { useState, useEffect } from 'react';

export const authClient = {
  signIn: {
    async email({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetch('/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.message || data.error || 'E-mail ou senha incorretos' } };
        }
        return { data };
      } catch (err: any) {
        return { error: { message: err.message || 'Falha ao conectar com o servidor' } };
      }
    },
  },
  signUp: {
    async email({ email, password, name }: { email: string; password: string; name?: string }) {
      return { error: { message: 'Cadastro de novos administradores desativado. Use as credenciais do admin principal.' } };
    },
  },
  async signOut() {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
    } catch {}
  },
  useSession() {
    const [data, setData] = useState<{ user: { id: string; name: string; email: string }; session: any } | null>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
      fetch('/api/auth/get-session')
        .then((res) => (res.ok ? res.json() : null))
        .then((session) => {
          setData(session);
        })
        .catch(() => setData(null))
        .finally(() => setIsPending(false));
    }, []);

    return { data, isPending };
  },
};

export const { signIn, signUp, signOut, useSession } = authClient;
