// src/services/api.tsx
// src/services/api.js

import { getAccessToken } from '@/services/auth';

let API_BASE_URL = window.env?.API_BASE_URL;

if (!API_BASE_URL || API_BASE_URL === '__API_BASE_URL__') {
    API_BASE_URL = import.meta.env.VITE_API_URL;
}

console.log('API Base URL:', API_BASE_URL);

const authFetch = (input: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    const accessToken = getAccessToken();

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return fetch(input, {
        ...init,
        headers,
    });
};

type SortDirection = 'asc' | 'desc';

type ListQueryOptions = {
    search?: string;
    sortBy?: string;
    sortDir?: SortDirection;
};

// To get paginated
const getPaginated = async (
    endpoint: string,
    numRows: number,
    pageOffset: number,
    options: ListQueryOptions = {},
) => {
    const params = new URLSearchParams({
        num_rows: numRows.toString(),
        page_offset: pageOffset.toString(),
    });

    if (options.search) {
        params.set('search', options.search);
    }

    if (options.sortBy) {
        params.set('sort_by', options.sortBy);
    }

    if (options.sortDir) {
        params.set('sort_dir', options.sortDir);
    }

    const response = await authFetch(`${API_BASE_URL}${endpoint}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

export const fetchInventory = (n: number, p: number, options: ListQueryOptions = {}) =>
    getPaginated('/inventory/', n, p, options);
export const fetchTransactions = (n: number, p: number, options: ListQueryOptions = {}) =>
    getPaginated('/transactions/', n, p, options);
export const fetchProducts = (n: number, p: number, options: ListQueryOptions = {}) =>
    getPaginated('/products/', n, p, options);

// To get row counts for each
const getCount = async (endpoint: string, search = '') => {
    const params = new URLSearchParams();

    if (search) {
        params.set('search', search);
    }

    const query = params.toString();
    const response = await authFetch(
        `${API_BASE_URL}${endpoint}${query ? `?${query}` : ''}`,
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} at ${endpoint}`);
    }
    return await response.json();
};

export const getInventoryCount = (search = '') => getCount('/inventory/count', search);
export const getTransactionCount = (search = '') =>
    getCount('/transactions/count', search);
export const getProductCount = (search = '') => getCount('/products/count', search);

//  * Assign a product to a slot (initial quantity optional)
export const assignProductToSlot = async (
    slotID: number,
    productUUID: string,
    quantity = 0,
) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/inventory/${slotID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productUUID, quantity }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error assigning product to slot ${slotID}:`, error);
        throw error;
    }
};

// Remove a product from a slot (unassign)
export const unassignProductFromSlot = async (slotID: number) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/inventory/${slotID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productUUID: null, quantity: null }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error unassigning product from slot ${slotID}:`, error);
        throw error;
    }
};

//  Update only the quantity of a slot
export const updateSlotQuantity = async (slotID: number, quantity: number) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/inventory/${slotID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productUUID: null, quantity }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error updating quantity for slot ${slotID}:`, error);
        throw error;
    }
};

// update both product and quantity for a slot
export const updateSlotProductAndQuantity = async (
    slotID: number,
    productUUID: string,
    quantity: number,
) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/inventory/${slotID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productUUID, quantity }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error updating product and quantity for slot ${slotID}:`, error);
        throw error;
    }
};

export const createProduct = async (
    name: string,
    costCents: number,
    priceCents: number,
) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/products/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, costCents, priceCents }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error creating product:`, error);
        throw error;
    }
};

// Delete a product by ID
export const deleteProduct = async (productID: string) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/products/${productID}`, {
            method: 'DELETE',
        });
        console.log(`Delete response for product ${productID}:`, response);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const contentLength = response.headers.get('content-length');
        if (contentLength === '0' || response.status === 204) {
            return null; // or return true/success indicator
        }
        // return await response.json();
    } catch (error) {
        console.error(`Error deleting product:`, error);
        throw error;
    }
};

export const updateProductPrice = async (productID: string, priceCents: number) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/products/${productID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceCents }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error updating product price:`, error);
        throw error;
    }
};

export const updateProductCost = async (productID: string, costCents: number) => {
    try {
        const response = await authFetch(`${API_BASE_URL}/products/${productID}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ costCents }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error updating product cost:`, error);
        throw error;
    }
};
