import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    clearStoredSession,
    completeLogin,
    getAuthConfig,
    getStoredSession,
    isAuthConfigured,
    isSessionExpired,
    startLogin,
    startLogout,
    type AuthSession,
} from '@/services/auth';

type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

interface AuthContextValue {
    completeSignIn: (callbackUrl?: string) => Promise<string>;
    config: ReturnType<typeof getAuthConfig>;
    error: string | null;
    isAuthenticated: boolean;
    isConfigured: boolean;
    session: AuthSession | null;
    signIn: (returnTo?: string) => Promise<void>;
    signOut: () => Promise<void>;
    status: AuthStatus;
    user: AuthSession['user'] | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSessionFromStorage() {
    const storedSession = getStoredSession();

    if (!storedSession) {
        return null;
    }

    if (isSessionExpired(storedSession)) {
        clearStoredSession();
        return null;
    }

    return storedSession;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedSession = readSessionFromStorage();
        setSession(storedSession);
        setStatus(storedSession ? 'authenticated' : 'anonymous');
    }, []);

    useEffect(() => {
        if (!session) {
            return;
        }

        const remainingTime = session.expiresAt - Date.now();

        if (remainingTime <= 0) {
            clearStoredSession();
            setSession(null);
            setStatus('anonymous');
            return;
        }

        const timeoutId = window.setTimeout(() => {
            clearStoredSession();
            setSession(null);
            setStatus('anonymous');
        }, remainingTime);

        return () => window.clearTimeout(timeoutId);
    }, [session]);

    const signIn = async (returnTo = '/dashboard') => {
        setError(null);
        await startLogin(returnTo);
    };

    const completeSignIn = async (callbackUrl = window.location.href) => {
        setError(null);
        setStatus('loading');

        try {
            const result = await completeLogin(callbackUrl);
            setSession(result.session);
            setStatus('authenticated');
            return result.returnTo;
        } catch (caughtError) {
            clearStoredSession();
            setSession(null);
            setStatus('anonymous');
            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Sign-in failed unexpectedly.',
            );
            throw caughtError;
        }
    };

    const signOut = async () => {
        setError(null);
        const currentSession = getStoredSession();
        clearStoredSession();
        setSession(null);
        setStatus('anonymous');
        await startLogout(currentSession);
    };

    return (
        <AuthContext.Provider
            value={{
                completeSignIn,
                config: getAuthConfig(),
                error,
                isAuthenticated: Boolean(session),
                isConfigured: isAuthConfigured(),
                session,
                signIn,
                signOut,
                status,
                user: session?.user ?? null,
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
