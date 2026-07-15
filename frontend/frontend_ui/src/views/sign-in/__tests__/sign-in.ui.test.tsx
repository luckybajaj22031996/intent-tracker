import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { SignInUI } from '../sign-in.ui';

const defaultProps = {
  email: '',
  isSubmitting: false,
  clientError: null,
  serverError: null,
  onEmailChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe('SignInUI', () => {
  it('renders the heading', () => {
    render(<SignInUI {...defaultProps} />);
    expect(screen.getByText(/sign in to daydrop/i)).toBeInTheDocument();
  });

  it('renders the email input', () => {
    render(<SignInUI {...defaultProps} />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('renders the send magic link button', () => {
    render(<SignInUI {...defaultProps} />);
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
  });

  it('disables submit when email is empty', () => {
    render(<SignInUI {...defaultProps} />);
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeDisabled();
  });

  it('enables submit when email is provided', () => {
    render(<SignInUI {...defaultProps} email="test@example.com" />);
    expect(screen.getByRole('button', { name: /send magic link/i })).not.toBeDisabled();
  });

  it('shows client error when provided', () => {
    render(<SignInUI {...defaultProps} clientError="Please enter a valid email address." />);
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('shows server error when provided', () => {
    render(<SignInUI {...defaultProps} serverError="Something went wrong." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  it('shows loading state when submitting', () => {
    render(<SignInUI {...defaultProps} email="test@example.com" isSubmitting />);
    expect(screen.getByText('Sending…')).toBeInTheDocument();
  });

  it('renders "Continue without account" link', () => {
    render(<SignInUI {...defaultProps} />);
    expect(screen.getByText(/continue without account/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(<SignInUI {...defaultProps} email="test@example.com" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
