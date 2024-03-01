'use client';

import Link from 'next/link';

import PasswordGenerator from '@/components/password-generator';

export default function Generator() {
  return (
    <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
      <h1 className="mb-1 font-mono text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        Password Generator
      </h1>
      <PasswordGenerator />

      <Link
        className="inline-block text-sm underline underline-offset-[4px]"
        href="/"
      >
        Back to Home
      </Link>
    </section>
  );
}
