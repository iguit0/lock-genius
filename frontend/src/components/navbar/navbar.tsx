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
    <header className="flex h-14 w-full shrink-0 items-center border-b px-4 md:px-6">
      <div className="container flex h-16 items-center justify-between ">
        <Link href="/" className="flex items-center gap-4 text-lg font-bold">
          <Icons.bookLock className="size-5" />
          {siteConfig.title}
        </Link>
        <div className="flex items-center gap-8">
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
