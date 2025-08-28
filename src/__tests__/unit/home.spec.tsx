import { render } from '@testing-library/react';
import { signIn, signOut, useSession } from 'next-auth/react';

import Home from '@/app/page';

const mockUseSession = useSession as jest.Mock;
(signIn as jest.Mock).mockImplementation(() => jest.fn());
(signOut as jest.Mock).mockImplementation(() => jest.fn());

jest.mock('next-auth/react');

describe('Homepage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render unauthenticated', () => {
    mockUseSession.mockReturnValue({
      status: 'unauthenticated',
      data: null,
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
      status: 'authenticated',
      data: {
        user: {
          name: 'John Doe',
          email: 'john-doe@test.com',
          image: null,
        },
        expires: '1',
      },
    });

    const { getByText, queryByText } = render(<Home />);

    const heading = getByText(/generate and save your best choices/i);
    const continueWithoutAccount = queryByText(/Continue without an account/i);

    expect(heading).toBeInTheDocument();
    expect(continueWithoutAccount).not.toBeInTheDocument();
  });
});
