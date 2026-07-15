import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerSync } from '@/services/sync';
import { listIntentionsKey } from './use-list-intentions';

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerSync,
    onSuccess: () => {
      // After sync, invalidate all intention queries so they refetch fresh data
      void queryClient.invalidateQueries({ queryKey: listIntentionsKey });
      void queryClient.invalidateQueries({ queryKey: ['intentions'] });
    },
  });
}
