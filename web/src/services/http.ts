import { getAccessToken, getApiBaseUrl } from '@/services/auth';

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly body?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

function buildUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    return `${getApiBaseUrl()}/api${path}`;
}

async function parseBody(response: Response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return text.length > 0 ? text : null;
}

function getErrorMessage(body: unknown, fallback: string) {
    if (typeof body === 'string' && body.trim()) {
        return body;
    }

    if (body && typeof body === 'object') {
        const errorBody = body as { error?: string; message?: string };
        if (errorBody.message) {
            return errorBody.message;
        }
        if (errorBody.error) {
            return errorBody.error;
        }
    }

    return fallback;
}

export async function requestJson<T>(
    path: string,
    init: RequestInit = {},
    options: { auth?: boolean } = {},
): Promise<T> {
    const headers = new Headers(init.headers);

    if (options.auth !== false) {
        const accessToken = getAccessToken();
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
    }

    const response = await fetch(buildUrl(path), {
        ...init,
        headers,
    });

    const body = await parseBody(response);
    if (!response.ok) {
        throw new ApiError(
            getErrorMessage(body, `Request failed with status ${response.status}.`),
            response.status,
            body,
        );
    }

    return body as T;
}

export function toCount(countData: unknown) {
    if (typeof countData === 'number') {
        return countData;
    }

    if (countData && typeof countData === 'object') {
        return Number((countData as { count?: number }).count ?? 0);
    }

    return 0;
}
