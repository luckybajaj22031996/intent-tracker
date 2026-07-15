import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ReviewSavedUI } from '../review-saved-confirmation.ui';

describe('ReviewSavedUI', () => {
  it('renders the confirmation heading', () => {
    render(<ReviewSavedUI ratingValue="honoured" />);
    expect(screen.getByText('Reflection saved')).toBeInTheDocument();
  });

  it('renders the rating badge when rating is provided', () => {
    render(<ReviewSavedUI ratingValue="honoured" />);
    expect(screen.getByText('Honoured')).toBeInTheDocument();
  });

  it('does not render rating section when no rating', () => {
    render(<ReviewSavedUI ratingValue={null} />);
    expect(screen.queryByText('Your rating')).not.toBeInTheDocument();
  });

  it('renders View History link', () => {
    render(<ReviewSavedUI ratingValue="partial" />);
    expect(screen.getByText('View History')).toBeInTheDocument();
  });
});
