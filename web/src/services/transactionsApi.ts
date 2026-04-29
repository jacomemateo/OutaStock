import { requestJson } from '@/services/http';
import type { SortDirection, Transaction } from '@/services/types';

export type TransactionSortField = 'product' | 'date' | 'price';

export interface TransactionCursor {
    date: string;
    id: string;
}

export interface TransactionListOptions {
    search?: string;
    sortBy?: TransactionSortField;
    sortDir?: SortDirection;
    pageOffset?: number;
    cursor?: TransactionCursor | null;
    numRows: number;
}

export interface TransactionsResult {
    items: Transaction[];
    total: number;
}

function buildListParams({
    numRows,
    pageOffset = 0,
    cursor,
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

    if (cursor) {
        params.set('cursor_date', cursor.date);
        params.set('cursor_id', cursor.id);
    }

    return params;
}

function buildTransactionsUrl(options: TransactionListOptions) {
    const params = buildListParams(options);
    return `/transactions/?${params.toString()}`;
}

export async function fetchTransactions(
    options: TransactionListOptions,
): Promise<TransactionsResult> {
    return requestJson<{ items: Transaction[]; total: number }>(
        buildTransactionsUrl(options),
    );
}
