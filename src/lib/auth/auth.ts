import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET || 'beerank-secret-key-32-chars-long-9876543210',
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    modelName: 'User',
  },
  session: {
    modelName: 'Session',
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
  },
});
