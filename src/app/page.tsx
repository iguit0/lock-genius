'use client';
import { useSession } from 'next-auth/react';

import { HomeActions } from '@/components/home/actions';
import { GridBeams } from '@/components/ui/grid-beams';

export default function Home() {
  const { data: session } = useSession();

  const isAuthenticated = !!session;

  return (
    <GridBeams className="min-h-screen">
      <section className="container mt-4 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 text-center sm:mt-8 sm:gap-6 md:mt-12 md:gap-8 lg:mt-16">
        <div className="animate-fade-in-up space-y-4 sm:space-y-6 md:space-y-8">
          <h1 className="text-foreground font-mono text-2xl font-extrabold leading-tight tracking-tighter transition-all duration-300 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            👋 Say goodbye to weak passwords
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-sm transition-all duration-300 sm:text-base md:text-lg lg:max-w-3xl">
            {isAuthenticated ? (
              'Generate and save your best choices'
            ) : (
              <span className="text-muted-foreground/90">
                Generate{' '}
                <strong className="text-foreground font-semibold">
                  strong passwords
                </strong>{' '}
                and{' '}
                <strong className="text-foreground font-semibold">store</strong>{' '}
                them in your digital vault
              </span>
            )}
          </p>
        </div>

        {!isAuthenticated && (
          <div className="animate-scale-in">
            <HomeActions />
          </div>
        )}
      </section>
    </GridBeams>
  );
}
