import { act, renderHook, waitFor } from '@testing-library/react';
import type { StoredPassword } from '@/hooks/use-password-storage';
import { usePasswordStorage } from '@/hooks/use-password-storage';
import { useSession } from '@/lib/auth-client';

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;

const LOCAL_STORAGE_KEY = 'lock-genius-passwords';

const basePassword = {
  password: 'password-0',
  length: 12,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
} satisfies Omit<StoredPassword, 'id' | 'createdAt'>;

const makeStoredPassword = (
  overrides: Partial<StoredPassword> & { createdAt?: Date }
): StoredPassword => ({
  id: overrides.id ?? crypto.randomUUID(),
  password: overrides.password ?? 'password-1',
  length: overrides.length ?? 12,
  uppercase: overrides.uppercase ?? true,
  lowercase: overrides.lowercase ?? true,
  numbers: overrides.numbers ?? true,
  symbols: overrides.symbols ?? false,
  createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
});

const toPersistedPassword = (password: StoredPassword) => ({
  ...password,
  createdAt: password.createdAt.toISOString(),
});

const mockResponse = (body: unknown, ok = true) =>
  ({
    ok,
    json: async () => body,
  }) as Response;

describe('usePasswordStorage', () => {
  let fetchMock: jest.Mock;
  let randomUuidSpy: jest.SpyInstance<string, []>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;
    randomUuidSpy = jest.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      return `uuid-${Math.random().toString(36).slice(2, 10)}`;
    });
  });

  afterEach(() => {
    randomUuidSpy.mockRestore();
  });

  it('writes guest passwords to localStorage and caps the list at 50', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    const { result } = renderHook(() => usePasswordStorage());

    await act(async () => {
      for (let index = 0; index < 51; index += 1) {
        await result.current.savePassword({
          ...basePassword,
          password: `password-${index}`,
        });
      }
    });

    const persisted = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]') as Array<{
      id: string;
    }>;

    expect(persisted).toHaveLength(50);
    expect(result.current.passwords).toHaveLength(50);
  });

  it('posts guest passwords after authentication and removes local storage on success', async () => {
    const localPasswords = [
      makeStoredPassword({
        id: 'local-1',
        password: 'alpha',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      makeStoredPassword({
        id: 'local-2',
        password: 'beta',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      }),
    ];

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(localPasswords.map(toPersistedPassword))
    );

    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    fetchMock
      .mockResolvedValueOnce(mockResponse([], true))
      .mockResolvedValueOnce(mockResponse({ id: 'saved-1' }, true))
      .mockResolvedValueOnce(mockResponse({ id: 'saved-2' }, true));

    const { result } = renderHook(() => usePasswordStorage());

    await waitFor(() => {
      expect(result.current.lastLocalSyncResult).toEqual({ synced: 2, failed: 0 });
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();

    const firstPostBody = JSON.parse(fetchMock.mock.calls[1][1]?.body as string) as Record<
      string,
      unknown
    >;
    expect(firstPostBody).toEqual({
      password: 'alpha',
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
    });
    expect(firstPostBody).not.toHaveProperty('id');
    expect(firstPostBody).not.toHaveProperty('createdAt');
  });

  it('skips passwords that already exist in cloud by fingerprint', async () => {
    const matchingPassword = makeStoredPassword({
      id: 'local-1',
      password: 'alpha',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const newPassword = makeStoredPassword({
      id: 'local-2',
      password: 'beta',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([matchingPassword, newPassword].map(toPersistedPassword))
    );

    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    fetchMock
      .mockResolvedValueOnce(
        mockResponse(
          [
            {
              id: 'cloud-1',
              password: 'alpha',
              length: 12,
              uppercase: true,
              lowercase: true,
              numbers: true,
              symbols: false,
              createdAt: '2026-01-03T00:00:00.000Z',
            },
          ],
          true
        )
      )
      .mockResolvedValueOnce(mockResponse({ id: 'saved-2' }, true));

    const { result } = renderHook(() => usePasswordStorage());

    await waitFor(() => {
      expect(result.current.lastLocalSyncResult).toEqual({ synced: 2, failed: 0 });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();

    const postBody = JSON.parse(fetchMock.mock.calls[1][1]?.body as string) as Record<
      string,
      unknown
    >;
    expect(postBody.password).toBe('beta');
  });

  it('keeps only failed passwords when a sync POST returns a non-2xx response', async () => {
    const successPassword = makeStoredPassword({
      id: 'local-1',
      password: 'alpha',
    });
    const failedPassword = makeStoredPassword({
      id: 'local-2',
      password: 'beta',
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([successPassword, failedPassword].map(toPersistedPassword))
    );

    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    fetchMock
      .mockResolvedValueOnce(mockResponse([], true))
      .mockResolvedValueOnce(mockResponse({ id: 'saved-1' }, true))
      .mockResolvedValueOnce(mockResponse({ error: 'failure' }, false));

    const { result } = renderHook(() => usePasswordStorage());

    await waitFor(() => {
      expect(result.current.lastLocalSyncResult).toEqual({ synced: 1, failed: 1 });
    });

    const persisted = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]') as Array<{
      id: string;
      password: string;
    }>;

    expect(persisted).toHaveLength(1);
    expect(persisted[0].id).toBe('local-2');
    expect(persisted[0].password).toBe('beta');
  });

  it('keeps only failed passwords when a sync POST rejects', async () => {
    const successPassword = makeStoredPassword({
      id: 'local-1',
      password: 'alpha',
    });
    const failedPassword = makeStoredPassword({
      id: 'local-2',
      password: 'beta',
    });

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([successPassword, failedPassword].map(toPersistedPassword))
    );

    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    fetchMock
      .mockResolvedValueOnce(mockResponse([], true))
      .mockResolvedValueOnce(mockResponse({ id: 'saved-1' }, true))
      .mockRejectedValueOnce(new Error('network failure'));

    const { result } = renderHook(() => usePasswordStorage());

    await waitFor(() => {
      expect(result.current.lastLocalSyncResult).toEqual({ synced: 1, failed: 1 });
    });

    const persisted = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]') as Array<{
      id: string;
      password: string;
    }>;

    expect(persisted).toHaveLength(1);
    expect(persisted[0].id).toBe('local-2');
    expect(persisted[0].password).toBe('beta');
  });

  it('maps authenticated getPasswords results to Date instances', async () => {
    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    fetchMock.mockResolvedValueOnce(
      mockResponse(
        [
          {
            id: 'cloud-1',
            password: 'alpha',
            length: 12,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: false,
            createdAt: '2026-01-03T00:00:00.000Z',
          },
        ],
        true
      )
    );

    const { result } = renderHook(() => usePasswordStorage());

    const passwords = await result.current.getPasswords();

    expect(passwords[0]?.createdAt).toBeInstanceOf(Date);
    expect(passwords[0]?.createdAt.toISOString()).toBe('2026-01-03T00:00:00.000Z');
  });

  it('updates lastLocalSyncResult after a sync attempt', async () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(
        [
          makeStoredPassword({
            id: 'local-1',
            password: 'alpha',
          }),
        ].map(toPersistedPassword)
      )
    );

    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    fetchMock
      .mockResolvedValueOnce(mockResponse([], true))
      .mockResolvedValueOnce(mockResponse({ id: 'saved-1' }, true));

    const { result } = renderHook(() => usePasswordStorage());

    await waitFor(() => {
      expect(result.current.lastLocalSyncResult).toEqual({ synced: 1, failed: 0 });
    });
  });

  it('shares one in-flight sync promise across mounted hook instances for the same identity', async () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(
        [
          makeStoredPassword({
            id: 'local-1',
            password: 'alpha',
          }),
        ].map(toPersistedPassword)
      )
    );

    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });

    let resolveGetPasswords!: (value: Response) => void;
    const getPasswordsPromise = new Promise<Response>((resolve) => {
      resolveGetPasswords = resolve;
    });

    fetchMock.mockImplementation((_input, init) => {
      if (!init || init.method === undefined || init.method === 'GET') {
        return getPasswordsPromise;
      }

      return Promise.resolve(mockResponse({ id: 'saved-1' }, true));
    });

    const firstHook = renderHook(() => usePasswordStorage());
    const secondHook = renderHook(() => usePasswordStorage());

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    resolveGetPasswords(mockResponse([], true));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(firstHook.result.current.lastLocalSyncResult).toEqual({ synced: 1, failed: 0 });
      expect(secondHook.result.current.lastLocalSyncResult).toEqual({ synced: 1, failed: 0 });
    });
  });
});
