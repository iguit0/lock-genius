'use client';

import Image from 'next/image';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/auth-client';
import { UserDropdownInfo } from './user-dropdown-info';

export interface UserInfo {
  name: string;
  email: string;
  image: {
    src: string;
    alt: string;
  };
}

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export const UserDropdown = ({ user }: UserDropdownProps) => {
  const imgSrc = user.image || '';
  const userName = user.name || '';
  const imgAlt = userName || 'User profile image';
  const userEmail = user.email || '';

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
          alt={imgAlt}
          src={imgSrc}
          width={32}
          height={32}
          className="size-8 overflow-hidden rounded-full border-2 border-slate-700 hover:cursor-pointer dark:border-white"
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
