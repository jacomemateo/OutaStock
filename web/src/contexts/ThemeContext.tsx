import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'light';
export type MotionPreference = 'reduced' | 'moderate' | 'full';

const THEME_STORAGE_KEY = 'outastock-theme';
const MOTION_STORAGE_KEY = 'outastock-motion';

const isThemeMode = (value: string | null): value is ThemeMode =>
    value === 'dark' || value === 'light';

const isMotionPreference = (value: string | null): value is MotionPreference =>
    value === 'reduced' || value === 'moderate' || value === 'full';

interface ThemeContextType {
    theme: ThemeMode;
    motionPreference: MotionPreference;
    setTheme: (theme: ThemeMode) => void;
    setMotionPreference: (preference: MotionPreference) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        if (typeof window === 'undefined') return 'dark';
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeMode(storedTheme) ? storedTheme : 'dark';
    });
    const [motionPreference, setMotionPreference] = useState<MotionPreference>(() => {
        if (typeof window === 'undefined') return 'full';
        const storedMotion = window.localStorage.getItem(MOTION_STORAGE_KEY);
        return isMotionPreference(storedMotion) ? storedMotion : 'full';
    });

    useEffect(() => {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        window.localStorage.setItem(MOTION_STORAGE_KEY, motionPreference);
    }, [motionPreference]);

    return (
        <ThemeContext.Provider
            value={{ theme, motionPreference, setTheme, setMotionPreference }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used inside ThemeProvider');
    return context;
};
