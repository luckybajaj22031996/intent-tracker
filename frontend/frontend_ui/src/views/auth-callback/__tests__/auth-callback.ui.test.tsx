import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AuthCallbackUI } from '../auth-callback.ui';

describe('AuthCallbackUI', () => {
  it('shows "Signing you in…" when verifying', () => {
    render(<AuthCallbackUI verifyStatus="verifying" errorMessage={null} />);
    expect(screen.getByText('Signing you in…')).toBeInTheDocument();
  });

  it('shows "Syncing your data…" when syncing', () => {
    render(<AuthCallbackUI verifyStatus="syncing" errorMessage={null} />);
    expect(screen.getByText('Syncing your data…')).toBeInTheDocument();
  });

  it('shows error message when status is error', () => {
    render(
      <AuthCallbackUI
        verifyStatus="error"
        errorMessage="This sign-in link has expired."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('This sign-in link has expired.');
  });

  it('shows "Request a new link" button on error', () => {
    render(
      <AuthCallbackUI
        verifyStatus="error"
        errorMessage="Error"
      />,
    );
    expect(screen.getByText('Request a new link')).toBeInTheDocument();
  });
});
