import { requestJson } from '@/services/http';
import type { AppSettings } from '@/services/types';

export function fetchSettings(): Promise<AppSettings> {
    return requestJson<AppSettings>('/settings');
}

export function updateLowStockThreshold(threshold: number): Promise<AppSettings> {
    return requestJson<AppSettings>('/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lowStockThreshold: threshold }),
    });
}
