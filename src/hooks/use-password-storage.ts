import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface StoredPassword {
  id: string;
  password: string;
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  createdAt: Date;
}

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

interface ApiStoredPassword {
  id: string;
  password: string;
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  createdAt: string; // ISO string from API
}

const LOCAL_STORAGE_KEY = 'lock-genius-passwords';
const MAX_LOCAL_PASSWORDS = 50;

export const usePasswordStorage = () => {
  const { data: session, status } = useSession();
  const [localPasswords, setLocalPasswords] = useState<StoredPassword[]>([]);

  // Load passwords from local storage
  useEffect(() => {
    // Only load from localStorage if not authenticated
    if (status === 'unauthenticated') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const passwords: LocalStoredPassword[] = JSON.parse(stored);
          setLocalPasswords(
            passwords.map((p: LocalStoredPassword) => ({
              ...p,
              createdAt: new Date(p.createdAt),
            }))
          );
        }
      } catch (error) {
        console.error('Error loading passwords from local storage:', error);
      }
    } else if (status === 'authenticated') {
      // Clear local passwords when authenticated
      setLocalPasswords([]);
    }
  }, [status]);

  // Save password
  const savePassword = async (
    passwordData: Omit<StoredPassword, 'id' | 'createdAt'>
  ) => {
    const newPassword: StoredPassword = {
      ...passwordData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    if (session) {
      // Save in database
      try {
        const response = await fetch('/api/v1/passwords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPassword),
        });

        if (!response.ok) throw new Error('Error saving password');

        return await response.json();
      } catch (error) {
        console.error('Error saving password to database:', error);
        throw error;
      }
    } else {
      // Save in local storage
      const updatedPasswords = [newPassword, ...localPasswords].slice(
        0,
        MAX_LOCAL_PASSWORDS
      );
      setLocalPasswords(updatedPasswords);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPasswords));
      return newPassword;
    }
  };

  // Fetch passwords
  const getPasswords = async (): Promise<StoredPassword[]> => {
    if (session) {
      try {
        const response = await fetch('/api/v1/passwords');
        if (!response.ok) throw new Error('Error fetching passwords');
        const passwords: ApiStoredPassword[] = await response.json();
        return passwords.map((p: ApiStoredPassword) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
      } catch (error) {
        console.error('Error fetching passwords from database:', error);
        return [];
      }
    } else {
      return localPasswords;
    }
  };

  // Delete password
  const deletePassword = async (id: string) => {
    if (session) {
      try {
        const response = await fetch(`/api/v1/passwords/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting password');
      } catch (error) {
        console.error('Error deleting password from database:', error);
        throw error;
      }
    } else {
      const updatedPasswords = localPasswords.filter((p) => p.id !== id);
      setLocalPasswords(updatedPasswords);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPasswords));
    }
  };

  return {
    savePassword,
    getPasswords,
    deletePassword,
    passwords: session ? [] : localPasswords, // For authenticated users, load from API
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  };
};
