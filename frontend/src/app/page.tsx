import { getServerSession } from 'next-auth/next';

import { options as authOptions } from '@/app/api/auth/route';
import PasswordGenerator from '@/components/password-generator';

export default async function Home() {
  const session = await getServerSession(authOptions);

  const isAuthenticated = !!session;

  return (
    <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
      <h1 className="mb-1 font-mono text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
        {isAuthenticated
          ? 'Password Generator'
          : 'Securely manage your passwords'}
      </h1>
      <p className="text-muted-foreground max-w-2xl">
        {isAuthenticated ? (
          'Generate and save your best choices'
        ) : (
          <span>
            <strong>Sign in</strong> and be able to <strong>save</strong> your
            favorite passwords
          </span>
        )}
      </p>
      <PasswordGenerator />
    </section>
  );
}
