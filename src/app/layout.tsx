import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BeeRank 🐝 | Ranking Colaborativo em Tempo Real',
  description:
    'Crie enquetes de ranking ordenadas, compartilhe via QR Code e veja o pódio ao vivo com pontuação Borda Count.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
