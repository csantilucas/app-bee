'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Poll, PollItem } from '@/types/poll';
import { getOrCreateVoterSessionId, hasUserVoted, saveUserVoted } from '@/lib/voter-session';
import { VotingList } from '@/components/voting/VotingList';
import { Trophy, CheckCircle2, AlertCircle, ArrowRight, User, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';

function VotingContent() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string)?.toUpperCase();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [items, setItems] = useState<PollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [voterName, setVoterName] = useState('');
  const [nameStepCompleted, setNameStepCompleted] = useState(false);
  const [nameError, setNameError] = useState('');

  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedSuccess, setVotedSuccess] = useState(false);

  useEffect(() => {
    if (!code) return;

    if (hasUserVoted(code)) {
      setAlreadyVoted(true);
    }

    async function loadPoll() {
      try {
        const res = await fetch(`/api/polls/${code}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Enquete não encontrada');
        }
        const data = await res.json();
        setPoll(data.poll);
        setItems(data.poll.poll_items || []);

        if (!data.poll.require_name) {
          setNameStepCompleted(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPoll();
  }, [code]);

  const handleStartVotingWithName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterName.trim()) {
      setNameError('Por favor, informe seu nome ou apelido para continuar');
      return;
    }
    setNameError('');
    setNameStepCompleted(true);
  };

  const handleSubmitVote = async (orderedItemIds: string[]) => {
    if (!code || !poll) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const voterSessionId = getOrCreateVoterSessionId();

      const res = await fetch(`/api/polls/${code}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterSessionId,
          voterName: poll.require_name ? voterName.trim() : undefined,
          orderedItemIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyVoted) {
          setAlreadyVoted(true);
        }
        throw new Error(data.error || 'Erro ao processar voto');
      }

      saveUserVoted(code);
      setVotedSuccess(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3903b5', '#2563eb', '#38bdf8', '#ffffff'],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando enquete...</p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Enquete Indisponível</h2>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">{error}</p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 bg-[#3903b5] hover:bg-[#2e0294] text-white rounded-xl font-semibold transition-colors"
        >
          Voltar para o Início
        </Link>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo BeeRank"
              fill
              className="object-cover"
            />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
            Bee<span className="text-[#3903b5] dark:text-indigo-400">Rank</span>
          </span>
        </Link>
        <Link
          href={`/p/${code}/results`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-[#3903b5] dark:text-indigo-400" />
          Ver Pódio
        </Link>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 flex flex-col">
        {/* Cabeçalho da Enquete */}
        <div className="text-center mb-6 animate-slide-up">
          <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#3903b5] dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            Código: {poll.code}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {poll.description}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2.5 text-red-700 dark:text-red-300 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {votedSuccess || alreadyVoted ? (
          <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 rounded-3xl p-6 sm:p-8 text-center shadow-xl flex flex-col items-center my-auto animate-scale-in">
            <div className="w-16 h-16 bg-blue-50 dark:bg-indigo-950 text-[#3903b5] dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {votedSuccess ? 'Voto Registrado com Sucesso!' : 'Você Já Votou Nesta Enquete!'}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Sua escolha foi computada no ranking coletivo. Acompanhe as posições no pódio ao vivo!
            </p>

            <Link
              href={`/p/${code}/results`}
              className="mt-6 w-full py-3.5 px-6 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Ver Resultados e Pódio ao Vivo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : !nameStepCompleted && poll.require_name ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl my-auto animate-scale-in">
            <div className="w-12 h-12 bg-blue-50 dark:bg-indigo-950 text-[#3903b5] rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white">
              Identificação Necessária
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mt-1 mb-6">
              Informe seu nome ou apelido para iniciar a votação.
            </p>

            <form onSubmit={handleStartVotingWithName} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Seu Nome ou Apelido
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lucas"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3903b5]"
                  autoFocus
                />
                {nameError && (
                  <span className="text-xs text-red-500 mt-1 block">{nameError}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
              >
                Continuar para a Votação
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col">
            {poll.require_name && voterName && (
              <div className="mb-4 text-center animate-fade-in">
                <span className="text-xs text-slate-500">
                  Votando como: <strong className="text-slate-800 dark:text-slate-200">{voterName}</strong>
                </span>
              </div>
            )}
            <VotingList
              items={items}
              onSubmitVote={handleSubmitVote}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function PollVotingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Carregando enquete...</p>
        </div>
      }
    >
      <VotingContent />
    </Suspense>
  );
}
