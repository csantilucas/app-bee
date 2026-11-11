'use client';

import React from 'react';
import { RankedItemResult } from '@/types/poll';
import { Award } from 'lucide-react';

interface LiveRankingListProps {
  items: RankedItemResult[];
  totalVotes: number;
}

export function LiveRankingList({ items, totalVotes }: LiveRankingListProps) {
  if (!items || items.length === 0) return null;

  const maxScore = Math.max(...items.map((i) => i.totalScore), 1);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {items.map((item) => {
        const percentage = Math.round((item.totalScore / maxScore) * 100);
        const isPodium = item.rank <= 3;

        let badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        let barColor = 'from-[#3903b5] to-indigo-500';

        if (item.rank === 1) {
          badgeStyle = 'bg-[#3903b5] text-white font-bold shadow-sm shadow-indigo-600/30';
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
            className="relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Barra de progresso sutil ao fundo */}
            <div
              className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${barColor} opacity-10 transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}
                >
                  {item.rank}º
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  {item.firstChoiceCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-[#3903b5] dark:text-indigo-400 mt-0.5">
                      <Award className="w-3 h-3" />
                      <span>{item.firstChoiceCount}x em 1º lugar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="text-base sm:text-lg font-black text-[#3903b5] dark:text-indigo-400">
                  {item.totalScore} <span className="text-xs font-medium text-slate-400">pts</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Méd. {item.averagePosition}º
                </span>
              </div>
            </div>

            {/* Linha visual de progresso */}
            <div className="relative w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
