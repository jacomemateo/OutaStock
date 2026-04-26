import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    fetchAllInventory,
    removeInventoryProduct,
    updateInventorySlot,
    type UpdateInventoryInput,
} from '@/services/inventoryApi';
import type { InventoryItem, Product } from '@/services/types';

export interface UpdateInventoryMutationInput extends UpdateInventoryInput {
    product?: Pick<Product, 'id' | 'name' | 'priceCents'> | null;
}

export const inventoryQueryOptions = queryOptions({
    queryKey: queryKeys.inventory.all,
    queryFn: () =>
        fetchAllInventory({
            sortBy: 'location',
            sortDir: 'asc',
        }),
});

function updateCachedInventory(
    inventory: InventoryItem[],
    { slotId, productId, quantity, product }: UpdateInventoryMutationInput,
) {
    return inventory.map((item) => {
        if (item.slotId !== slotId) {
            return item;
        }

        return {
            ...item,
            priceCents: product?.priceCents ?? 0,
            productId: productId ?? '',
            productName: product?.name ?? '',
            quantity: quantity ?? 0,
        };
    });
}

export function useInventory() {
    return useQuery(inventoryQueryOptions);
}

export function useUpdateInventorySlotMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateInventoryMutationInput) => updateInventorySlot(input),
        onMutate: async (input) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all });
            const previousInventory = queryClient.getQueryData<InventoryItem[]>(
                queryKeys.inventory.all,
            );

            if (previousInventory) {
                queryClient.setQueryData(
                    queryKeys.inventory.all,
                    updateCachedInventory(previousInventory, input),
                );
            }

            return { previousInventory };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousInventory) {
                queryClient.setQueryData(
                    queryKeys.inventory.all,
                    context.previousInventory,
                );
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all }),
            ]);
        },
    });
}

export function useRemoveInventorySlotMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeInventoryProduct,
        onMutate: async (slotId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.inventory.all });
            const previousInventory = queryClient.getQueryData<InventoryItem[]>(
                queryKeys.inventory.all,
            );

            if (previousInventory) {
                queryClient.setQueryData(
                    queryKeys.inventory.all,
                    updateCachedInventory(previousInventory, {
                        slotId,
                        productId: null,
                        product: null,
                        quantity: null,
                    }),
                );
            }

            return { previousInventory };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousInventory) {
                queryClient.setQueryData(
                    queryKeys.inventory.all,
                    context.previousInventory,
                );
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all }),
            ]);
        },
    });
}
