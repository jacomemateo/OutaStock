import type {
    InventorySortField,
} from '@/services/inventoryApi';
import type { ProductSortField } from '@/services/productsApi';
import type { TransactionSortField } from '@/services/transactionsApi';
import type { SortDirection } from '@/services/types';

export interface InventoryQueryParams {
    search?: string;
    sortBy?: InventorySortField;
    sortDir?: SortDirection;
}

export interface ProductQueryParams {
    search?: string;
    sortBy?: ProductSortField;
    sortDir?: SortDirection;
}

export interface TransactionQueryParams {
    search?: string;
    sortBy?: TransactionSortField;
    sortDir?: SortDirection;
    pageOffset?: number;
    numRows: number;
}

export const queryKeys = {
    inventory: {
        all: ['inventory'] as const,
        list: (params: InventoryQueryParams) => ['inventory', params] as const,
    },
    products: {
        all: ['products'] as const,
        list: (params: ProductQueryParams) => ['products', params] as const,
    },
    metrics: {
        all: ['metrics'] as const,
    },
    transactions: {
        all: ['transactions'] as const,
        list: (params: TransactionQueryParams) => ['transactions', params] as const,
    },
    users: {
        all: ['users'] as const,
    },
    session: {
        all: ['session'] as const,
    },
    settings: {
        all: ['settings'] as const,
    },
} as const;

export const serverStateRoots = [
    queryKeys.inventory.all[0],
    queryKeys.products.all[0],
    queryKeys.metrics.all[0],
    queryKeys.transactions.all[0],
    queryKeys.users.all[0],
    queryKeys.session.all[0],
    queryKeys.settings.all[0],
] as const;
