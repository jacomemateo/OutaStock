import '@/App.css';
import '@styles/Global.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import ProtectedRoute from '@/components/LoadingScreen/ProtectedRoute';
import Template from '@components/Template';
import { useTheme } from '@contexts/ThemeContext';
import { useEffect } from 'react';
import { WebSocketProvider } from '@/realtime/WebSocketProvider';

function App() {
    const { theme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <WebSocketProvider>
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
        </WebSocketProvider>
    );
}

export default App;
