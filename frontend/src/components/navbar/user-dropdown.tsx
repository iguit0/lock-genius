'use client';

import Image from 'next/image';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

import { UserDropdownInfo } from './user-dropdown-info';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface UserInfo {
  name: string;
  email: string;
  image: {
    src: string;
    alt: string;
  };
}

export const UserDropdown = ({ session }: { session: Session }) => {
  const imgSrc = session.user?.image || '';
  const userName = session.user?.name || '';
  const imgAlt = userName || 'User profile image';
  const userEmail = session.user?.email || '';

  const userInfo: UserInfo = {
    name: userName,
    email: userEmail,
    image: {
      src: imgSrc,
      alt: imgAlt,
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          className="overflow-hidden rounded-full border-2 border-slate-700 hover:cursor-pointer dark:border-white"
          alt={imgAlt}
          src={imgSrc}
          width={32}
          height={32}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <UserDropdownInfo userInfo={userInfo} />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <Icons.logOut className="mr-2 size-4" /> <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
