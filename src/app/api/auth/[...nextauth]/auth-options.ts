import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

import { env } from '@/env.mjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: env.AUTH_GITHUB_ID || '',
      clientSecret: env.AUTH_GITHUB_SECRET || '',
    }),
  ],
};
