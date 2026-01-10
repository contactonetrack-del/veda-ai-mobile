/**
 * Language Context
 * Manages global language state and provides translation helper
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode } from '../services/api';
import { translations, t } from '../i18n/translations';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => Promise<void>;
    t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>('en');
    const [isLoading, setIsLoading] = useState(true);

    // Load saved language on mount
    useEffect(() => {
        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
                if (savedLanguage) {
                    setLanguageState(savedLanguage as LanguageCode);
                }
            } catch (error) {
                console.log('Error loading language:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadLanguage();
    }, []);

    const setLanguage = async (lang: LanguageCode) => {
        setLanguageState(lang);
        await AsyncStorage.setItem('selectedLanguage', lang);
    };

    // Translation helper that uses current language
    const translate = (key: keyof typeof translations.en) => {
        return t(key, language);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
