import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import LanguageService from '../services/LanguageService';

const resources: Record<string, { translation: typeof en }> = {
    en: { translation: en },
    // Major Indian Languages (Phase 1 & 2)
    hi: { translation: en }, // Hindi
    bn: { translation: en }, // Bengali
    te: { translation: en }, // Telugu
    ta: { translation: en }, // Tamil
    mr: { translation: en }, // Marathi
    ur: { translation: en }, // Urdu
    bho: { translation: en }, // Bhojpuri
    gu: { translation: en }, // Gujarati
    kn: { translation: en }, // Kannada
    ml: { translation: en }, // Malayalam
    or: { translation: en }, // Odia
    pa: { translation: en }, // Punjabi
    as: { translation: en }, // Assamese
    ks: { translation: en }, // Kashmiri
    kok: { translation: en }, // Konkani
    sd: { translation: en }, // Sindhi
    doi: { translation: en }, // Dogri
    mai: { translation: en }, // Maithili
    sat: { translation: en }, // Santali
    ne: { translation: en }, // Nepali
    sa: { translation: en }, // Sanskrit
    mni: { translation: en }, // Manipuri
    bhb: { translation: en }, // Bhili
    gon: { translation: en }, // Gondi
    kru: { translation: en }, // Kurukh
    tcy: { translation: en }, // Tulu
    khn: { translation: en }, // Khandeshi
    // Global Languages
    es: { translation: en },
    fr: { translation: en },
    de: { translation: en },
    it: { translation: en },
    pt: { translation: en },
    ru: { translation: en },
    zh: { translation: en },
    ja: { translation: en },
    ko: { translation: en },
    ar: { translation: en },
    tr: { translation: en },
    vi: { translation: en },
    th: { translation: en },
    nl: { translation: en },
    pl: { translation: en },
    sv: { translation: en },
    id: { translation: en },
    ms: { translation: en },
    tl: { translation: en }, // Filipino
    he: { translation: en }, // Hebrew
    fa: { translation: en },
    sw: { translation: en },
    uk: { translation: en }
};

// Safe Auto-Detect: Use system language if supported, else English
// We specifically do NOT auto-set region-based logic to avoid issues (e.g. Hyderabad -> Telugu)
const systemLanguage = Localization.getLocales()[0]?.languageCode;
const defaultLanguage = (systemLanguage && resources[systemLanguage]) ? systemLanguage : 'en';

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources,
        lng: defaultLanguage, // Use system language as safe default
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false
        }
    });

// Load saved language asynchronously (overrides system default if user explicitly chose one)
LanguageService.getLanguage().then(lang => {
    if (lang) {
        i18n.changeLanguage(lang);
    }
});

export default i18n;
