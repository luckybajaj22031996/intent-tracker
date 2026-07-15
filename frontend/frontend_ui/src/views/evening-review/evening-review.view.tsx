import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodaysIntention } from '@/hooks/use-todays-intention';
import { useSaveEveningRating } from '@/hooks/use-save-evening-rating';
import { getTodayIso } from '@/utils/format';
import type { Rating } from '@/types/intention';
import { EveningReviewUI } from './evening-review.ui';

export function EveningReviewView() {
  const navigate = useNavigate();
  const today = getTodayIso();

  const { data: todaysIntention, isLoading } = useTodaysIntention();
  const saveRatingMutation = useSaveEveningRating();

  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // If already reviewed, show the existing rating
  const alreadyReviewed = !!todaysIntention?.rating;
  const displayRating = alreadyReviewed
    ? (todaysIntention?.rating as Rating)
    : selectedRating;

  const handleRatingSelect = async (rating: Rating) => {
    if (alreadyReviewed) return;

    setSelectedRating(rating);
    setSaveError(null);

    try {
      await saveRatingMutation.mutateAsync({ date: today, rating });
      navigate('/evening-review/saved', {
        state: { rating, savedAt: new Date().toISOString() },
      });
    } catch (err) {
      const error = err as { status?: number; message?: string };
      setSelectedRating(null);
      if (error.status === 404) {
        setSaveError('No intention found for today. Set one tomorrow morning.');
      } else {
        setSaveError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <EveningReviewUI
      todaysIntention={todaysIntention ?? null}
      isLoading={isLoading}
      selectedRating={displayRating ?? null}
      isSaving={saveRatingMutation.isPending}
      saveError={saveError}
      alreadyReviewed={alreadyReviewed}
      onRatingSelect={handleRatingSelect}
    />
  );
}
