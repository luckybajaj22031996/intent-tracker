import { useQuery } from '@tanstack/react-query';
import { getTodaysIntention } from '@/services/intentions';
import { getTodayIso } from '@/utils/format';

export const todaysIntentionKey = (date: string) => ['intentions', 'today', date];

export function useTodaysIntention() {
  const today = getTodayIso();
  return useQuery({
    queryKey: todaysIntentionKey(today),
    queryFn: () => getTodaysIntention(today).then((r) => r.intention),
    staleTime: 1000 * 60 * 2,
  });
}
