import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';

const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { isAdmin, isAuthenticated, status } = useAuth();
    if (status === 'loading') {
        return (
            <LoadingScreen
                message="Confirming your permissions."
                mode="processing"
                title="Checking Access"
            />
        );
    }
    if (!isAuthenticated) return <Navigate replace to="/" />;
    if (!isAdmin) return <Navigate replace to="/dashboard" />;
    return <>{children}</>;
};

export default AdminRoute;
