'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  StoredPassword,
  usePasswordStorage,
} from '@/hooks/use-password-storage';

interface LocalStoredPassword {
  id: string;
  password: string;
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  createdAt: string; // ISO string from localStorage
}

export default function PasswordsPage() {
  const { data: session, status } = useSession();
  const { getPasswords, deletePassword } = usePasswordStorage();
  const { toast } = useToast();
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPasswords = useCallback(async () => {
    try {
      setLoading(true);

      if (session) {
        // For authenticated users, fetch from API
        const fetchedPasswords = await getPasswords();
        setPasswords(fetchedPasswords);
      } else {
        // For unauthenticated users, read directly from localStorage
        const stored = localStorage.getItem('lock-genius-passwords');
        if (stored) {
          const passwords = JSON.parse(stored);
          const parsedPasswords = passwords.map((p: LocalStoredPassword) => ({
            ...p,
            createdAt: new Date(p.createdAt),
          }));
          setPasswords(parsedPasswords);
        } else {
          setPasswords([]);
        }
      }
    } catch (error) {
      toast({
        title: 'Error loading passwords',
        description: 'Could not load your passwords.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [session, getPasswords, toast]);

  useEffect(() => {
    // Only load passwords when session status is determined
    if (status === 'authenticated' || status === 'unauthenticated') {
      loadPasswords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleDeletePassword = async (id: string) => {
    try {
      await deletePassword(id);
      setPasswords(passwords.filter((p) => p.id !== id));
      toast({
        title: 'Password deleted',
        description: 'Password was successfully removed.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error deleting password',
        description: 'Could not delete the password.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: 'Copied!',
        description: 'Password copied to clipboard.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error copying',
        description: 'Could not copy the password.',
        variant: 'destructive',
      });
    }
  };

  // Show loading state while session is being determined
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Icons.loader className="size-8 animate-spin" />
          <span className="ml-2">
            {status === 'loading'
              ? 'Checking authentication...'
              : 'Loading passwords...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Passwords</h1>
        <p className="text-muted-foreground">
          {session
            ? 'Your passwords are securely saved in the database.'
            : 'Your passwords are saved locally (maximum 50). Login to sync with the cloud.'}
        </p>
      </div>

      {passwords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.lock className="size-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No passwords found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven&apos;t generated any passwords yet. Go to the password
              generator to get started!
            </p>
            <Button asChild>
              <a href="/generator">Generate Password</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-6 md:grid md:items-start">
          {passwords.map((password) => (
            <Card key={password.id} className="w-full md:w-auto">
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">
                      Generated Password
                    </CardTitle>
                    <Badge variant="secondary">
                      {password.length} characters
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(password.password)}
                    >
                      <Icons.copy className="size-4 mr-2" />
                      Copy
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-white"
                        >
                          <Icons.trash className="size-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your password.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePassword(password.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Generated on{' '}
                  {format(
                    new Date(password.createdAt),
                    "MMMM dd, yyyy 'at' HH:mm zzz"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-md font-mono text-sm break-all">
                  {password.password}
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Badge variant={password.uppercase ? 'default' : 'secondary'}>
                    Uppercase {password.uppercase ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={password.lowercase ? 'default' : 'secondary'}>
                    Lowercase {password.lowercase ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={password.numbers ? 'default' : 'secondary'}>
                    Numbers {password.numbers ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={password.symbols ? 'default' : 'secondary'}>
                    Symbols {password.symbols ? '✓' : '✗'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
