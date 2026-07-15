import { Moon, Loader2 } from '@/utils/icons';
import { ErrorBanner } from '@/components/error-banner';
import { CardSkeleton } from '@/components/skeleton';
import { RATING_LABELS, RATING_DESCRIPTIONS, RATING_EMOJI } from '@/constants';
import type { IntentionRecord, Rating } from '@/types/intention';
import clsx from 'clsx';

interface EveningReviewUIProps {
  todaysIntention: IntentionRecord | null;
  isLoading: boolean;
  selectedRating: Rating | null;
  isSaving: boolean;
  saveError: string | null;
  alreadyReviewed: boolean;
  onRatingSelect: (rating: Rating) => void;
}

const RATINGS: Rating[] = ['honoured', 'partial', 'not_today'];

const ratingColors: Record<Rating, string> = {
  honoured: 'border-green-500/50 bg-green-900/30 hover:bg-green-900/50 text-green-300',
  partial: 'border-yellow-500/50 bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-300',
  not_today: 'border-slate-500/50 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300',
};

const selectedColors: Record<Rating, string> = {
  honoured: 'border-green-400 bg-green-900/60 text-green-200 ring-2 ring-green-400/30',
  partial: 'border-yellow-400 bg-yellow-900/60 text-yellow-200 ring-2 ring-yellow-400/30',
  not_today: 'border-slate-400 bg-slate-800/60 text-slate-200 ring-2 ring-slate-400/30',
};

export function EveningReviewUI({
  todaysIntention,
  isLoading,
  selectedRating,
  isSaving,
  saveError,
  alreadyReviewed,
  onRatingSelect,
}: EveningReviewUIProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const noIntention = !todaysIntention;

  return (
    <section className="flex flex-col gap-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        <Moon size={24} className="text-brand-400" aria-hidden />
        <h1 className="text-2xl font-bold text-white">Evening review</h1>
      </div>

      {/* Today's intention card */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
          Today's intention
        </h2>
        {noIntention ? (
          <p className="text-white/40 text-sm italic">No intention set for today.</p>
        ) : (
          <p className="text-white leading-relaxed">{todaysIntention.text}</p>
        )}
      </div>

      {/* Rating section */}
      <div>
        <h2 className="text-sm font-medium text-white/60 mb-4">
          How did it go?
        </h2>

        {/* Error banner */}
        {saveError && (
          <div className="mb-4">
            <ErrorBanner message={saveError} />
          </div>
        )}

        {/* Already reviewed state */}
        {alreadyReviewed && selectedRating && (
          <p role="status" className="text-white/40 text-xs text-center mb-3">
            Already reviewed today
          </p>
        )}

        {/* Rating buttons */}
        <div className="space-y-3" role="group" aria-label="Evening rating options">
          {RATINGS.map((rating) => {
            const isSelected = selectedRating === rating;
            const isThisSaving = isSaving && isSelected;
            const isDisabled = noIntention || alreadyReviewed || (isSaving && !isSelected);

            return (
              <button
                key={rating}
                type="button"
                disabled={isDisabled}
                onClick={() => onRatingSelect(rating)}
                aria-pressed={isSelected}
                className={clsx(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  isSelected ? selectedColors[rating] : ratingColors[rating],
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {RATING_EMOJI[rating]}
                </span>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{RATING_LABELS[rating]}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {RATING_DESCRIPTIONS[rating]}
                  </div>
                </div>
                {isThisSaving && (
                  <Loader2 size={18} className="animate-spin shrink-0" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
