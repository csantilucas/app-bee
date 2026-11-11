'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [pollCode, setPollCode] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Topo Limpo */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between animate-fade-in">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
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

        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#3903b5] hover:bg-white dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200"
        >
          <Lock className="w-3.5 h-3.5" />
          Acesso Admin
        </Link>
      </header>

      {/* Conteúdo Central Minimalista */}
      <main className="w-full max-w-lg mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Logo Central com Efeito Suave */}
        <div className="relative w-28 h-28 mb-6 animate-scale-in">
          <div className="absolute inset-0 bg-[#3903b5]/15 dark:bg-indigo-500/20 rounded-3xl blur-xl" />
          <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Logo BeeRank"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Título e Subtítulo Curtos */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 animate-slide-up">
          Participe do <span className="text-[#3903b5] dark:text-indigo-400">Ranking</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8 animate-slide-up">
          Insira o código compartilhado para ordenar as opções e ver o pódio em tempo real.
        </p>

        {/* Formulário de Código da Enquete */}
        <form
          onSubmit={handleEnterPoll}
          className="w-full bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row gap-2 animate-slide-up"
        >
          <input
            type="text"
            placeholder="Código da Enquete (ex: BEE-DEMO)"
            value={pollCode}
            onChange={(e) => {
              setPollCode(e.target.value);
              setError('');
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-mono uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3903b5] transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#3903b5] hover:bg-[#2e0294] text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 active:scale-95 cursor-pointer shrink-0"
          >
            Entrar
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {error && (
          <p className="text-xs text-rose-500 mt-3 animate-fade-in font-medium">
            {error}
          </p>
        )}

        {/* Botão Secundário para Criar */}
        <div className="mt-8 flex items-center gap-4 animate-fade-in">
          <Link
            href="/admin/polls/new"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#3903b5] dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar uma nova enquete
          </Link>
        </div>
      </main>

      {/* Rodapé Simples */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 dark:text-slate-600 animate-fade-in">
        BeeRank 🐝
      </footer>
    </div>
  );
}
