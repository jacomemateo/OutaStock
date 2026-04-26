import {
    queryOptions,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import {
    clearStoredSession,
    getStoredSession,
    loginWithPassword,
    revalidateSession,
    setStoredSession,
    type AuthSession,
} from '@/services/auth';
import { queryKeys } from '@/lib/queryKeys';

function getStatusCode(error: unknown) {
    if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        typeof error.status === 'number'
    ) {
        return error.status;
    }

    return null;
}

async function fetchSession() {
    const storedSession = getStoredSession();
    if (!storedSession) {
        return null;
    }

    try {
        const nextSession = await revalidateSession(storedSession.accessToken);
        setStoredSession(nextSession);
        return nextSession;
    } catch (error) {
        const statusCode = getStatusCode(error);
        if (statusCode === 401 || statusCode === 403) {
            clearStoredSession();
            return null;
        }

        return storedSession;
    }
}

export const sessionQueryOptions = queryOptions({
    queryKey: queryKeys.session.all,
    queryFn: fetchSession,
    initialData: () => getStoredSession(),
    refetchOnWindowFocus: 'always',
    retry: false,
    staleTime: 0,
});

export function useSession() {
    const query = useQuery(sessionQueryOptions);
    const session = query.data ?? null;

    return {
        ...query,
        isAdmin: session?.role === 'admin',
        isAuthenticated: Boolean(session),
        session,
        user: session?.user ?? null,
    };
}

export function useSignInMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            email,
            password,
        }: {
            email: string;
            password: string;
        }) => loginWithPassword(email, password),
        onSuccess: (session: AuthSession) => {
            setStoredSession(session);
            queryClient.setQueryData(queryKeys.session.all, session);
        },
    });
}
