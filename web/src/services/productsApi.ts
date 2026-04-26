import { requestJson, toCount } from '@/services/http';
import type { Product, SortDirection } from '@/services/types';

export type ProductSortField = 'name' | 'cost' | 'price';

export interface ProductListOptions {
    search?: string;
    sortBy?: ProductSortField;
    sortDir?: SortDirection;
}

function buildListParams({
    search,
    sortBy = 'name',
    sortDir = 'asc',
}: ProductListOptions = {}) {
    const params = new URLSearchParams({
        sort_by: sortBy,
        sort_dir: sortDir,
    });

    if (search) {
        params.set('search', search);
    }

    return params;
}

export async function getProductCount(search = '') {
    const params = new URLSearchParams();
    if (search) {
        params.set('search', search);
    }

    const response = await requestJson<unknown>(
        `/products/count${params.size > 0 ? `?${params.toString()}` : ''}`,
    );

    return toCount(response);
}

export async function listProducts(
    numRows: number,
    pageOffset: number,
    options: ProductListOptions = {},
) {
    const params = buildListParams(options);
    params.set('num_rows', String(numRows));
    params.set('page_offset', String(pageOffset));

    return requestJson<Product[]>(`/products/?${params.toString()}`);
}

export async function fetchAllProducts(options: ProductListOptions = {}) {
    const totalRows = await getProductCount(options.search);
    if (totalRows <= 0) {
        return [] satisfies Product[];
    }

    return listProducts(totalRows, 0, options);
}

export function createProduct(name: string, costCents: number, priceCents: number) {
    return requestJson<string>('/products/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, costCents, priceCents }),
    });
}

export function updateProductPrice(productId: string, priceCents: number) {
    return requestJson<string>(`/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceCents }),
    });
}

export function updateProductCost(productId: string, costCents: number) {
    return requestJson<string>(`/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costCents }),
    });
}

export function updateProduct(
    productId: string,
    values: { costCents: number; priceCents: number },
) {
    return requestJson<string>(`/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    });
}

export function deleteProduct(productId: string) {
    return requestJson<null>(`/products/${productId}`, {
        method: 'DELETE',
    });
}
