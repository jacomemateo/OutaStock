import { getApiBaseUrl } from '@/services/auth';

const headers = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export interface AppSettings {
    lowStockThreshold: number;
}

export async function fetchSettings(token: string): Promise<AppSettings> {
    const res = await fetch(`${getApiBaseUrl()}/api/settings`, {
        headers: headers(token),
    });
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
}

export async function updateLowStockThreshold(
    token: string,
    threshold: number,
): Promise<AppSettings> {
    const res = await fetch(`${getApiBaseUrl()}/api/settings`, {
        method: 'PATCH',
        headers: headers(token),
        body: JSON.stringify({ lowStockThreshold: threshold }),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
}
