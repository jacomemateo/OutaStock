import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { clearStoredSession, type AuthSession } from '@/services/auth';
import { useIdleSession } from '@/hooks/useIdleSession';
import { useSession, useSignInMutation } from '@/hooks/useSession';
import { queryKeys, serverStateRoots } from '@/lib/queryKeys';

type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

interface AuthContextValue {
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    session: AuthSession | null;
    signIn: (email: string, password: string) => Promise<AuthSession>;
    signOut: (message?: string) => void;
    status: AuthStatus;
    user: AuthSession['user'] | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const { isAdmin, isAuthenticated, session, user, isPending } = useSession();
    const signInMutation = useSignInMutation();
    const [error, setError] = useState<string | null>(null);

    const clearServerState = useCallback(() => {
        serverStateRoots
            .filter((rootKey) => rootKey !== queryKeys.session.all[0])
            .forEach((rootKey) => {
                queryClient.removeQueries({ queryKey: [rootKey] });
            });
    }, [queryClient]);

    const signIn = useCallback(
        async (email: string, password: string) => {
            setError(null);

            try {
                return await signInMutation.mutateAsync({ email, password });
            } catch (caughtError) {
                clearStoredSession();
                queryClient.setQueryData(queryKeys.session.all, null);
                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : 'Sign-in failed unexpectedly.',
                );
                throw caughtError;
            }
        },
        [queryClient, signInMutation],
    );

    const signOut = useCallback(
        (message?: string) => {
            setError(message ?? null);
            clearStoredSession();
            clearServerState();
            queryClient.setQueryData(queryKeys.session.all, null);
        },
        [clearServerState, queryClient],
    );

    useIdleSession({ session, signOut });

    const status: AuthStatus =
        signInMutation.isPending || (isPending && !session)
            ? 'loading'
            : session
              ? 'authenticated'
              : 'anonymous';

    return (
        <AuthContext.Provider
            value={{
                error,
                isAuthenticated,
                isAdmin,
                session,
                signIn,
                signOut,
                status,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider.');
    }

    return context;
}
