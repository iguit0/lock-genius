import { render, screen, waitFor } from '@testing-library/react';
import PasswordsPage from '@/app/passwords/page';
import { useToast } from '@/components/ui/use-toast';
import { usePasswordStorage } from '@/hooks/use-password-storage';
import { useSession } from '@/lib/auth-client';

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/hooks/use-password-storage', () => ({
  usePasswordStorage: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockUsePasswordStorage = usePasswordStorage as jest.Mock;
const mockUseToast = useToast as jest.Mock;

describe('PasswordsPage sync behavior', () => {
  const getPasswordsMock = jest.fn();
  const deletePasswordMock = jest.fn();
  const toastMock = jest.fn();
  type HookState = {
    getPasswords: typeof getPasswordsMock;
    deletePassword: typeof deletePasswordMock;
    isSyncingLocalPasswords: boolean;
    lastLocalSyncResult: { synced: number; failed: number } | null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        session: { id: 'sess_123' },
        user: { id: 'user_123' },
      },
      isPending: false,
    });
    mockUseToast.mockReturnValue({ toast: toastMock });
  });

  it('shows loading while sync is in progress and does not call getPasswords()', () => {
    mockUsePasswordStorage.mockReturnValue({
      getPasswords: getPasswordsMock,
      deletePassword: deletePasswordMock,
      isSyncingLocalPasswords: true,
      lastLocalSyncResult: null,
    });

    render(<PasswordsPage />);

    expect(screen.getByText(/loading passwords/i)).toBeInTheDocument();
    expect(getPasswordsMock).not.toHaveBeenCalled();
  });

  it('reloads the vault after sync finishes and renders cloud-backed passwords', async () => {
    const cloudPasswords = [
      {
        id: 'cloud-1',
        password: 'cloud-secret',
        length: 12,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        createdAt: '2026-01-03T00:00:00.000Z',
      },
    ];

    getPasswordsMock.mockResolvedValue(cloudPasswords);

    let hookState: HookState = {
      getPasswords: getPasswordsMock,
      deletePassword: deletePasswordMock,
      isSyncingLocalPasswords: true,
      lastLocalSyncResult: null,
    };

    mockUsePasswordStorage.mockImplementation(() => hookState);

    const { rerender } = render(<PasswordsPage />);

    expect(screen.getByText(/loading passwords/i)).toBeInTheDocument();
    expect(getPasswordsMock).not.toHaveBeenCalled();

    hookState = {
      ...hookState,
      isSyncingLocalPasswords: false,
      lastLocalSyncResult: { synced: 2, failed: 0 },
    };

    rerender(<PasswordsPage />);

    await waitFor(() => {
      expect(getPasswordsMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('cloud-secret')).toBeInTheDocument();
  });
});
