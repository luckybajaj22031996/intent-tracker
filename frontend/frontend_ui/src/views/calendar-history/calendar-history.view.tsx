import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListIntentions } from '@/hooks/use-list-intentions';
import type { IntentionRecord } from '@/types/intention';
import { CalendarHistoryUI } from './calendar-history.ui';

export function CalendarHistoryView() {
  const navigate = useNavigate();
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { data: intentions, isLoading, isError, refetch } = useListIntentions();

  const intentionDates = useMemo(() => {
    const set = new Set<string>();
    (intentions ?? []).forEach((r: IntentionRecord) => set.add(r.date));
    return set;
  }, [intentions]);

  // Map date → full record for passing to day detail
  const intentionsByDate = useMemo(() => {
    const map = new Map<string, IntentionRecord>();
    (intentions ?? []).forEach((r: IntentionRecord) => map.set(r.date, r));
    return map;
  }, [intentions]);

  const handlePrevMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    if (nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setDisplayedMonth(nextMonth);
    }
  };

  const handleDayClick = (dateStr: string) => {
    const record = intentionsByDate.get(dateStr);
    navigate(`/history/${dateStr}`, { state: { record } });
  };

  return (
    <CalendarHistoryUI
      displayedMonth={displayedMonth}
      intentionDates={intentionDates}
      isLoading={isLoading}
      fetchError={isError ? "Couldn't load your history. Please try again." : null}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onDayClick={handleDayClick}
      onRetry={() => void refetch()}
    />
  );
}
