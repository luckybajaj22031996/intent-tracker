import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '@/components/skeleton';
import { useTodaysIntention } from '@/hooks/use-todays-intention';
import { usePreviousIntention } from '@/hooks/use-previous-intention';
import { useSaveIntention } from '@/hooks/use-save-intention';
import { getTodayIso } from '@/utils/format';
import { MorningHomeUI } from './morning-home.ui';

export function MorningHomeView() {
  const navigate = useNavigate();
  const today = getTodayIso();

  const { data: todaysIntention, isLoading: loadingToday } = useTodaysIntention();
  const { data: previousIntention, isLoading: loadingPrevious } = usePreviousIntention();
  const saveIntentionMutation = useSaveIntention();

  const [intentionText, setIntentionText] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  // If today's intention already exists, pre-fill and lock
  const todayAlreadySaved = !!todaysIntention;
  const displayText = todayAlreadySaved ? todaysIntention.text : intentionText;

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIntentionText(e.target.value);
    setServerError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!intentionText.trim() || intentionText.length > 140) return;

    setServerError(null);

    try {
      const result = await saveIntentionMutation.mutateAsync({
        text: intentionText.trim(),
        date: today,
      });
      navigate('/intention-saved', {
        state: { intentionText: intentionText.trim(), id: result.id },
      });
    } catch (err) {
      const error = err as { status?: number; message?: string };
      if (error.status === 409) {
        setServerError("You've already set today's intention.");
      } else {
        setServerError("Couldn't save right now. Please try again.");
      }
    }
  };

  if (loadingToday || loadingPrevious) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <MorningHomeUI
      intentionText={displayText}
      charCount={displayText.length}
      isSubmitting={saveIntentionMutation.isPending}
      serverError={serverError}
      previousIntentionText={previousIntention?.text ?? null}
      todayAlreadySaved={todayAlreadySaved}
      onTextChange={handleTextChange}
      onSubmit={handleSubmit}
    />
  );
}
