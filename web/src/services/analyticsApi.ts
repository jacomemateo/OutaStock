import { getApiBaseUrl } from '@/services/auth';

const headers = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

const base = () => getApiBaseUrl();

export interface DailyRevenueRow {
    date: string;
    revenueCents: number;
    profitCents: number;
}

export interface TopProductRow {
    productName: string;
    unitsSold: number;
    profitCents: number;
}

export interface InventorySlot {
    slotId: string;
    productName: string;
    quantity: number;
    costCents: number;
    priceCents: number;
}

export interface InventoryHealthResponse {
    threshold: number;
    slots: InventorySlot[];
}

export interface HeatmapRow {
    date: string;
    transactionCount: number;
    revenueCents: number;
}

export async function fetchRevenue(token: string, days: number): Promise<DailyRevenueRow[]> {
    const res = await fetch(`${base()}/api/analytics/revenue?days=${days}`, {
        headers: headers(token),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch revenue');
    }
    return res.json();
}

export async function fetchTopProducts(token: string, days: number): Promise<TopProductRow[]> {
    const res = await fetch(`${base()}/api/analytics/top-products?days=${days}`, {
        headers: headers(token),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch top products');
    }
    return res.json();
}

export async function fetchInventoryHealth(token: string): Promise<InventoryHealthResponse> {
    const res = await fetch(`${base()}/api/analytics/inventory-health`, {
        headers: headers(token),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch inventory health');
    }
    return res.json();
}

export async function fetchHeatmap(token: string): Promise<HeatmapRow[]> {
    const res = await fetch(`${base()}/api/analytics/heatmap`, {
        headers: headers(token),
    });
    if (!res.ok) {
        throw new Error('Failed to fetch heatmap');
    }
    return res.json();
}
