'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PollAggregateResult } from '@/types/poll';
import { LivePodium } from '@/components/results/LivePodium';
import { LiveRankingList } from '@/components/results/LiveRankingList';
import { QrCodeModal } from '@/components/admin/QrCodeModal';
import {
  Trophy,
  Users,
  Radio,
  QrCode,
  Maximize2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';

function LiveResultsContent() {
  const params = useParams();
  const code = (params?.code as string)?.toUpperCase();

  const [data, setData] = useState<PollAggregateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchResults = useCallback(async (isRealtimeTrigger = false) => {
    if (!code) return;
    if (isRealtimeTrigger) setIsUpdating(true);

    try {
      const res = await fetch(`/api/polls/${code}/results`, { cache: 'no-store' });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Falha ao carregar resultados');
      }
      const json: PollAggregateResult = await res.json();
      setData(json);
      setLastUpdated(new Date());

      if (isRealtimeTrigger) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3903b5', '#2563eb', '#38bdf8', '#ffffff'],
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, [code]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (!data?.poll?.id) return;

    const supabase = createClient();
    const channelName = `realtime_poll_${data.poll.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poll_votes',
          filter: `poll_id=eq.${data.poll.id}`,
        },
        (payload) => {
          fetchResults(payload.eventType === 'INSERT');
        }
      )
      .subscribe();

    // Fallback de polling a cada 6 segundos para redundância total
    const fallbackTimer = setInterval(() => {
      fetchResults(false);
    }, 6000);

    return () => {
      clearInterval(fallbackTimer);
      supabase.removeChannel(channel);
    };
  }, [data?.poll?.id, fetchResults]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
          Sintonizando resultados ao vivo do BeeRank...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Ops! Não foi possível carregar o ranking
        </h2>
        <p className="text-slate-500 mt-2 max-w-md text-sm">{error || 'Enquete não encontrada'}</p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 bg-[#3903b5] hover:bg-[#2e0294] text-white rounded-xl font-semibold transition-colors"
        >
          Voltar para o Início
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-fade-in">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Voltar ao início"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo BeeRank"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#3903b5] dark:text-indigo-400 tracking-wider uppercase">
                Pódio ao Vivo
              </span>
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate max-w-[200px] sm:max-w-md">
                {data.poll.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span className="hidden sm:inline">Ao Vivo</span>
          </div>

          <button
            onClick={() => setIsQrOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-indigo-950/60 hover:bg-blue-100 text-[#3903b5] dark:text-indigo-400 border border-blue-200 dark:border-indigo-800 text-xs sm:text-sm font-semibold transition-colors"
            title="Exibir QR Code para votação"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <button
            onClick={() => fetchResults(false)}
            disabled={isUpdating}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin text-[#3903b5]' : ''}`} />
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Modo Telão (Tela Cheia)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <Users className="w-4 h-4 text-[#3903b5] dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total de Votos: <strong className="text-[#3903b5] dark:text-indigo-400 text-base">{data.totalVotes}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <Sparkles className="w-4 h-4 text-[#3903b5] dark:text-indigo-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Método: <strong className="text-slate-900 dark:text-white">Borda Count</strong>
            </span>
          </div>
        </div>

        {data.totalVotes === 0 ? (
          <div className="my-12 text-center flex flex-col items-center animate-scale-in">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-indigo-950/60 text-[#3903b5] dark:text-indigo-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-indigo-800 shadow-inner">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Aguardando os primeiros votos!
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Compartilhe o QR Code para ver o pódio se formar em tempo real.
            </p>
            <button
              onClick={() => setIsQrOpen(true)}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all"
            >
              <QrCode className="w-5 h-5" />
              Abrir QR Code para Votação
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <LivePodium items={data.items} />

            <div className="w-full mt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Classificação Geral
              </h3>
              <LiveRankingList items={data.items} totalVotes={data.totalVotes} />
            </div>

            {data.recentVoters && data.recentVoters.length > 0 && (
              <div className="w-full max-w-2xl mt-8 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#3903b5] dark:text-indigo-400" />
                  Últimos Votantes:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.recentVoters.map((v, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                    >
                      {v.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <QrCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        title={data.poll.title}
        code={data.poll.code}
      />
    </div>
  );
}

export default function PollLiveResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
            Sintonizando resultados ao vivo do BeeRank...
          </p>
        </div>
      }
    >
      <LiveResultsContent />
    </Suspense>
  );
}
