/**
 * Theme Context
 * Manages system/light/dark mode state with ChatGPT-style theme picker
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ThemeColors } from '../config/colors';

// Theme preference: 'system' follows device, 'light'/'dark'/'highContrast' are explicit
export type ThemePreference = 'system' | 'light' | 'dark' | 'highContrast';
export type MotionPreference = 'system' | 'reduced' | 'full';
type ThemeType = 'light' | 'dark' | 'highContrast';

// Glassmorphism Blur Intensities
export const blurIntensity = {
    subtle: 20,
    medium: 50,
    heavy: 80,
    ultra: 95
};

interface ThemeContextType {
    theme: ThemeType;  // Actual theme being used
    themePreference: ThemePreference;  // User's preference (system/light/dark)
    colors: ThemeColors;
    toggleTheme: () => void;
    setThemePreference: (preference: ThemePreference) => void;
    setTheme: (theme: ThemeType) => void; // Support manual override if needed
    isDark: boolean;
    isHighContrast: boolean;
    motionPreference: MotionPreference;
    setMotionPreference: (pref: MotionPreference) => void;
    isReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
    const [motionPreference, setMotionPreferenceState] = useState<MotionPreference>('system');

    // In a real app, we'd check AccessibilityInfo.isReduceMotionEnabled() here for 'system'
    // For now, default 'system' = full motion unless we add that check
    const isReducedMotion = motionPreference === 'reduced';

    // Calculate actual theme based on preference
    const getActualTheme = (preference: ThemePreference): ThemeType => {
        if (preference === 'system') {
            return systemScheme === 'light' ? 'light' : 'dark';
        }
        return preference; // 'light', 'dark', or 'highContrast'
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

                const savedMotion = await AsyncStorage.getItem('appMotionPreference');
                if (savedMotion) {
                    setMotionPreferenceState(savedMotion as MotionPreference);
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

    const setMotionPreference = async (preference: MotionPreference) => {
        setMotionPreferenceState(preference);
        await AsyncStorage.setItem('appMotionPreference', preference);
    };

    const toggleTheme = () => {
        // Cycle through: system -> light -> dark -> highContrast -> system
        const nextPreference: ThemePreference =
            themePreference === 'system' ? 'light' :
                themePreference === 'light' ? 'dark' :
                    themePreference === 'dark' ? 'highContrast' : 'system';
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
            isDark: theme === 'dark' || theme === 'highContrast',
            isHighContrast: theme === 'highContrast',
            motionPreference,
            setMotionPreference,
            isReducedMotion
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
