import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { RatingBadge } from '../rating-badge';

describe('RatingBadge', () => {
  it('renders "Honoured" for honoured rating', () => {
    render(<RatingBadge rating="honoured" />);
    expect(screen.getByText('Honoured')).toBeInTheDocument();
  });

  it('renders "Partial" for partial rating', () => {
    render(<RatingBadge rating="partial" />);
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('renders "Not today" for not_today rating', () => {
    render(<RatingBadge rating="not_today" />);
    expect(screen.getByText('Not today')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { container } = render(<RatingBadge rating="honoured" size="lg" />);
    expect(container.firstChild).toHaveClass('text-base');
  });
});
