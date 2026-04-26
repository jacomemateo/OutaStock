import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/services/http';

function shouldRetryQuery(failureCount: number, error: unknown) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return false;
    }

    return failureCount < 2;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 5 * 60 * 1000,
            refetchOnReconnect: true,
            refetchOnWindowFocus: false,
            retry: shouldRetryQuery,
            staleTime: 30 * 1000,
        },
        mutations: {
            retry: 0,
        },
    },
});
