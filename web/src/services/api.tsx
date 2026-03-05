// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL

export const fetchRecentTransactions = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/recent?limit=${limit}`);
    
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
export const fetchInventory = async () => {
  try{
    const response = await fetch(`${API_BASE_URL}/inventory/all`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

 

//  * Assign a product to a slot (initial quantity optional)
export const assignProductToSlot = async (slotID: number, productUUID: string, quantity = 0) => {
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