import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
    createProduct,
    deleteProduct,
    fetchAllProducts,
    updateProduct,
} from '@/services/productsApi';
import type { Product } from '@/services/types';

export const productsQueryOptions = queryOptions({
    queryKey: queryKeys.products.all,
    queryFn: () =>
        fetchAllProducts({
            sortBy: 'name',
            sortDir: 'asc',
        }),
});

export function useProducts() {
    return useQuery(productsQueryOptions);
}

export function useCreateProductMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            name,
            costCents,
            priceCents,
        }: {
            name: string;
            costCents: number;
            priceCents: number;
        }) => createProduct(name, costCents, priceCents),
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all }),
            ]);
        },
    });
}

export function useUpdateProductMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            productId,
            costCents,
            priceCents,
        }: {
            productId: string;
            costCents: number;
            priceCents: number;
        }) => updateProduct(productId, { costCents, priceCents }),
        onMutate: async ({ productId, costCents, priceCents }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.products.all });
            const previousProducts = queryClient.getQueryData<Product[]>(
                queryKeys.products.all,
            );

            if (previousProducts) {
                queryClient.setQueryData(
                    queryKeys.products.all,
                    previousProducts.map((product) =>
                        product.id === productId
                            ? {
                                  ...product,
                                  costCents,
                                  priceCents,
                              }
                            : product,
                    ),
                );
            }

            return { previousProducts };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(
                    queryKeys.products.all,
                    context.previousProducts,
                );
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all }),
            ]);
        },
    });
}

export function useDeleteProductMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProduct,
        onMutate: async (productId) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.products.all });
            const previousProducts = queryClient.getQueryData<Product[]>(
                queryKeys.products.all,
            );

            if (previousProducts) {
                queryClient.setQueryData(
                    queryKeys.products.all,
                    previousProducts.filter((product) => product.id !== productId),
                );
            }

            return { previousProducts };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousProducts) {
                queryClient.setQueryData(
                    queryKeys.products.all,
                    context.previousProducts,
                );
            }
        },
        onSettled: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all }),
            ]);
        },
    });
}
