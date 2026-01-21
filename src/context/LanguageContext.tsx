/**
 * Language Context
 * Manages global language state and provides translation helper
 * Refactored to use react-i18next
 */

import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode } from '../services/api'; // Maintain type ref if possible, or use string
import '../i18n'; // Ensure i18n is initialized

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { t, i18n } = useTranslation();

    const setLanguage = async (lang: string) => {
        await i18n.changeLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language: i18n.language, setLanguage, t }}>
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
