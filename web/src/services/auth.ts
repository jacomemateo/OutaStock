const AUTH_SESSION_STORAGE_KEY = 'outastock.auth.session';

export interface AuthUser {
    sub: string;
    userId: string;
    email: string;
    role: 'admin' | 'worker';
}

export interface AuthSession {
    accessToken: string;
    tokenType: string;
    expiresAt: number;
    role: 'admin' | 'worker';
    user: AuthUser;
}

function cleanRuntimeValue(value?: string): string | undefined {
    if (!value) {
        return undefined;
    }

    if (value.startsWith('__') && value.endsWith('__')) {
        return undefined;
    }

    return value;
}

function parseJsonStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const rawValue = window.sessionStorage.getItem(key);
    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue) as T;
    } catch {
        window.sessionStorage.removeItem(key);
        return null;
    }
}

export function getApiBaseUrl() {
    const runtimeValue = cleanRuntimeValue(
        typeof window === 'undefined' ? undefined : window.env?.API_BASE_URL,
    );
    const viteValue = cleanRuntimeValue(import.meta.env.VITE_API_URL);
    const apiBaseUrl = runtimeValue ?? viteValue;

    if (!apiBaseUrl) {
        throw new Error('The frontend API base URL is not configured.');
    }

    return apiBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
}

export function setStoredSession(session: AuthSession) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function isSessionExpired(session: AuthSession) {
    return Date.now() >= session.expiresAt;
}

export function getStoredSession() {
    const session = parseJsonStorage<AuthSession>(AUTH_SESSION_STORAGE_KEY);

    if (!session) {
        return null;
    }

    if (isSessionExpired(session)) {
        clearStoredSession();
        return null;
    }

    return session;
}

export function getAccessToken() {
    return getStoredSession()?.accessToken ?? null;
}

export async function loginWithPassword(
    email: string,
    password: string,
): Promise<AuthSession> {
    const apiBase = getApiBaseUrl();
    const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message ?? 'Login failed.');
    }

    const data = (await response.json()) as {
        accessToken: string;
        tokenType: string;
        expiresIn: number;
        role: 'admin' | 'worker';
        email: string;
        userId: string;
    };

    return {
        accessToken: data.accessToken,
        tokenType: data.tokenType,
        expiresAt: Date.now() + data.expiresIn * 1000,
        role: data.role,
        user: {
            sub: data.userId,
            userId: data.userId,
            email: data.email,
            role: data.role,
        },
    };
}
