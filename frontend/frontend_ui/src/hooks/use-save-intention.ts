import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveIntention } from '@/services/intentions';
import { todaysIntentionKey } from './use-todays-intention';
import { getTodayIso } from '@/utils/format';

export function useSaveIntention() {
  const queryClient = useQueryClient();
  const today = getTodayIso();

  return useMutation({
    mutationFn: saveIntention,
    onSuccess: () => {
      // Invalidate today's intention so it refetches
      void queryClient.invalidateQueries({
        queryKey: todaysIntentionKey(today),
      });
    },
  });
}
