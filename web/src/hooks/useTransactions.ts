import { useQuery } from '@tanstack/react-query';
import { queryKeys, type TransactionQueryParams } from '@/lib/queryKeys';
import { fetchTransactions, listTransactions } from '@/services/transactionsApi';

export function useTransactions(
    params: TransactionQueryParams,
    options: { enabled?: boolean; includeCount?: boolean } = {},
) {
    const enabled = options.enabled ?? true;
    const includeCount = options.includeCount ?? true;

    return useQuery({
        enabled,
        queryKey: queryKeys.transactions.list(params),
        queryFn: async () => {
            if (!includeCount) {
                const items = await listTransactions(params);
                return { items, total: items.length };
            }

            return fetchTransactions(params);
        },
    });
}
