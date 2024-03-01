'use client';

import { signIn, useSession } from 'next-auth/react';

import { Icons } from '../icons';

import { Button } from '@/components/ui/button';

export const SignInButton = () => {
  const { status } = useSession({
    required: true,
  });

  return (
    <Button
      disabled={status === 'loading'}
      className="flex gap-1"
      onClick={() => signIn('github')}
    >
      <Icons.githubAlternative className="size-6" />
      Sign in with GitHub
    </Button>
  );
};
