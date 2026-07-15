import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { MagicLinkSentUI } from '../magic-link-sent.ui';

describe('MagicLinkSentUI', () => {
  it('renders the heading', () => {
    render(<MagicLinkSentUI />);
    expect(screen.getByText('Check your inbox')).toBeInTheDocument();
  });

  it('renders the email when provided', () => {
    render(<MagicLinkSentUI email="test@example.com" />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders generic text when no email', () => {
    render(<MagicLinkSentUI />);
    expect(screen.getByText(/your email address/i)).toBeInTheDocument();
  });

  it('renders "Try again" link', () => {
    render(<MagicLinkSentUI />);
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('renders "Continue without signing in" link', () => {
    render(<MagicLinkSentUI />);
    expect(screen.getByText(/continue without signing in/i)).toBeInTheDocument();
  });
});
