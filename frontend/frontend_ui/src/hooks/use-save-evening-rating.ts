import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveEveningRating } from '@/services/intentions';
import { todaysIntentionKey } from './use-todays-intention';
import { getTodayIso } from '@/utils/format';

export function useSaveEveningRating() {
  const queryClient = useQueryClient();
  const today = getTodayIso();

  return useMutation({
    mutationFn: saveEveningRating,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: todaysIntentionKey(today),
      });
    },
  });
}
