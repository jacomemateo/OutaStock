import { requestJson, toCount } from '@/services/http';
import type { InventoryItem, SortDirection } from '@/services/types';

export type InventorySortField = 'location' | 'product' | 'quantity';

export interface InventoryListOptions {
    search?: string;
    sortBy?: InventorySortField;
    sortDir?: SortDirection;
}

export interface UpdateInventoryInput {
    slotId: number;
    productId: string | null;
    quantity: number | null;
}

function buildListParams({
    search,
    sortBy = 'location',
    sortDir = 'asc',
}: InventoryListOptions = {}) {
    const params = new URLSearchParams({
        sort_by: sortBy,
        sort_dir: sortDir,
    });

    if (search) {
        params.set('search', search);
    }

    return params;
}

export async function getInventoryCount(search = '') {
    const params = new URLSearchParams();
    if (search) {
        params.set('search', search);
    }

    const response = await requestJson<unknown>(
        `/inventory/count${params.size > 0 ? `?${params.toString()}` : ''}`,
    );

    return toCount(response);
}

export async function listInventory(
    numRows: number,
    pageOffset: number,
    options: InventoryListOptions = {},
) {
    const params = buildListParams(options);
    params.set('num_rows', String(numRows));
    params.set('page_offset', String(pageOffset));

    return requestJson<InventoryItem[]>(`/inventory/?${params.toString()}`);
}

export async function fetchAllInventory(options: InventoryListOptions = {}) {
    const totalRows = await getInventoryCount(options.search);
    if (totalRows <= 0) {
        return [] satisfies InventoryItem[];
    }

    return listInventory(totalRows, 0, options);
}

export async function updateInventorySlot({
    slotId,
    productId,
    quantity,
}: UpdateInventoryInput) {
    return requestJson<{ message: string }>(`/inventory/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productUUID: productId,
            quantity,
        }),
    });
}

export function removeInventoryProduct(slotId: number) {
    return updateInventorySlot({
        slotId,
        productId: null,
        quantity: null,
    });
}
