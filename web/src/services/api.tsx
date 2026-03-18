// src/services/api.tsx
const API_BASE_URL = window.env?.API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined');
}

console.log('API Base URL:', API_BASE_URL);

/** -----------------------------
 * Transaction Actions
 * ----------------------------- */
export const fetchRecentTransactions = async (limit = 10) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/transactions/recent?limit=${limit}`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

/** -----------------------------
 * Inventory Actions
 * ----------------------------- */
export const fetchInventory = async (numRows: number, pageOffset: number) => {
    try {
        const url = new URL(`${API_BASE_URL}/inventory/`);
        url.searchParams.append('num_rows', numRows.toString());
        url.searchParams.append('page_offset', pageOffset.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching inventory:', error);
        throw error;
    }
};

export const getInventoryCount = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventory/count`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching inventory count:', error);
        throw error;
    }
};

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

/** -----------------------------
 * Product Actions
 * ----------------------------- */

export const getAllProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/all`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};
