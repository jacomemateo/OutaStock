import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    clearStoredSession,
    getStoredSession,
    isSessionExpired,
    loginWithPassword,
    setStoredSession,
    type AuthSession,
} from '@/services/auth';

type AuthStatus = 'anonymous' | 'authenticated' | 'loading';

interface AuthContextValue {
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    session: AuthSession | null;
    signIn: (email: string, password: string) => Promise<AuthSession>;
    signOut: () => void;
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
            setError('Your session has expired. Please sign in again.');
            return;
        }

        const timeoutId = window.setTimeout(() => {
            clearStoredSession();
            setSession(null);
            setStatus('anonymous');
            setError('Your session has expired. Please sign in again.');
        }, remainingTime);

        return () => window.clearTimeout(timeoutId);
    }, [session]);

    const signIn = async (email: string, password: string) => {
        setError(null);
        setStatus('loading');

        try {
            const nextSession = await loginWithPassword(email, password);
            setStoredSession(nextSession);
            setSession(nextSession);
            setStatus('authenticated');
            return nextSession;
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

    const signOut = () => {
        setError(null);
        clearStoredSession();
        setSession(null);
        setStatus('anonymous');
    };

    return (
        <AuthContext.Provider
            value={{
                error,
                isAuthenticated: Boolean(session),
                isAdmin: session?.role === 'admin',
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
