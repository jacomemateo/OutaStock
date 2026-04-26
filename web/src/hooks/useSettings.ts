import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchSettings, updateLowStockThreshold } from '@/services/settingsApi';

export const settingsQueryOptions = queryOptions({
    queryKey: queryKeys.settings.all,
    queryFn: fetchSettings,
});

export function useSettings() {
    return useQuery(settingsQueryOptions);
}

export function useUpdateLowStockThresholdMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateLowStockThreshold,
        onMutate: async (nextThreshold) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.settings.all });
            const previousSettings = queryClient.getQueryData(settingsQueryOptions.queryKey);

            if (previousSettings) {
                queryClient.setQueryData(queryKeys.settings.all, {
                    ...previousSettings,
                    lowStockThreshold: nextThreshold,
                });
            }

            return { previousSettings };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousSettings) {
                queryClient.setQueryData(
                    queryKeys.settings.all,
                    context.previousSettings,
                );
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.settings.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all }),
            ]);
        },
    });
}
