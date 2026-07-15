import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { EveningReviewUI } from '../evening-review.ui';
import type { IntentionRecord } from '@/types/intention';

const mockIntention: IntentionRecord = {
  id: 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c',
  userId: 'user-uuid-1234',
  date: '2026-07-15',
  text: 'Focus on deep work today.',
  rating: null,
  synced: false,
  createdAt: '2026-07-15T07:00:00.000Z',
  updatedAt: null,
};

const defaultProps = {
  todaysIntention: mockIntention,
  isLoading: false,
  selectedRating: null,
  isSaving: false,
  saveError: null,
  alreadyReviewed: false,
  onRatingSelect: vi.fn(),
};

describe('EveningReviewUI', () => {
  it('renders the heading', () => {
    render(<EveningReviewUI {...defaultProps} />);
    expect(screen.getByText('Evening review')).toBeInTheDocument();
  });

  it('renders today\'s intention text', () => {
    render(<EveningReviewUI {...defaultProps} />);
    expect(screen.getByText('Focus on deep work today.')).toBeInTheDocument();
  });

  it('renders all three rating buttons', () => {
    render(<EveningReviewUI {...defaultProps} />);
    expect(screen.getByText('Honoured')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(screen.getByText('Not today')).toBeInTheDocument();
  });

  it('calls onRatingSelect when a rating button is clicked', () => {
    const onRatingSelect = vi.fn();
    render(<EveningReviewUI {...defaultProps} onRatingSelect={onRatingSelect} />);
    fireEvent.click(screen.getByText('Honoured').closest('button')!);
    expect(onRatingSelect).toHaveBeenCalledWith('honoured');
  });

  it('disables buttons when no intention is set', () => {
    render(<EveningReviewUI {...defaultProps} todaysIntention={null} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('shows "No intention set for today" when no intention', () => {
    render(<EveningReviewUI {...defaultProps} todaysIntention={null} />);
    expect(screen.getByText(/no intention set for today/i)).toBeInTheDocument();
  });

  it('shows save error when provided', () => {
    render(<EveningReviewUI {...defaultProps} saveError="Something went wrong." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  it('shows "Already reviewed today" when alreadyReviewed', () => {
    render(
      <EveningReviewUI
        {...defaultProps}
        alreadyReviewed
        selectedRating="honoured"
      />,
    );
    expect(screen.getByText(/already reviewed today/i)).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading', () => {
    const { container } = render(<EveningReviewUI {...defaultProps} isLoading />);
    expect(container.querySelector('[aria-busy]')).toBeInTheDocument();
  });
});
