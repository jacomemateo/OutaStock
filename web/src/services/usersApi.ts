import { getApiBaseUrl } from '@/services/auth';

const headers = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export interface UserRecord {
    userId: string;
    email: string;
    role: 'admin' | 'worker';
    isActive: boolean;
    dateCreated: string;
}

const parseErrorMessage = async (res: Response, fallback: string) => {
    const body = await res.json().catch(() => ({}));
    return (
        (body as { error?: string; message?: string }).message ??
        (body as { error?: string; message?: string }).error ??
        fallback
    );
};

export const listUsers = async (token: string): Promise<UserRecord[]> => {
    const res = await fetch(`${getApiBaseUrl()}/api/users`, { headers: headers(token) });
    if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to fetch users'));
    return res.json();
};

export const createUser = async (
    token: string,
    payload: { email: string; password: string; role: 'admin' | 'worker' },
): Promise<UserRecord> => {
    const res = await fetch(`${getApiBaseUrl()}/api/users`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to create user'));
    return res.json();
};

export const updateUserRole = async (
    token: string,
    userId: string,
    role: 'admin' | 'worker',
): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: headers(token),
        body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to update role'));
};

export const deleteUser = async (token: string, userId: string): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/api/users/${userId}`, {
        method: 'DELETE',
        headers: headers(token),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res, 'Failed to delete user'));
};

export const changeMyPassword = async (
    token: string,
    payload: { currentPassword: string; newPassword: string },
): Promise<void> => {
    const res = await fetch(`${getApiBaseUrl()}/api/users/me/password`, {
        method: 'PATCH',
        headers: headers(token),
        body: JSON.stringify(payload),
    });
    if (!res.ok)
        throw new Error(await parseErrorMessage(res, 'Failed to change password'));
};
