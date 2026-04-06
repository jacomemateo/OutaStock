import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { isAuthenticated, status } = useAuth();

    if (status === 'loading') {
        return (
            <LoadingScreen
                message="Restoring your local ZITADEL session."
                mode="processing"
                title="Checking Session"
            />
        );
    }

    if (!isAuthenticated) {
        const returnTo = `${location.pathname}${location.search}${location.hash}`;
        return (
            <Navigate
                replace
                to={`/?returnTo=${encodeURIComponent(returnTo || '/dashboard')}`}
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
