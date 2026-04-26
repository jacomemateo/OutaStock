import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { isAdmin, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate replace to="/" />;
    if (!isAdmin) return <Navigate replace to="/dashboard" />;
    return <>{children}</>;
};

export default AdminRoute;
