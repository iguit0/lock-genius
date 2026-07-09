import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-client';

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
  createdAt: string;
}

interface ApiStoredPassword {
  id: string;
  password: string;
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'lock-genius-passwords';
const MAX_LOCAL_PASSWORDS = 50;
type LocalSyncResult = { synced: number; failed: number };

let localSyncInFlight: { identity: string; promise: Promise<LocalSyncResult> } | null = null;
let lastCompletedLocalSyncIdentity: string | null = null;

const toPersistedPassword = (password: StoredPassword): LocalStoredPassword => ({
  ...password,
  createdAt: password.createdAt.toISOString(),
});

const readLocalPasswords = (): StoredPassword[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((password) => {
      const persisted = password as LocalStoredPassword;

      return {
        ...persisted,
        createdAt: new Date(persisted.createdAt),
      };
    });
  } catch {
    return [];
  }
};

const writeLocalPasswords = (passwords: StoredPassword[]): void => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(passwords.map((password) => toPersistedPassword(password)))
  );
};

const fingerprintPassword = (
  password: Pick<
    StoredPassword,
    'password' | 'length' | 'uppercase' | 'lowercase' | 'numbers' | 'symbols'
  >
): string =>
  JSON.stringify([
    password.password,
    password.length,
    password.uppercase,
    password.lowercase,
    password.numbers,
    password.symbols,
  ]);

const toPasswordPayload = (
  password: Pick<
    StoredPassword,
    'password' | 'length' | 'uppercase' | 'lowercase' | 'numbers' | 'symbols'
  >
): Omit<StoredPassword, 'id' | 'createdAt'> => ({
  password: password.password,
  length: password.length,
  uppercase: password.uppercase,
  lowercase: password.lowercase,
  numbers: password.numbers,
  symbols: password.symbols,
});

