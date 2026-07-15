import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { SettingsUI } from '../settings.ui';

const defaultProps = {
  reminderEnabled: false,
  permissionStatus: null,
  permissionError: null,
  isSignedIn: false,
  userEmail: null,
  isTogglingReminder: false,
  onToggleReminder: vi.fn(),
  onSignOut: vi.fn(),
};

describe('SettingsUI', () => {
  it('renders the heading', () => {
    render(<SettingsUI {...defaultProps} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the morning reminder toggle', () => {
    render(<SettingsUI {...defaultProps} />);
    expect(screen.getByRole('switch', { name: /morning reminder/i })).toBeInTheDocument();
  });

  it('toggle is off by default', () => {
    render(<SettingsUI {...defaultProps} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('toggle is on when reminderEnabled is true', () => {
    render(<SettingsUI {...defaultProps} reminderEnabled />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggleReminder when toggle is clicked', () => {
    const onToggleReminder = vi.fn();
    render(<SettingsUI {...defaultProps} onToggleReminder={onToggleReminder} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onToggleReminder).toHaveBeenCalled();
  });

  it('shows "Signed in anonymously" when not signed in', () => {
    render(<SettingsUI {...defaultProps} />);
    expect(screen.getByText('Signed in anonymously')).toBeInTheDocument();
  });

  it('shows "Signed in" when signed in', () => {
    render(<SettingsUI {...defaultProps} isSignedIn userEmail="test@example.com" />);
    expect(screen.getByText('Signed in')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows Sign In link when not signed in', () => {
    render(<SettingsUI {...defaultProps} />);
    expect(screen.getByText(/sign in to sync/i)).toBeInTheDocument();
  });

  it('shows Sign Out button when signed in', () => {
    render(<SettingsUI {...defaultProps} isSignedIn />);
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('calls onSignOut when sign out is clicked', () => {
    const onSignOut = vi.fn();
    render(<SettingsUI {...defaultProps} isSignedIn onSignOut={onSignOut} />);
    fireEvent.click(screen.getByText('Sign out'));
    expect(onSignOut).toHaveBeenCalled();
  });

  it('shows permission error when provided', () => {
    render(
      <SettingsUI
        {...defaultProps}
        permissionError="Notification permission was not granted."
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Notification permission was not granted.');
  });
});
