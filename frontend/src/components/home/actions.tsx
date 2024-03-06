'use client';

import Link from 'next/link';

import { SignInButton } from '@/components/navbar/sign-in-button';

export const HomeActions = () => {
  return (
    <div className="mx-auto mt-6 w-full max-w-sm space-y-5">
      <SignInButton fullWidth size="lg" alternativeIcon />

      <Link
        className="inline-block text-sm underline underline-offset-[4px]"
        href="/generator"
      >
        Continue without an account
      </Link>
    </div>
  );
};
