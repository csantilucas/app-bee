'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save, Sparkles, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ItemState {
  id?: string;
  title: string;
}

function EditPollContent() {
  const router = useRouter();
  const params = useParams();
  const code = (params?.code as string)?.toUpperCase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<ItemState[]>([]);
  const [requireName, setRequireName] = useState(false);
  const [status, setStatus] = useState<'open' | 'closed'>('open');

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    async function loadPoll() {
      try {
        const res = await fetch(`/api/polls/${code}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erro ao carregar enquete.');
        }

        const data = await res.json();
        const poll = data.poll;
        setTitle(poll.title || '');
        setDescription(poll.description || '');
        setRequireName(Boolean(poll.require_name));
        setStatus(poll.status || 'open');

        if (poll.poll_items && poll.poll_items.length > 0) {
          setItems(
            poll.poll_items.map((pi: any) => ({
              id: pi.id,
              title: pi.title,
            }))
          );
        } else {
          setItems([{ title: '' }, { title: '' }]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    }

    loadPoll();
  }, [code]);

  const handleAddItem = () => {
    setItems([...items, { title: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) {
      alert('A enquete precisa de no mínimo 2 opções para ranqueamento.');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], title: val };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor, informe o título da enquete.');
      return;
    }

    const filteredItems = items
      .map((i) => ({ id: i.id, title: i.title.trim() }))
      .filter((i) => i.title.length > 0);

    if (filteredItems.length < 2) {
      setError('A enquete precisa de pelo menos 2 opções preenchidas.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/polls/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          requireName,
          items: filteredItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao salvar alterações.');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-3" />
        <p className="text-slate-400 text-sm">Carregando dados da enquete...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-fade-in">
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Voltar ao Painel</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-[#3903b5] dark:text-indigo-400 rounded-lg">
            {code}
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Editar Enquete
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Altere o título, status, opções e regras de votação
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm animate-scale-in">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-slide-up">
          {/* Informações Básicas */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Título da Enquete *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Priorização de Features do Q1"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3903b5] focus:border-transparent transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Descrição ou Instruções (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Arraste os itens deixando o seu favorito no topo."
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3903b5] focus:border-transparent transition-all text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Status da Enquete
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'open' | 'closed')}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3903b5]"
                >
                  <option value="open">🟢 Aberta (Aceitando votos)</option>
                  <option value="closed">🔴 Encerrada (Votação bloqueada)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Identificação
                </label>
                <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireName}
                    onChange={(e) => setRequireName(e.target.checked)}
                    className="w-4 h-4 text-[#3903b5] rounded focus:ring-[#3903b5]"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Exigir nome do votante
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Opções de Ranqueamento */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Opções para Ranqueamento
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mínimo de 2 opções para o cálculo de Borda
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-[#3903b5] dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Opção
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-bold text-slate-400 select-none">
                    {idx + 1}º
                  </span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                    placeholder={`Opção ${idx + 1}`}
                    required
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3903b5] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 2}
                    className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent cursor-pointer"
                    title="Remover opção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/dashboard"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 text-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function EditPollPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#3903b5]/20 border-t-[#3903b5] rounded-full animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      }
    >
      <EditPollContent />
    </Suspense>
  );
}
