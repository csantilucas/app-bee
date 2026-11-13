'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Lock,
  Plus,
  Trophy,
  Users,
  Vote,
  Sparkles,
  Radio,
  ExternalLink,
  ChevronRight,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PublicPoll {
  id: string;
  title: string;
  description?: string | null;
  code: string;
  status: string;
  require_name: boolean;
  created_at: string;
  poll_items?: Array<{ id: string; title: string }>;
  poll_votes?: Array<{ count: number }>;
}

export default function HomePage() {
  const router = useRouter();
  const [pollCode, setPollCode] = useState('');
  const [error, setError] = useState('');

  const [polls, setPolls] = useState<PublicPoll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  useEffect(() => {
    async function fetchPublicPolls() {
      try {
        const res = await fetch('/api/polls/public');
        if (res.ok) {
          const data = await res.json();
          setPolls(data.polls || []);
        }
      } catch (err) {
        console.error('Erro ao buscar enquetes públicas:', err);
      } finally {
        setLoadingPolls(false);
      }
    }

    fetchPublicPolls();
  }, []);

  const handleEnterPoll = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = pollCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor, digite o código da enquete.');
      return;
    }
    router.push(`/p/${cleanCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-[#3903b5] selection:text-white">
      {/* Navbar Superior */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="BeeRank Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
            Bee<span className="text-[#3903b5] dark:text-indigo-400">Rank</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/polls/new"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#3903b5] hover:bg-[#2e0294] text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Enquete
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:text-[#3903b5] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Painel Admin</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
        </div>
      </header>

      {/* Hero Section Minimalista */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center flex flex-col items-center animate-slide-up">
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-indigo-950/70 border border-blue-200 dark:border-indigo-800 text-[#3903b5] dark:text-indigo-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ranking Colaborativo ao Vivo</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Vote e descubra os favoritos em <span className="text-[#3903b5] dark:text-indigo-400">tempo real</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mt-3 mb-8">
            Ordene as opções por preferência usando o método Borda e veja o pódio se transformar instantaneamente no telão.
          </p>

          {/* Caixa de Entrada Rápida de Código */}
          <form
            onSubmit={handleEnterPoll}
            className="w-full bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row gap-2 transition-all hover:border-[#3903b5]/50"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Código da Enquete (ex: BEE-9241)"
                value={pollCode}
                onChange={(e) => {
                  setPollCode(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-mono uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3903b5]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer shrink-0"
            >
              Participar
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && (
            <p className="text-xs text-rose-500 mt-2.5 font-medium animate-fade-in">
              {error}
            </p>
          )}
        </div>

        {/* Seção: Enquetes Abertas Disponíveis */}
        <div className="w-full mt-14 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                <span>Ao Vivo</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Enquetes Disponíveis
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {polls.length} {polls.length === 1 ? 'enquete ativa' : 'enquetes ativas'}
            </span>
          </div>

          {loadingPolls ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-xs font-medium">Carregando enquetes abertas...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-indigo-950/80 text-[#3903b5] dark:text-indigo-400 flex items-center justify-center mb-3">
                <Trophy className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Nenhuma enquete aberta no momento
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
                Crie sua primeira enquete no painel do administrador para que os participantes possam votar!
              </p>
              <Link
                href="/admin/polls/new"
                className="px-5 py-2.5 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20"
              >
                Criar Nova Enquete
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {polls.map((poll) => {
                const voteCount =
                  Array.isArray(poll.poll_votes) && poll.poll_votes.length > 0 && typeof poll.poll_votes[0]?.count === 'number'
                    ? poll.poll_votes[0].count
                    : Array.isArray(poll.poll_votes)
                    ? poll.poll_votes.length
                    : 0;
                const itemCount = poll.poll_items ? poll.poll_items.length : 0;

                return (
                  <div
                    key={poll.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#3903b5]/40 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Topo do Card */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 text-[#3903b5] dark:text-indigo-400 rounded-lg">
                          {poll.code}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                          {poll.require_name ? 'Exige Nome' : 'Anônima'}
                        </span>
                      </div>

                      {/* Título da Enquete */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#3903b5] dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {poll.title}
                      </h3>

                      {poll.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {poll.description}
                        </p>
                      )}

                      {/* Métricas */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-[#3903b5] dark:text-indigo-400" />
                          <strong>{voteCount}</strong> votos
                        </span>
                        <span>•</span>
                        <span>
                          <strong>{itemCount}</strong> opções
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação Direta */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                      <Link
                        href={`/p/${poll.code}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#3903b5] hover:bg-[#2e0294] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                      >
                        <Vote className="w-3.5 h-3.5" />
                        Votar
                      </Link>

                      <Link
                        href={`/p/${poll.code}/results`}
                        target="_blank"
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-blue-50/60 dark:bg-indigo-950/30 hover:bg-blue-100 text-[#3903b5] dark:text-indigo-300 text-xs font-bold transition-colors"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Telão
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Rodapé Limpo com Logotipos */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 py-6 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo BeeRank"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              BeeRank 🐝
            </span>
            <span className="text-xs text-slate-400">
              — Ranking colaborativo inteligente
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs text-slate-500 hover:text-[#3903b5] dark:hover:text-indigo-400 transition-colors"
            >
              Área Administrativa
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
