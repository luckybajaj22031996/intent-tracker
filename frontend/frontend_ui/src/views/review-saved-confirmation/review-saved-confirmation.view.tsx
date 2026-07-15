import { useLocation } from 'react-router-dom';
import type { Rating } from '@/types/intention';
import { ReviewSavedUI } from './review-saved-confirmation.ui';

interface LocationState {
  rating?: Rating;
  savedAt?: string;
}

export function ReviewSavedView() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const ratingValue = state?.rating ?? null;

  return <ReviewSavedUI ratingValue={ratingValue} />;
}
