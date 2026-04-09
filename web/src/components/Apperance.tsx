import '@styles/Apperance.css';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@contexts/ThemeContext';

const Apperance = () => {
    // const [theme, setTheme] = useState<string>('dark');
    const { theme, setTheme } = useTheme();
    return (
        <div className="appearance-container">
            <section className="appearance-card">
                <h2>Appearance</h2>
                <p>
                    Customize how the dashboard looks.
                </p>
            </section>
            <section className="appearance-panel">
                <div className="appearance-panel-copy">
                    <h3>Current Theme</h3>
                    <p className="appearance-subtitle">
                        Switch between dark and light mode for your current session.
                    </p>
                </div>
                <div className="theme-option">
                    {theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                    >
                        <option value="dark">Dark </option>
                        <option value="light">Light</option>
                    </select>
                </div>
            </section>
        </div>
    );
};

export default Apperance;
