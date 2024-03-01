import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getInitials = (name: string) => {
  const nameArray = name.split(' ');
  const firstNameIn = nameArray[0].charAt(0).toUpperCase();
  const lastNameIn = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
  return firstNameIn + lastNameIn;
};
