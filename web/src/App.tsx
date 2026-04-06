import '@/App.css';
import '@styles/Global.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthCallback from '@components/AuthCallback';
import LoadingScreen from '@components/LoadingScreen';
import ProtectedRoute from '@components/ProtectedRoute';
import Template from '@components/Template';
import { useTheme } from '@contexts/ThemeContext';
import AlertProvider  from '@contexts/SnackBarAlertContext';
import { useEffect } from 'react';

function App() {
    const { theme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    return (
        <Routes>
            <Route path="/" element={<LoadingScreen />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute>
                        <Template />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
    );
}

export default App;
