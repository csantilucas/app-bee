'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RankedItemResult } from '@/types/poll';
import { Award, TrendingUp } from 'lucide-react';

interface LiveRankingListProps {
  items: RankedItemResult[];
  totalVotes: number;
}

export function LiveRankingList({ items, totalVotes }: LiveRankingListProps) {
  const prevScoresRef = useRef<Record<string, number>>({});
  const [recentlyUpdated, setRecentlyUpdated] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updated: Record<string, boolean> = {};
    let hasChanges = false;

    items.forEach((item) => {
      const prev = prevScoresRef.current[item.itemId];
      if (prev !== undefined && item.totalScore > prev) {
        updated[item.itemId] = true;
        hasChanges = true;
      }
      prevScoresRef.current[item.itemId] = item.totalScore;
    });

    if (hasChanges) {
      setRecentlyUpdated(updated);
      const timer = setTimeout(() => {
        setRecentlyUpdated({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [items]);

  if (!items || items.length === 0) return null;

  const maxScore = Math.max(...items.map((i) => i.totalScore), 1);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {items.map((item) => {
        const percentage = Math.round((item.totalScore / maxScore) * 100);
        const isBoosted = recentlyUpdated[item.itemId];
        const isTied = items.filter((i) => i.rank === item.rank).length > 1;

        let badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        let barColor = 'from-[#3903b5] to-indigo-500';

        if (item.rank === 1) {
          badgeStyle = 'bg-[#3903b5] text-white font-bold shadow-md shadow-indigo-600/30';
          barColor = 'from-[#3903b5] to-blue-600';
        } else if (item.rank === 2) {
          badgeStyle = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold';
          barColor = 'from-slate-400 to-slate-500';
        } else if (item.rank === 3) {
          badgeStyle = 'bg-blue-100 text-[#3903b5] dark:bg-indigo-950 dark:text-indigo-300 font-bold';
          barColor = 'from-blue-500 to-indigo-500';
        } else {
          barColor = 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600';
        }

        return (
          <div
            key={item.itemId}
            className={`relative bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-700 overflow-hidden ${
              isBoosted
                ? 'border-[#3903b5] dark:border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.01]'
                : 'border-slate-200/90 dark:border-slate-800'
            }`}
          >
            {/* Barra de progresso ao fundo - Anima suavemente a largura */}
            <div
              className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${barColor} opacity-10 transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 transition-transform duration-500 ${
                    isBoosted ? 'scale-110' : ''
                  } ${badgeStyle}`}
                >
                  {item.rank}º
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    {isTied && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 shrink-0">
                        Empate
                      </span>
                    )}
                    {isBoosted && (
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-bounce">
                        <TrendingUp className="w-3 h-3" />
                        <span>Subiu!</span>
                      </span>
                    )}
                  </div>
                  {item.firstChoiceCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-[#3903b5] dark:text-indigo-400 mt-0.5">
                      <Award className="w-3 h-3" />
                      <span>{item.firstChoiceCount}x em 1º lugar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className={`text-base sm:text-lg font-black transition-all duration-500 ${
                  isBoosted ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-[#3903b5] dark:text-indigo-400'
                }`}>
                  {item.totalScore} <span className="text-xs font-medium text-slate-400">pts</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Méd. {item.averagePosition}º
                </span>
              </div>
            </div>

            {/* Linha visual de progresso com animação elástica suave */}
            <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barColor} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
