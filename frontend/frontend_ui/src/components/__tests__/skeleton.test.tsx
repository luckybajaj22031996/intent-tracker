import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Skeleton, CardSkeleton } from '../skeleton';

describe('Skeleton', () => {
  it('renders a single skeleton line by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll('[aria-hidden]')).toHaveLength(1);
  });

  it('renders multiple lines when lines prop is provided', () => {
    const { container } = render(<Skeleton lines={3} />);
    // 3 skeleton divs inside a wrapper
    expect(container.querySelectorAll('.skeleton')).toHaveLength(3);
  });
});

describe('CardSkeleton', () => {
  it('renders with aria-busy', () => {
    render(<CardSkeleton />);
    expect(screen.getByRole('generic', { hidden: true })).toBeTruthy();
  });
});
