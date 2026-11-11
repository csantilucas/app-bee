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
      <div className="bg-blue-50/80 dark:bg-indigo-950/30 border border-blue-200/80 dark:border-indigo-800/40 p-3 sm:p-3.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 text-slate-800 dark:text-indigo-200 text-xs sm:text-sm animate-slide-up">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#3903b5] dark:text-indigo-400" />
        <span className="leading-snug">
          <strong>Como votar:</strong> Ordene as opções do <strong>1º ao último</strong> arrastando ou tocando nas setas. A 1ª ganha mais pontos!
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
              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border transition-all duration-200 select-none hover:-translate-y-0.5 ${borderStyle} ${
                draggedIndex === index ? 'opacity-50 scale-[0.98] border-dashed border-[#3903b5]' : 'hover:border-indigo-300'
              }`}
            >
              {/* Ícone de Arrastar (mais discreto em mobile) */}
              <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 shrink-0">
                <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Badge de Posição (1º, 2º, 3º...) */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm shrink-0 transition-colors ${badgeColor}`}
              >
                {isFirst ? <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : `${position}º`}
              </div>

              {/* Título e Descrição da Escolha - Quebra de texto fluida e sem truncar */}
              <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white break-words whitespace-normal leading-snug">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 break-words whitespace-normal mt-0.5 leading-normal">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Botões de Subir / Descer Posição */}
              <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Subir posição"
                  className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-[#3903b5] dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1}
                  title="Descer posição"
                  className="p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-[#3903b5] dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full mt-3 py-3.5 sm:py-4 px-6 bg-[#3903b5] hover:bg-[#2e0294] active:scale-[0.99] text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 transition-all text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Enviando seu voto...
          </>
        ) : (
          'Confirmar e Enviar Voto'
        )}
      </button>
    </div>
  );
}
