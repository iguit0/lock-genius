'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignInButton } from '@/components/navbar/sign-in-button';

export const HomeActions = ({
  isAuthenticated,
}: {
  isAuthenticated?: boolean;
}) => {
  useEffect(() => {
    if (isAuthenticated) {
      redirect('/generator');
    }
  }, [isAuthenticated]);

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
