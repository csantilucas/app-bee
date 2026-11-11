'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth/auth-client';
import { QrCodeModal } from '@/components/admin/QrCodeModal';
import {
  Plus,
  QrCode,
  Trophy,
  ExternalLink,
  Users,
  LogOut,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createdCode = searchParams.get('created');

  const { data: session, isPending: sessionLoading } = useSession();

  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPollForQr, setSelectedPollForQr] = useState<{ title: string; code: string } | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/admin/login');
      return;
    }

    async function loadPolls() {
      if (!session) return;
      try {
        const res = await fetch('/api/polls');
        if (res.ok) {
          const data = await res.json();
          setPolls(data.polls || []);

          if (createdCode && data.polls) {
            const newlyCreated = data.polls.find((p: any) => p.code === createdCode);
            if (newlyCreated) {
              setSelectedPollForQr({ title: newlyCreated.title, code: newlyCreated.code });
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadPolls();
    }
  }, [router, session, sessionLoading, createdCode]);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Autenticando sessão...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-fade-in">
      {/* Topo / Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm">
            <Image
              src="/logo.png"
              alt="Logo BeeRank"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            Bee<span className="text-[#3903b5] dark:text-indigo-400">Rank</span>{' '}
            <span className="text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-indigo-950 text-[#3903b5] dark:text-indigo-300 rounded-md ml-1 font-semibold border border-blue-200 dark:border-indigo-800">
              Admin
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Admin: <strong className="text-slate-800 dark:text-slate-200">{session?.user?.email}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Minhas Enquetes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gerencie enquetes, gere QR Codes e abra telões de pódio ao vivo
            </p>
          </div>

          <Link
            href="/admin/polls/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 text-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Enquete
          </Link>
        </div>

        {createdCode && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-200 text-sm animate-scale-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Enquete criada com sucesso! O QR Code já está pronto para compartilhar.</span>
            </div>
            <button
              onClick={() => setSelectedPollForQr({ title: 'Enquete Criada', code: createdCode })}
              className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Ver QR Code
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Carregando enquetes...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-indigo-950/80 text-[#3903b5] dark:text-indigo-400 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Nenhuma enquete criada ainda
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
              Crie sua primeira enquete de ranking para coletar escolhas e ver o pódio se formar em tempo real!
            </p>
            <Link
              href="/admin/polls/new"
              className="px-6 py-3 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-indigo-600/25"
            >
              Criar Primeira Enquete
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {polls.map((poll) => {
              const voteCount = poll.poll_votes ? poll.poll_votes.length : 0;
              const itemCount = poll.poll_items ? poll.poll_items.length : 0;

              return (
                <div
                  key={poll.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 text-[#3903b5] dark:text-indigo-400 rounded-lg">
                        {poll.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {poll.require_name ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-[#3903b5] dark:text-indigo-300 rounded-md">
                            <UserCheck className="w-3 h-3" />
                            Exige Nome
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                            Anônima
                          </span>
                        )}
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-md">
                          {poll.status === 'open' ? 'Aberta' : 'Encerrada'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                      {poll.title}
                    </h3>

                    {poll.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {poll.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#3903b5] dark:text-indigo-400" />
                        <strong>{voteCount}</strong> votos
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{itemCount}</strong> opções
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPollForQr({ title: poll.title, code: poll.code })}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#3903b5]" />
                      QR Code
                    </button>

                    <Link
                      href={`/p/${poll.code}/results`}
                      target="_blank"
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-blue-50/60 dark:bg-indigo-950/30 hover:bg-blue-100 text-xs font-semibold text-[#3903b5] dark:text-indigo-300 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      Telão
                    </Link>

                    <Link
                      href={`/p/${poll.code}`}
                      target="_blank"
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Votar
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedPollForQr && (
        <QrCodeModal
          isOpen={Boolean(selectedPollForQr)}
          onClose={() => setSelectedPollForQr(null)}
          title={selectedPollForQr.title}
          code={selectedPollForQr.code}
        />
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Carregando painel...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
