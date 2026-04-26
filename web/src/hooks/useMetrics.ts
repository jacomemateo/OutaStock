import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryQueryOptions } from '@/hooks/useInventory';
import { productsQueryOptions } from '@/hooks/useProducts';
import { settingsQueryOptions } from '@/hooks/useSettings';
import { queryKeys } from '@/lib/queryKeys';
import { computeInventoryMetrics } from '@/utils/metrics';

export function useMetrics() {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: queryKeys.metrics.all,
        queryFn: async () => {
            const [inventory, products, settings] = await Promise.all([
                queryClient.ensureQueryData(inventoryQueryOptions),
                queryClient.ensureQueryData(productsQueryOptions),
                queryClient.ensureQueryData(settingsQueryOptions),
            ]);

            return computeInventoryMetrics(
                inventory,
                products,
                settings.lowStockThreshold,
            );
        },
    });
}
