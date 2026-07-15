import { useQuery } from '@tanstack/react-query';
import { getPreviousIntention } from '@/services/intentions';
import { getTodayIso } from '@/utils/format';

export const previousIntentionKey = (beforeDate: string) => [
  'intentions',
  'previous',
  beforeDate,
];

export function usePreviousIntention() {
  const today = getTodayIso();
  return useQuery({
    queryKey: previousIntentionKey(today),
    queryFn: () => getPreviousIntention(today).then((r) => r.intention),
    staleTime: 1000 * 60 * 10,
  });
}
