import { Link } from 'react-router-dom';
import { ArrowLeft } from '@/utils/icons';
import { RatingBadge } from '@/components/rating-badge';
import { ErrorBanner } from '@/components/error-banner';
import { CardSkeleton } from '@/components/skeleton';
import { formatDate } from '@/utils/format';
import type { IntentionRecord, Rating } from '@/types/intention';

interface DayDetailUIProps {
  date: string;
  intentionRecord: IntentionRecord | null;
  isLoading: boolean;
  fetchError: string | null;
}

export function DayDetailUI({
  date,
  intentionRecord,
  isLoading,
  fetchError,
}: DayDetailUIProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5 animate-fade-in">
      {/* Back navigation */}
      <Link
        to="/history"
        className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors -ml-1 w-fit"
        aria-label="Back to Calendar"
      >
        <ArrowLeft size={20} aria-hidden />
        <span className="text-sm">Back to Calendar</span>
      </Link>

      {/* Date heading */}
      <h1 className="text-xl font-bold text-white">{formatDate(date)}</h1>

      {/* Error state */}
      {fetchError && (
        <ErrorBanner message={fetchError} />
      )}

      {/* No record state */}
      {!fetchError && !intentionRecord && (
        <div className="card">
          <p className="text-white/40 text-sm italic">No intention recorded for this day.</p>
        </div>
      )}

      {/* Intention card */}
      {intentionRecord && (
        <>
          <div className="card">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
              Morning intention
            </h2>
            <p className="text-white leading-relaxed">{intentionRecord.text}</p>
          </div>

          {/* Evening rating */}
          <div className="card">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
              Evening review
            </h2>
            {intentionRecord.rating ? (
              <RatingBadge rating={intentionRecord.rating as Rating} size="md" />
            ) : (
              <p className="text-white/40 text-sm italic">No evening review recorded.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
