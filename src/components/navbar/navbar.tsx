'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Icons } from '../icons';

import { SignInButton } from '@/components/navbar/sign-in-button';
import { ThemeToggle } from '@/components/navbar/theme-toggle';
import { UserDropdown } from '@/components/navbar/user-dropdown';
import { siteConfig } from '@/lib/constant';

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold">
          <Icons.bookLock className="size-6" />
          {siteConfig.title}
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <UserDropdown session={session} />
          ) : (
            <SignInButton size="sm" />
          )}
        </div>
      </div>
    </header>
  );
};
