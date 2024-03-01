import { getServerSession } from 'next-auth/next';

import { authOptions } from './api/auth/[...nextauth]/auth-options';

import { HomeActions } from '@/components/home/actions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  const isAuthenticated = !!session;

  return (
    <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
      <h1 className="mb-1 font-mono text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        👋 Say goodbye to weak passwords
      </h1>
      <p className="text-muted-foreground max-w-2xl">
        {isAuthenticated ? (
          'Generate and save your best choices'
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            Generate <strong>strong passwords</strong> and{' '}
            <strong>store</strong> them in your digital vault
          </span>
        )}
      </p>

      <HomeActions isAuthenticated={isAuthenticated} />
    </section>
  );
}