export const usePasswordStorage = () => {
  const { data, isPending } = useSession();
  const [localPasswords, setLocalPasswords] = useState<StoredPassword[]>([]);
  const [isSyncingLocalPasswords, setIsSyncingLocalPasswords] = useState(false);
  const [lastLocalSyncResult, setLastLocalSyncResult] = useState<LocalSyncResult | null>(null);
  const syncAttemptedIdentityRef = useRef<string | null>(null);

  const authenticatedIdentity = data?.session?.id ?? data?.user?.id ?? null;
  const isAuthenticated = authenticatedIdentity !== null;

  useEffect(() => {
    if (isPending) return;

    if (!isAuthenticated) {
      syncAttemptedIdentityRef.current = null;
      lastCompletedLocalSyncIdentity = null;
      setIsSyncingLocalPasswords(false);
      setLastLocalSyncResult(null);
      setLocalPasswords(readLocalPasswords());
    } else {
      setLocalPasswords([]);
    }
  }, [isPending, isAuthenticated]);

  const syncLocalPasswordsToCloud = useCallback(async (): Promise<LocalSyncResult> => {
    if (!authenticatedIdentity) {
      lastCompletedLocalSyncIdentity = null;
      const noSyncResult = { synced: 0, failed: 0 };
      setLastLocalSyncResult(noSyncResult);
      return noSyncResult;
    }

    if (localSyncInFlight?.identity === authenticatedIdentity) {
      setIsSyncingLocalPasswords(true);
      try {
        const result = await localSyncInFlight.promise;
        setLastLocalSyncResult(result);
        return result;
      } finally {
        setIsSyncingLocalPasswords(false);
      }
    }

    const localPasswordsToSync = readLocalPasswords();
    if (localPasswordsToSync.length === 0) {
      const noSyncResult = { synced: 0, failed: 0 };
      setLastLocalSyncResult(noSyncResult);
      return noSyncResult;
    }

    if (lastCompletedLocalSyncIdentity === authenticatedIdentity) {
      const noRemainingPasswords = readLocalPasswords();
      if (noRemainingPasswords.length === 0) {
        const noSyncResult = { synced: 0, failed: 0 };
        setLastLocalSyncResult(noSyncResult);
        return noSyncResult;
      }
    }

    setIsSyncingLocalPasswords(true);

    const syncPromise = Promise.resolve().then(async (): Promise<LocalSyncResult> => {
      try {
        const response = await fetch('/api/v1/passwords');
        if (!response.ok) {
          return { synced: 0, failed: localPasswordsToSync.length };
        }

        const cloudPasswords: ApiStoredPassword[] = await response.json();
        const cloudFingerprints = new Set(
          cloudPasswords.map((password) => fingerprintPassword(password))
        );
        const unsyncedPasswords: StoredPassword[] = [];
        let synced = 0;

        for (const password of localPasswordsToSync) {
          if (cloudFingerprints.has(fingerprintPassword(password))) {
            synced += 1;
            continue;
          }

          unsyncedPasswords.push(password);
        }

        const settledResults = await Promise.allSettled(
          unsyncedPasswords.map(async (password) => {
            const response = await fetch('/api/v1/passwords', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(toPasswordPayload(password)),
            });

            if (!response.ok) {
              throw new Error('Error saving password');
            }

            return password;
          })
        );

        const failedPasswords: StoredPassword[] = [];

        settledResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            synced += 1;
            return;
          }

          failedPasswords.push(unsyncedPasswords[index]);
        });

        const failed = failedPasswords.length;
        if (failed === 0) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setLocalPasswords([]);
        } else {
          writeLocalPasswords(failedPasswords);
          setLocalPasswords(failedPasswords);
        }

        return { synced, failed };
      } catch (error) {
        console.error('Error syncing local passwords to database:', error);
        return { synced: 0, failed: localPasswordsToSync.length };
      }
    });

    localSyncInFlight = {
      identity: authenticatedIdentity,
      promise: syncPromise,
    };

    try {
      const result = await syncPromise;
      setLastLocalSyncResult(result);
      return result;
    } finally {
      localSyncInFlight = null;
      lastCompletedLocalSyncIdentity = authenticatedIdentity;
      setIsSyncingLocalPasswords(false);
    }
  }, [authenticatedIdentity]);

  useEffect(() => {
    if (isPending) return;
    if (!authenticatedIdentity) return;
    if (syncAttemptedIdentityRef.current === authenticatedIdentity) return;

    syncAttemptedIdentityRef.current = authenticatedIdentity;
    void syncLocalPasswordsToCloud();
  }, [authenticatedIdentity, isPending, syncLocalPasswordsToCloud]);

  const savePassword = useCallback(
    async (passwordData: Omit<StoredPassword, 'id' | 'createdAt'>) => {
      const newPassword: StoredPassword = {
        ...passwordData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };

      if (isAuthenticated) {
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
        const updatedPasswords = [newPassword, ...readLocalPasswords()].slice(
          0,
          MAX_LOCAL_PASSWORDS
        );
        setLocalPasswords(updatedPasswords);
        writeLocalPasswords(updatedPasswords);
        return newPassword;
      }
    },
    [isAuthenticated]
  );

  const getPasswords = useCallback(async (): Promise<StoredPassword[]> => {
    if (isAuthenticated) {
      try {
        const response = await fetch('/api/v1/passwords');
        if (!response.ok) throw new Error('Error fetching passwords');
        const passwords: ApiStoredPassword[] = await response.json();
        return passwords.map((password: ApiStoredPassword) => ({
          ...password,
          createdAt: new Date(password.createdAt),
        }));
      } catch (error) {
        console.error('Error fetching passwords from database:', error);
        return [];
      }
    }

    return readLocalPasswords();
  }, [isAuthenticated]);

  const deletePassword = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
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
        const updatedPasswords = readLocalPasswords().filter((p) => p.id !== id);
        setLocalPasswords(updatedPasswords);
        writeLocalPasswords(updatedPasswords);
      }
    },
    [isAuthenticated]
  );

  return {
    savePassword,
    getPasswords,
    deletePassword,
    syncLocalPasswordsToCloud,
    isSyncingLocalPasswords,
    lastLocalSyncResult,
    passwords: isAuthenticated ? [] : localPasswords,
    isAuthenticated,
    isLoading: isPending,
  };
};
