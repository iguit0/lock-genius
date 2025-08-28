'use client';

import Link from 'next/link';

import { Icons } from '@/components/icons';
import PasswordGenerator from '@/components/password-generator';

export default function Generator() {
  return (
    <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
      <PasswordGenerator />

      <Link
        className="mt-2 flex items-center gap-2 text-sm underline underline-offset-4"
        href="/"
      >
        <Icons.arrowLeft className="size-5" />
        Back to Home
      </Link>
    </section>
  );
}
