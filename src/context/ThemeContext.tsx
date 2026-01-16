/**
 * Theme Context
 * Manages system/light/dark mode state with ChatGPT-style theme picker
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ThemeColors } from '../config/colors';

// Theme preference: 'system' follows device, 'light'/'dark' are explicit
export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;  // Actual theme being used
    themePreference: ThemePreference;  // User's preference (system/light/dark)
    colors: ThemeColors;
    toggleTheme: () => void;
    setThemePreference: (preference: ThemePreference) => void;
    setTheme: (theme: ThemeType) => void; // Support manual override if needed
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

    // Calculate actual theme based on preference
    const getActualTheme = (preference: ThemePreference): ThemeType => {
        if (preference === 'system') {
            return systemScheme === 'light' ? 'light' : 'dark';
        }
        return preference;
    };

    const [theme, setTheme] = useState<ThemeType>(() => getActualTheme(themePreference));

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedPreference = await AsyncStorage.getItem('appThemePreference');
                if (savedPreference) {
                    setThemePreferenceState(savedPreference as ThemePreference);
                    setTheme(getActualTheme(savedPreference as ThemePreference));
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            }
        };
        loadTheme();
    }, []);

    // Update theme when system preference changes (only if using 'system' mode)
    useEffect(() => {
        if (themePreference === 'system') {
            setTheme(systemScheme === 'light' ? 'light' : 'dark');
        }
    }, [systemScheme, themePreference]);

    const setThemePreference = async (preference: ThemePreference) => {
        setThemePreferenceState(preference);
        setTheme(getActualTheme(preference));
        await AsyncStorage.setItem('appThemePreference', preference);
    };

    const toggleTheme = () => {
        // Cycle through: system -> light -> dark -> system
        const nextPreference: ThemePreference =
            themePreference === 'system' ? 'light' :
                themePreference === 'light' ? 'dark' : 'system';
        setThemePreference(nextPreference);
    };

    const themeColors = colors[theme];

    return (
        <ThemeContext.Provider value={{
            theme,
            themePreference,
            colors: themeColors,
            toggleTheme,
            setThemePreference,
            setTheme,
            isDark: theme === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
