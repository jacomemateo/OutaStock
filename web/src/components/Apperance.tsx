import '@styles/Apperance.css';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { MotionPreference, useTheme } from '@contexts/ThemeContext';

const motionOptions: {
    value: MotionPreference;
    label: string;
    description: string;
}[] = [
    {
        value: 'reduced',
        label: 'Fast',
        description: 'Disables animations and transitions for a snappier layout.',
    },
    {
        value: 'moderate',
        label: 'Balanced',
        description: 'Keeps light motion while reducing the overall intensity.',
    },
    {
        value: 'full',
        label: 'Full',
        description: 'Uses the default animations and transitions across the app.',
    },
];

const Apperance = () => {
    const { theme, motionPreference, setTheme, setMotionPreference } = useTheme();
    const motionIndex = motionOptions.findIndex(
        (option) => option.value === motionPreference,
    );
    const selectedMotion = motionOptions[motionIndex] ?? motionOptions[2];

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
            <section className="appearance-card motion-card">
                <div className="motion-card-header">
                    <div className="motion-card-copy">
                        <h3>Motion Intensity</h3>
                        <p className="appearance-subtitle">
                            Control how aggressive animations and transitions feel.
                        </p>
                    </div>
                    <span className="motion-level-pill">{selectedMotion.label}</span>
                </div>
                <div className="motion-slider-group">
                    <input
                        className="motion-slider"
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={motionIndex}
                        onChange={(e) =>
                            setMotionPreference(
                                motionOptions[Number(e.target.value)].value,
                            )
                        }
                        aria-label="Motion intensity"
                    />
                    <div className="motion-slider-labels" aria-hidden="true">
                        {motionOptions.map((option, index) => (
                            <button
                                key={option.value}
                                className={`motion-slider-label${
                                    motionPreference === option.value ? ' active' : ''
                                }`}
                                onClick={() => setMotionPreference(option.value)}
                                type="button"
                            >
                                <span className="motion-slider-label-title">
                                    {index + 1}. {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <p className="motion-description">{selectedMotion.description}</p>
            </section>
        </div>
    );
};

export default Apperance;
