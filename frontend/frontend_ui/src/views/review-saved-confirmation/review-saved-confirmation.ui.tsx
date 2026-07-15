import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar } from '@/utils/icons';
import { RatingBadge } from '@/components/rating-badge';
import type { Rating } from '@/types/intention';

interface ReviewSavedUIProps {
  ratingValue: Rating | null;
}

export function ReviewSavedUI({ ratingValue }: ReviewSavedUIProps) {
  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-5 py-12 max-w-md mx-auto animate-fade-in">
      {/* Success icon */}
      <div className="mb-6">
        <CheckCircle2 size={64} className="text-green-400" aria-hidden />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        Reflection saved
      </h1>
      <p className="text-white/60 text-center text-sm mb-8">
        Your evening review has been recorded.
      </p>

      {/* Rating display */}
      {ratingValue && (
        <div className="w-full card mb-8 flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Your rating
          </p>
          <RatingBadge rating={ratingValue} size="lg" />
        </div>
      )}

      {/* Actions */}
      <div className="w-full space-y-3">
        <Link
          to="/history"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Calendar size={18} aria-hidden />
          View History
        </Link>
        <Link
          to="/"
          className="btn-ghost w-full flex items-center justify-center"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
