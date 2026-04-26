import type { InventoryItem, Product } from '@/services/types';

export interface InventoryMetrics {
    totalProductCount: number;
    lowStockCount: number;
    outOfStockCount: number;
}

export function computeInventoryMetrics(
    inventory: InventoryItem[],
    products: Product[],
    lowStockThreshold: number,
): InventoryMetrics {
    const assignedInventory = inventory.filter((item) => Boolean(item.productId));
    const lowStockCount = assignedInventory.filter(
        (item) => item.quantity > 0 && item.quantity < lowStockThreshold,
    ).length;
    const outOfStockCount = assignedInventory.filter((item) => item.quantity === 0).length;

    return {
        totalProductCount: products.length,
        lowStockCount,
        outOfStockCount,
    };
}
