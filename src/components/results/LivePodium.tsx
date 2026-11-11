'use client';

import React from 'react';
import { RankedItemResult } from '@/types/poll';
import { Crown, Medal, Users } from 'lucide-react';

interface LivePodiumProps {
  items: RankedItemResult[];
}

export function LivePodium({ items }: LivePodiumProps) {
  if (!items || items.length < 2) return null;

  // Agrupar itens por colocação distinta para suportar empates no mesmo pódio
  const distinctRanks = Array.from(new Set(items.map((i) => i.rank))).sort((a, b) => a - b);
  const rank1 = distinctRanks[0] ?? 1;
  const rank2 = distinctRanks[1];
  const rank3 = distinctRanks[2];

  const firstTier = items.filter((i) => i.rank === rank1);
  const secondTier = rank2 !== undefined ? items.filter((i) => i.rank === rank2) : [];
  const thirdTier = rank3 !== undefined ? items.filter((i) => i.rank === rank3) : [];

  const maxScore = Math.max(...items.map((i) => i.totalScore), 1);
  const p1Score = firstTier[0]?.totalScore ?? 0;
  const p2Score = secondTier[0]?.totalScore ?? 0;
  const p3Score = thirdTier[0]?.totalScore ?? 0;

  // Alturas dinâmicas animadas proporcionais à pontuação real
  const p1Height = 180;
  const p2Height = Math.max(70, Math.round((p2Score / maxScore) * 155));
  const p3Height = thirdTier.length > 0 ? Math.max(55, Math.round((p3Score / maxScore) * 135)) : 0;

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-2 animate-fade-in">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end justify-center pt-8 min-h-[300px]">
        {/* 2º Lugar (Prata / Esquerda) */}
        {secondTier.length > 0 ? (
          <div className="flex flex-col items-center text-center transition-all duration-700 ease-out">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-extrabold text-sm sm:text-base border-2 border-slate-300 dark:border-slate-500 shadow-md mb-2 transition-transform duration-500 hover:scale-110">
              <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-300" />
            </div>

            {secondTier.length > 1 && (
              <span className="px-2 py-0.5 mb-1 text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> Empate ({secondTier.length})
              </span>
            )}

            <div className="flex flex-col gap-1 w-full items-center">
              {secondTier.map((item) => (
                <div key={item.itemId} className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 max-w-[100px] sm:max-w-[140px] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#3903b5] dark:text-indigo-400">
                    <span className="font-extrabold">{item.totalScore}</span> pts
                  </span>
                </div>
              ))}
            </div>

            {/* Coluna Dinâmica 2º Lugar */}
            <div
              style={{ height: `${p2Height}px` }}
              className="w-full mt-2 rounded-t-2xl bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-t-4 border-slate-400 dark:border-slate-500 shadow-md flex items-center justify-center transition-all duration-1000 ease-out"
            >
              <span className="text-2xl sm:text-3xl font-black text-slate-500 dark:text-slate-400 select-none">
                {secondTier[0]?.rank}º
              </span>
            </div>
          </div>
        ) : (
          <div className="opacity-0" />
        )}

        {/* 1º Lugar (Azul Real / Centro) */}
        {firstTier.length > 0 && (
          <div className="flex flex-col items-center text-center transition-all duration-700 ease-out z-10">
            <div className="relative mb-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[#3903b5] dark:text-indigo-400 animate-bounce">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 fill-current drop-shadow" />
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-50 dark:bg-indigo-950/80 text-[#3903b5] dark:text-indigo-300 flex items-center justify-center font-black text-base sm:text-xl border-4 border-[#3903b5] shadow-xl shadow-indigo-600/25 transition-transform duration-500 hover:scale-110">
                1º
              </div>
            </div>

            {firstTier.length > 1 && (
              <span className="px-2 py-0.5 mb-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-indigo-950 text-[#3903b5] dark:text-indigo-300 rounded-full flex items-center gap-1 border border-blue-200 dark:border-indigo-800">
                <Users className="w-2.5 h-2.5" /> Empate no 1º Lugar! ({firstTier.length})
              </span>
            )}

            <div className="flex flex-col gap-1 w-full items-center">
              {firstTier.map((item) => (
                <div key={item.itemId} className="flex flex-col items-center">
                  <span className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-2 max-w-[110px] sm:max-w-[170px] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#3903b5] dark:text-indigo-400">
                    <span className="font-black text-sm sm:text-base">{item.totalScore}</span> pts
                  </span>
                </div>
              ))}
            </div>

            {/* Coluna Dinâmica 1º Lugar */}
            <div
              style={{ height: `${p1Height}px` }}
              className="w-full mt-2 rounded-t-2xl bg-gradient-to-t from-[#3903b5] to-indigo-600 border-t-4 border-indigo-400 shadow-2xl shadow-indigo-600/30 flex items-center justify-center transition-all duration-1000 ease-out relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-50 animate-pulse pointer-events-none" />
              <span className="text-3xl sm:text-4xl font-black text-white select-none relative z-10">
                1º
              </span>
            </div>
          </div>
        )}

        {/* 3º Lugar (Direita) */}
        {thirdTier.length > 0 ? (
          <div className="flex flex-col items-center text-center transition-all duration-700 ease-out">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-indigo-950/60 text-[#3903b5] dark:text-indigo-300 flex items-center justify-center font-extrabold text-sm sm:text-base border-2 border-blue-200 dark:border-indigo-800 shadow-md mb-2 transition-transform duration-500 hover:scale-110">
              <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-[#3903b5] dark:text-indigo-400" />
            </div>

            {thirdTier.length > 1 && (
              <span className="px-2 py-0.5 mb-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-indigo-950 text-[#3903b5] dark:text-indigo-300 rounded-full flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> Empate ({thirdTier.length})
              </span>
            )}

            <div className="flex flex-col gap-1 w-full items-center">
              {thirdTier.map((item) => (
                <div key={item.itemId} className="flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 max-w-[100px] sm:max-w-[140px] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#3903b5] dark:text-indigo-400">
                    <span className="font-extrabold">{item.totalScore}</span> pts
                  </span>
                </div>
              ))}
            </div>

            {/* Coluna Dinâmica 3º Lugar */}
            <div
              style={{ height: `${p3Height}px` }}
              className="w-full mt-2 rounded-t-2xl bg-gradient-to-t from-blue-200 to-blue-100 dark:from-slate-800/90 dark:to-slate-800/50 border-t-4 border-blue-300 dark:border-slate-600 shadow-md flex items-center justify-center transition-all duration-1000 ease-out"
            >
              <span className="text-xl sm:text-2xl font-black text-[#3903b5] dark:text-indigo-400 select-none">
                {thirdTier[0]?.rank}º
              </span>
            </div>
          </div>
        ) : (
          <div className="opacity-0" />
        )}
      </div>
    </div>
  );
}
