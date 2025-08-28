'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

import { Icons } from '../icons';

import { SignInButton } from '@/components/navbar/sign-in-button';
import { ThemeToggle } from '@/components/navbar/theme-toggle';
import { UserDropdown } from '@/components/navbar/user-dropdown';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/constant';

export const Navbar = () => {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold">
          <Icons.bookLock className="size-6" />
          {siteConfig.title}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/generator"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Generator
          </Link>
          <Link
            href="/passwords"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            My Passwords
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <UserDropdown session={session} />
          ) : (
            <SignInButton size="sm" />
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <Icons.menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <nav className="container px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              href="/generator"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={closeMobileMenu}
            >
              Generator
            </Link>
            <Link
              href="/passwords"
              className="block text-sm font-medium transition-colors hover:text-primary py-2"
              onClick={closeMobileMenu}
            >
              My Passwords
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
