import { useQuery } from '@tanstack/react-query';
import { listIntentions } from '@/services/intentions';

export const listIntentionsKey = ['intentions', 'list'];

export function useListIntentions() {
  return useQuery({
    queryKey: listIntentionsKey,
    queryFn: () => listIntentions().then((r) => r.intentions),
    staleTime: 1000 * 60 * 5,
  });
}
