'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Trophy, Sparkles, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewPollPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<string[]>(['', '', '']);
  const [requireName, setRequireName] = useState(false);
  const [isPublicResults, setIsPublicResults] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    setItems([...items, '']);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) {
      alert('A enquete precisa de no mínimo 2 opções para poder ser ranqueada.');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor, informe o título da enquete.');
      return;
    }

    const filteredItems = items.map((i) => i.trim()).filter((i) => i.length > 0);
    if (filteredItems.length < 2) {
      setError('A enquete precisa de pelo menos 2 opções preenchidas.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          items: filteredItems,
          requireName,
          isPublicResults,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao criar enquete.');
      }

      router.push(`/admin/dashboard?created=${data.poll.code}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 animate-fade-in">
      <div className="w-full max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-6 animate-slide-up">
          <Link
            href="/admin/dashboard"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="/logo.png"
                alt="Logo BeeRank"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Nova Enquete de Ranking
              </h1>
              <p className="text-xs text-slate-500">
                Cadastre a pergunta e as opções a serem ordenadas
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-slide-up">
          {/* Card: Detalhes Básicos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3903b5] dark:text-indigo-400" />
              1. Pergunta da Enquete
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Título da Pergunta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Qual deve ser nossa maior prioridade?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3903b5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  Instruções ou Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Ordene de acordo com o que você considera mais importante."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3903b5] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card: Opções para Ordenar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#3903b5] dark:text-indigo-400" />
                2. Opções a Serem Ranqueadas
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Mínimo de 2 opções
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={`Opção ${index + 1}`}
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3903b5]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 2}
                    className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Remover opção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#3903b5] text-slate-600 dark:text-slate-400 hover:text-[#3903b5] rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Adicionar Outra Opção
            </button>
          </div>

          {/* Card: Regras de Participação */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#3903b5] dark:text-indigo-400" />
              3. Regras de Participação
            </h2>

            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={requireName}
                  onChange={(e) => setRequireName(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#3903b5] rounded border-slate-300 focus:ring-[#3903b5]"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Exigir nome/apelido do participante
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Se desmarcado, a votação será <strong>100% anônima</strong>. Se marcado, o participante precisará se identificar antes de votar.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isPublicResults}
                  onChange={(e) => setIsPublicResults(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#3903b5] rounded border-slate-300 focus:ring-[#3903b5]"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Permitir que participantes vejam o pódio ao vivo
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permite que qualquer pessoa com o link visualize o telão e o pódio atualizados a cada novo voto.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 text-base flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer transition-all active:scale-[0.99]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Publicar Enquete & Gerar QR Code
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
