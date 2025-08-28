'use client';

import Link from 'next/link';

export const HomeActions = () => {
  return (
    <div className="mx-auto w-full max-w-sm space-y-4 px-4 sm:px-6 md:px-8">
      <Link
        className="hover:text-foreground inline-block text-sm font-medium underline underline-offset-4 transition-all duration-200 hover:underline-offset-[6px] sm:text-base md:text-lg"
        href="/generator"
      >
        Continue without an account
      </Link>
    </div>
  );
};
