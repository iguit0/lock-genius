'use client';

import Link from 'next/link';

import { Icons } from '@/components/icons';
import PasswordGenerator from '@/components/password-generator';

export default function Generator() {
  return (
    <section className="container mt-4 flex flex-col items-center gap-3 px-4 text-center sm:mt-8 md:mt-10 lg:mt-12">
      <PasswordGenerator />

      <Link
        className="mt-4 flex items-center gap-2 text-sm underline underline-offset-4 transition-colors hover:text-primary sm:mt-6"
        href="/"
      >
        <Icons.arrowLeft className="size-5" />
        Back to Home
      </Link>
    </section>
  );
}
