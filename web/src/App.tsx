import '@/App.css';
import '@styles/Global.css';
import { Route, Routes } from 'react-router-dom';
import LoadingScreen from '@components/LoadingScreen';
import Template from '@components/Template';
import { useTheme } from '@contexts/ThemeContext';
import { useEffect } from 'react';

function App() {
    const { theme } = useTheme();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    return (
        <Routes>
            <Route path="/" element={<LoadingScreen />} />
            {/* The /* tells the router: "Let Template handle any sub-paths after /dashboard" */}
            <Route path="/dashboard/*" element={<Template />} />
        </Routes>
    );
}

export default App;
