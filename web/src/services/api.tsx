// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api';

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

export const fetchProducts = async () => {
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