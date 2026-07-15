import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getTodaysIntention } from '@/services/intentions';
import type { IntentionRecord } from '@/types/intention';
import { DayDetailUI } from './day-detail.ui';

interface LocationState {
  record?: IntentionRecord;
}

export function DayDetailView() {
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [intentionRecord, setIntentionRecord] = useState<IntentionRecord | null>(
    state?.record ?? null,
  );
  const [isLoading, setIsLoading] = useState(!state?.record);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    // If record was passed via navigation state, no fetch needed
    if (state?.record || !date) {
      setIsLoading(false);
      return;
    }

    // Deep-link scenario: fetch the record
    setIsLoading(true);
    setFetchError(null);

    getTodaysIntention(date)
      .then((res) => {
        setIntentionRecord(res.intention);
        setIsLoading(false);
      })
      .catch((err: { status?: number }) => {
        setIsLoading(false);
        if (err.status === 404) {
          setFetchError('No intention recorded for this day.');
        } else {
          setFetchError("Couldn't load this day. Please go back and try again.");
        }
      });
  }, [date, state?.record]);

  return (
    <DayDetailUI
      date={date ?? ''}
      intentionRecord={intentionRecord}
      isLoading={isLoading}
      fetchError={fetchError}
    />
  );
}
