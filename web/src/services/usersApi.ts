import { requestJson } from '@/services/http';
import type { UserRecord, UserRole } from '@/services/types';

export interface CreatedUserResponse {
    userId: string;
    email: string;
    role: UserRole;
}

export function listUsers(): Promise<UserRecord[]> {
    return requestJson<UserRecord[]>('/users');
}

export function createUser(payload: {
    email: string;
    password: string;
    role: UserRole;
}): Promise<CreatedUserResponse> {
    return requestJson<CreatedUserResponse>('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export function updateUserRole(userId: string, role: UserRole): Promise<void> {
    return requestJson<void>(`/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
    });
}

export function deleteUser(userId: string): Promise<void> {
    return requestJson<void>(`/users/${userId}`, {
        method: 'DELETE',
    });
}

export function changeMyPassword(payload: {
    currentPassword: string;
    newPassword: string;
}): Promise<void> {
    return requestJson<void>('/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}
