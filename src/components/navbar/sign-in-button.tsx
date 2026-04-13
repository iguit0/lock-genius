'use client';

import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';
import { Icons } from '../icons';
import { useToast } from '../ui/use-toast';

type SignInButtonProps = ButtonProps & {
  alternativeIcon?: boolean;
};

export const SignInButton = ({ fullWidth, size, alternativeIcon = false }: SignInButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = () => {
    setLoading(true);

    signIn
      .social({ provider: 'github' })
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
      disabled={loading}
      className="flex gap-2"
      fullWidth={fullWidth}
      size={size}
      onClick={handleSignIn}
    >
      {loading ? (
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
