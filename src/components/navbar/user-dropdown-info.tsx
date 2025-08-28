'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserInfo } from './user-dropdown';

import { getInitials } from '@/lib/utils';

type UserDropdownInfoProps = {
  userInfo: UserInfo;
};

export const UserDropdownInfo = ({ userInfo }: UserDropdownInfoProps) => {
  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="size-10">
        <AvatarImage alt={userInfo.image.alt} src={userInfo.image.src} />
        <AvatarFallback>
          {getInitials(userInfo.name || 'Unknown User')}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm font-medium">
        {userInfo.name}
        <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
          {userInfo.email}
        </p>
      </div>
    </div>
  );
};
