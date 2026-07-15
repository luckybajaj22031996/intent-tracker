import clsx from 'clsx';
import { RATING_LABELS, RATING_EMOJI } from '@/constants';
import type { Rating } from '@/types/intention';

interface RatingBadgeProps {
  rating: Rating;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-2',
};

const colorClasses: Record<Rating, string> = {
  honoured: 'bg-green-900/50 border border-green-500/50 text-green-300',
  partial: 'bg-yellow-900/50 border border-yellow-500/50 text-yellow-300',
  not_today: 'bg-slate-800/50 border border-slate-500/50 text-slate-300',
};

export function RatingBadge({ rating, size = 'md' }: RatingBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        colorClasses[rating],
      )}
    >
      <span aria-hidden>{RATING_EMOJI[rating]}</span>
      {RATING_LABELS[rating]}
    </span>
  );
}
