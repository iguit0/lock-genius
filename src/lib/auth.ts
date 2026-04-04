import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { env } from '@/env.mjs';
import prisma from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_ID || '',
      clientSecret: env.AUTH_GITHUB_SECRET || '',
    },
  },
});
