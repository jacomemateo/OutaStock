import '@/App.css';
import '@styles/Global.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import ProtectedRoute from '@/components/LoadingScreen/ProtectedRoute';
import Template from '@components/Template';
import AlertProvider from '@contexts/SnackBarAlertContext';
import { useTheme } from '@contexts/ThemeContext';
import { useEffect } from 'react';

function App() {
    const { theme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <AlertProvider>
            <Routes>
                <Route path="/" element={<LoadingScreen />} />
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
        </AlertProvider>
    );
}

export default App;
