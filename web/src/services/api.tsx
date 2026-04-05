// src/services/api.tsx
// src/services/api.js

let API_BASE_URL = window.env?.API_BASE_URL;

if (!API_BASE_URL || API_BASE_URL === '__API_BASE_URL__') {
    API_BASE_URL = import.meta.env.VITE_API_URL;
}

console.log('API Base URL:', API_BASE_URL);

// To get paginated
const getPaginated = async (endpoint: string, numRows: number, pageOffset: number) => {
    const params = new URLSearchParams({
        num_rows: numRows.toString(),
        page_offset: pageOffset.toString(),
    });
    const response = await fetch(`${API_BASE_URL}${endpoint}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

export const fetchInventory = (n: number, p: number) => getPaginated('/inventory/', n, p);
export const fetchTransactions = (n: number, p: number) =>
    getPaginated('/transactions/', n, p);
export const fetchProducts = (n: number, p: number) => getPaginated('/products/', n, p);

// To get row counts for each
const getCount = async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} at ${endpoint}`);
    }
    return await response.json();
};

export const getInventoryCount = () => getCount('/inventory/count');
export const getTransactionCount = () => getCount('/transactions/count');
export const getProductCount = () => getCount('/products/count');

//  * Assign a product to a slot (initial quantity optional)
export const assignProductToSlot = async (
    slotID: number,
    productUUID: string,
    quantity = 0,
) => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/${slotID}`, {
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
        const response = await fetch(`${API_BASE_URL}/inventory/${slotID}`, {
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
        const response = await fetch(`${API_BASE_URL}/inventory/${slotID}`, {
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
        const response = await fetch(`${API_BASE_URL}/inventory/${slotID}`, {
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

export const createProduct = async (name: string, priceCents: number) => {
    try{
        const response = await fetch(`${API_BASE_URL}/products/new`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, priceCents }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error creating product:`, error);
        throw error;
    }
};