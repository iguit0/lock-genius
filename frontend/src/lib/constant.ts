import { env } from '@/env.mjs';

export const siteConfig = {
  title: 'Lock Genius',
  description: 'A simple password manager',
  keywords: ['Password Manager', 'Lock Genius'],
  url: env.NEXT_PUBLIC_SITE_URL || 'https://lock-genius-one.vercel.app',
};
