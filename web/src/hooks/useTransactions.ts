// web/src/hooks/useTransactions.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys, type TransactionQueryParams } from '@/lib/queryKeys';
import { fetchTransactions } from '@/services/transactionsApi';

export function useTransactions(
    params: TransactionQueryParams,
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        enabled: options.enabled ?? true,
        queryKey: queryKeys.transactions.list(params),
        queryFn: () => fetchTransactions(params),
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000,
    });
}
