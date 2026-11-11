'use client';

import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Download, X, ExternalLink, QrCode } from 'lucide-react';
import Image from 'next/image';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code: string;
}

export function QrCodeModal({ isOpen, onClose, title, code }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pollUrl = `${origin}/p/${code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `beerank-${code}-qrcode.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-scale-in">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Icon */}
        <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-3">
          <Image
            src="/favoo-logo.png"
            alt="BeeRank Logo"
            fill
            className="object-cover"
          />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Compartilhar Enquete
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {title}
        </p>

        {/* QR Code Canvas */}
        <div
          ref={qrRef}
          className="mt-6 p-4 bg-white rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center"
        >
          <QRCodeCanvas
            value={pollUrl}
            size={220}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#3903b5] dark:text-indigo-400 rounded-lg uppercase tracking-wider font-mono">
            Código: {code}
          </span>
        </div>

        {/* Link box */}
        <div className="w-full mt-4 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <input
            type="text"
            readOnly
            value={pollUrl}
            className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none truncate font-mono"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3903b5] hover:bg-[#2e0294] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="w-full mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar QR
          </button>
          <a
            href={`/p/${code}/results`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3903b5] hover:bg-[#2e0294] text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-600/25"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Telão
          </a>
        </div>
      </div>
    </div>
  );
}
