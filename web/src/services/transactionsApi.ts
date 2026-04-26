import { requestJson, toCount } from '@/services/http';
import type { SortDirection, Transaction } from '@/services/types';

export type TransactionSortField = 'product' | 'date' | 'price';

export interface TransactionListOptions {
    search?: string;
    sortBy?: TransactionSortField;
    sortDir?: SortDirection;
    pageOffset?: number;
    numRows: number;
}

export interface TransactionsResult {
    items: Transaction[];
    total: number;
}

function buildListParams({
    numRows,
    pageOffset = 0,
    search,
    sortBy = 'date',
    sortDir = 'desc',
}: TransactionListOptions) {
    const params = new URLSearchParams({
        num_rows: String(numRows),
        page_offset: String(pageOffset),
        sort_by: sortBy,
        sort_dir: sortDir,
    });

    if (search) {
        params.set('search', search);
    }

    return params;
}

export async function getTransactionCount(search = '') {
    const params = new URLSearchParams();
    if (search) {
        params.set('search', search);
    }

    const response = await requestJson<unknown>(
        `/transactions/count${params.size > 0 ? `?${params.toString()}` : ''}`,
    );

    return toCount(response);
}

export async function listTransactions(options: TransactionListOptions) {
    const params = buildListParams(options);
    return requestJson<Transaction[]>(`/transactions/?${params.toString()}`);
}

export async function fetchTransactions(options: TransactionListOptions): Promise<TransactionsResult> {
    const [total, items] = await Promise.all([
        getTransactionCount(options.search),
        listTransactions(options),
    ]);

    return { items, total };
}
