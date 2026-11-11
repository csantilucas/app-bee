'use client';

import React, { useState } from 'react';
import { PollItem } from '@/types/poll';
import { ChevronUp, ChevronDown, GripVertical, Trophy, Sparkles } from 'lucide-react';

interface VotingListProps {
  items: PollItem[];
  onSubmitVote: (orderedItemIds: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export function VotingList({ items: initialItems, onSubmitVote, isSubmitting }: VotingListProps) {
  const [items, setItems] = useState<PollItem[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setItems(newItems);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const itemToMove = newItems.splice(draggedIndex, 1)[0];
    newItems.splice(index, 0, itemToMove);
    setDraggedIndex(index);
    setItems(newItems);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    const orderedIds = items.map((i) => i.id);
    onSubmitVote(orderedIds);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 animate-fade-in">
      <div className="bg-blue-50/80 dark:bg-indigo-950/30 border border-blue-200/80 dark:border-indigo-800/40 p-3.5 rounded-2xl flex items-center gap-3 text-slate-800 dark:text-indigo-200 text-xs sm:text-sm animate-slide-up">
        <Sparkles className="w-5 h-5 shrink-0 text-[#3903b5] dark:text-indigo-400" />
        <span>
          <strong>Instrução:</strong> Organize as opções do <strong>1º ao último</strong> arrastando ou usando as setas. Sua 1ª opção ganha o maior número de pontos!
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item, index) => {
          const position = index + 1;
          const isFirst = position === 1;
          const isSecond = position === 2;
          const isThird = position === 3;

          let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
          let borderStyle = 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm';

          if (isFirst) {
            badgeColor = 'bg-[#3903b5] text-white font-bold shadow-md shadow-indigo-600/30';
            borderStyle = 'border-indigo-300 dark:border-indigo-600/60 bg-blue-50/30 dark:bg-indigo-950/20 shadow-md shadow-indigo-600/5 ring-1 ring-[#3903b5]/20';
          } else if (isSecond) {
            badgeColor = 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold';
            borderStyle = 'border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40';
          } else if (isThird) {
            badgeColor = 'bg-blue-100 text-[#3903b5] dark:bg-indigo-900/60 dark:text-indigo-300 font-bold';
            borderStyle = 'border-blue-200 dark:border-indigo-900/50 bg-blue-50/20';
          }

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 select-none hover:-translate-y-0.5 ${borderStyle} ${
                draggedIndex === index ? 'opacity-50 scale-[0.98] border-dashed border-[#3903b5]' : 'hover:border-indigo-300'
              }`}
            >
              <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400">
                <GripVertical className="w-5 h-5" />
              </div>

              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 transition-colors ${badgeColor}`}
              >
                {isFirst ? <Trophy className="w-4 h-4" /> : `${position}º`}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Subir posição"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#3903b5] dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1}
                  title="Descer posição"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#3903b5] dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full mt-3 py-4 px-6 bg-[#3903b5] hover:bg-[#2e0294] active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all text-base flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Trophy className="w-5 h-5" />
            Confirmar e Enviar Meu Ranking
          </>
        )}
      </button>
    </div>
  );
}
