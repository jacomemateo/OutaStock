import '@styles/Apperance.css';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@contexts/ThemeContext';

const Apperance = () => {
    // const [theme, setTheme] = useState<string>('dark');
    const { theme, setTheme } = useTheme();
    return (
        <div className="theme-choice-container">
            <div className="theme-heading-section">
                <p className="theme-choice-subtitle">Customize your appearance</p>
            </div>
            <div className="theme-options-section">
                <p>Current Theme</p>
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
            </div>
        </div>
    );
};

export default Apperance;
