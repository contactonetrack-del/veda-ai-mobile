
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

const LANGUAGE_KEY = 'APP_LANGUAGE';

export const LANGUAGES = [
    // Indian Languages
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', category: 'Indian' },
    { code: 'en', name: 'English', nativeName: 'English', category: 'Indian' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', category: 'Indian' },
    { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', category: 'Indian' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', category: 'Indian' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', category: 'Indian' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', category: 'Indian' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', category: 'Indian' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', category: 'Indian' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', category: 'Indian' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', category: 'Indian' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', category: 'Indian' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', category: 'Indian' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', category: 'Indian' },
    { code: 'bhb', name: 'Bhili', nativeName: 'भीली', category: 'Indian' },
    { code: 'gon', name: 'Gondi', nativeName: 'गोंडी', category: 'Indian' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', category: 'Indian' },
    { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', category: 'Indian' },
    { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / كأشُر', category: 'Indian' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', category: 'Indian' },
    { code: 'sd', name: 'Sindhi', nativeName: 'सिंधी / سنڌي', category: 'Indian' },
    { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', category: 'Indian' },
    { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', category: 'Indian' },
    { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯩꯇꯩꯂꯣꯟ', category: 'Indian' },
    { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख़', category: 'Indian' },
    { code: 'tcy', name: 'Tulu', nativeName: 'ತುಳು', category: 'Indian' },
    { code: 'khn', name: 'Khandeshi', nativeName: 'अहिराणी', category: 'Indian' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', category: 'Indian' },

    // Global Languages
    { code: 'en', name: 'English', nativeName: 'English', category: 'Global' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', category: 'Global' },
    { code: 'fr', name: 'French', nativeName: 'Français', category: 'Global' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', category: 'Global' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', category: 'Global' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', category: 'Global' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', category: 'Global' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', category: 'Global' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', category: 'Global' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', category: 'Global' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', category: 'Global' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', category: 'Global' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', category: 'Global' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', category: 'Global' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', category: 'Global' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', category: 'Global' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', category: 'Global' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', category: 'Global' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', category: 'Global' },
    { code: 'tl', name: 'Filipino', nativeName: 'Filipino', category: 'Global' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', category: 'Global' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', category: 'Global' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', category: 'Global' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', category: 'Global' }
];

class LanguageService {
    async getLanguage(): Promise<string> {
        try {
            const language = await AsyncStorage.getItem(LANGUAGE_KEY);
            return language || 'en';
        } catch (error) {
            console.error('Error getting language:', error);
            return 'en';
        }
    }

    async setLanguage(languageCode: string): Promise<boolean> {
        try {
            // Check if supported
            if (LANGUAGES.some(l => l.code === languageCode)) {
                await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
                await i18next.changeLanguage(languageCode);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error setting language:', error);
            return false;
        }
    }
}

export default new LanguageService();
