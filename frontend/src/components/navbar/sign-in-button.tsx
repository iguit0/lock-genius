'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

import { Icons } from '../icons';
import { useToast } from '../ui/use-toast';

import { Button } from '@/components/ui/button';

export const SignInButton = () => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isLoading = loading || status === 'loading';

  useEffect(() => {
    if (loading) {
      toast({
        title: 'Authenticating...',
      });
    }
    if (status === 'authenticated' && !session) {
      toast({
        title: 'Session expired.',
        description: 'Please sign in again.',
        variant: 'destructive',
      });
    }
  }, [session, status, toast, loading]);

  const handleSignIn = () => {
    setLoading(true);

    signIn('github').catch(() => {
      toast({
        title: 'Authentication error',
        description: 'Please try again',
        variant: 'destructive',
      });
    });
  };

  return (
    <Button
      disabled={isLoading}
      className="flex gap-1"
      size="sm"
      onClick={handleSignIn}
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-sm">
          <Icons.loader className="animate-spin" />
          Processing
        </div>
      ) : (
        <>
          <Icons.githubAlternative className="size-6" />
          Sign in
        </>
      )}
    </Button>
  );
};
