'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Icons } from '../icons';
import { useToast } from '../ui/use-toast';

type SignInButtonProps = ButtonProps & {
  alternativeIcon?: boolean;
};

export const SignInButton = ({ fullWidth, size, alternativeIcon = false }: SignInButtonProps) => {
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

    signIn('github')
      .catch(() => {
        toast({
          title: 'Authentication error',
          description: 'Please try again',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Button
      disabled={isLoading}
      className="flex gap-2"
      fullWidth={fullWidth}
      size={size}
      onClick={handleSignIn}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm">
          <Icons.loader className="size-4 animate-spin" />
          Processing
        </div>
      ) : (
        <>
          {alternativeIcon ? (
            <Icons.github className="size-4" />
          ) : (
            <Icons.githubAlternative className="size-4" />
          )}
          Sign in
        </>
      )}
    </Button>
  );
};
