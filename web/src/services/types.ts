export type UserRole = 'admin' | 'worker';

export type SortDirection = 'asc' | 'desc';

export interface InventoryItem {
    slotId: number;
    slotLabel: string;
    quantity: number;
    productName: string;
    priceCents: number;
    productId: string;
    dateAdded: string | null;
}

export interface Product {
    id: string;
    name: string;
    costCents: number;
    priceCents: number;
    dateCreated: string | null;
}

export interface Transaction {
    id: string;
    productName: string;
    priceAtSaleCents: number;
    dateSold: string | null;
}

export interface UserRecord {
    userId: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    dateCreated: string;
}

export interface AppSettings {
    lowStockThreshold: number;
}
