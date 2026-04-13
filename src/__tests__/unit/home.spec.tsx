import { render } from '@testing-library/react';
import Home from '@/app/page';
import { useSession } from '@/lib/auth-client';

const mockUseSession = useSession as jest.Mock;

jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(),
}));

describe('Homepage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    const { getByText, getByRole } = render(<Home />);

    const heading = getByText(/say goodbye to weak passwords/i);
    const continueWithoutAccount = getByRole('link', {
      name: /continue without an account/i,
    });

    expect(heading).toBeInTheDocument();
    expect(continueWithoutAccount).toBeInTheDocument();
  });

  it('should render authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        session: {
          id: 'sess_123',
          userId: '123',
          expiresAt: new Date(),
          token: 'test-token',
        },
        user: {
          id: '123',
          name: 'John Doe',
          email: 'john-doe@test.com',
          image: null,
        },
      },
      isPending: false,
    });

    const { getByText, queryByText } = render(<Home />);

    const heading = getByText(/generate and save your best choices/i);
    const continueWithoutAccount = queryByText(/Continue without an account/i);

    expect(heading).toBeInTheDocument();
    expect(continueWithoutAccount).not.toBeInTheDocument();
  });
});
