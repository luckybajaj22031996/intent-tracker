import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { MorningHomeUI } from '../morning-home.ui';

const defaultProps = {
  intentionText: '',
  charCount: 0,
  isSubmitting: false,
  serverError: null,
  previousIntentionText: null,
  todayAlreadySaved: false,
  onTextChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe('MorningHomeUI', () => {
  it('renders the greeting', () => {
    render(<MorningHomeUI {...defaultProps} />);
    expect(screen.getByText('Good morning')).toBeInTheDocument();
  });

  it('renders the textarea', () => {
    render(<MorningHomeUI {...defaultProps} />);
    expect(screen.getByRole('textbox', { name: /today's intention/i })).toBeInTheDocument();
  });

  it('renders the submit button when not already saved', () => {
    render(<MorningHomeUI {...defaultProps} intentionText="My intention" charCount={12} />);
    expect(screen.getByRole('button', { name: /set intention/i })).toBeInTheDocument();
  });

  it('disables submit when text is empty', () => {
    render(<MorningHomeUI {...defaultProps} />);
    expect(screen.getByRole('button', { name: /set intention/i })).toBeDisabled();
  });

  it('disables submit when over 140 chars', () => {
    render(
      <MorningHomeUI
        {...defaultProps}
        intentionText={'a'.repeat(141)}
        charCount={141}
      />,
    );
    expect(screen.getByRole('button', { name: /set intention/i })).toBeDisabled();
  });

  it('shows char limit error when over 140', () => {
    render(
      <MorningHomeUI
        {...defaultProps}
        intentionText={'a'.repeat(141)}
        charCount={141}
      />,
    );
    expect(screen.getByText(/140 characters or fewer/i)).toBeInTheDocument();
  });

  it('shows server error when provided', () => {
    render(<MorningHomeUI {...defaultProps} serverError="Couldn't save right now." />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't save right now.");
  });

  it('shows saved state when todayAlreadySaved is true', () => {
    render(
      <MorningHomeUI
        {...defaultProps}
        todayAlreadySaved
        intentionText="My saved intention"
        charCount={18}
      />,
    );
    expect(screen.getByText(/intention saved for today/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /set intention/i })).not.toBeInTheDocument();
  });

  it('shows previous intention when provided', () => {
    render(
      <MorningHomeUI
        {...defaultProps}
        previousIntentionText="Be present in every conversation."
      />,
    );
    expect(screen.getByText('Be present in every conversation.')).toBeInTheDocument();
  });

  it('shows placeholder when no previous intention', () => {
    render(<MorningHomeUI {...defaultProps} />);
    expect(screen.getByText(/no previous intention found/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <MorningHomeUI
        {...defaultProps}
        intentionText="My intention"
        charCount={12}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /set intention/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows loading state when submitting', () => {
    render(
      <MorningHomeUI
        {...defaultProps}
        intentionText="My intention"
        charCount={12}
        isSubmitting
      />,
    );
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });
});
