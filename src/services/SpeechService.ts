import * as Speech from 'expo-speech';

export type SupportedLanguage = 'en' | 'hi' | 'bho' | 'pa' | 'ur' | 'ne' | 'ks' | 'sd' | 'doi' | 'mai' | 'sat' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'or' | 'as' | 'mni' | 'brx' | 'mr' | 'gu' | 'kok' | 'gon' | 'hne';
export type VoiceGender = 'male' | 'female';

const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
    'en': 'en',
    'hi': 'hi',
    'bho': 'hi', // Bhojpuri fallback to Hindi
    'pa': 'pa',
    'ur': 'ur',
    'ne': 'ne',
    'ks': 'ks',
    'sd': 'sd',
    'doi': 'doi',
    'mai': 'hi',
    'sat': 'hi',
    'ta': 'ta',
    'te': 'te',
    'kn': 'kn',
    'ml': 'ml',
    'bn': 'bn',
    'or': 'or',
    'as': 'as',
    'mni': 'bn', // Manipuri fallback to Bengali script
    'brx': 'hi',
    'mr': 'mr',
    'gu': 'gu',
    'kok': 'mr', // Konkani fallback to Marathi
    'gon': 'hi',
    'hne': 'hi',
};

// Keywords to identify male voices
const MALE_KEYWORDS = ['male', 'man', 'masculine', 'deep', 'rishi', 'amit', 'arun', 'raj', 'prabhat'];
// Keywords to identify female voices  
const FEMALE_KEYWORDS = ['female', 'woman', 'feminine', 'lekha', 'priya', 'sunita', 'anu', 'swara', 'kavya'];

class SpeechService {
    private static instance: SpeechService;
    private isSpeakingInternal: boolean = false;
    private cachedVoices: Speech.Voice[] = [];
    private voicesLoaded: boolean = false;

    private constructor() { }

    public static getInstance(): SpeechService {
        if (!SpeechService.instance) {
            SpeechService.instance = new SpeechService();
        }
        return SpeechService.instance;
    }

    private async loadVoices(): Promise<void> {
        if (this.voicesLoaded) return;

        try {
            this.cachedVoices = await Speech.getAvailableVoicesAsync();
            this.voicesLoaded = true;
            // console.log(`✅ Loaded ${this.cachedVoices.length} TTS voices`);


            // Log available voices for debugging
            this.cachedVoices.forEach(v => {
                // console.log(`Voice: ${v.name} | ID: ${v.identifier} | Lang: ${v.language} | Quality: ${v.quality}`);

            });
        } catch (error) {
            console.error('❌ Error loading voices:', error);
        }
    }

    private findBestVoice(language: SupportedLanguage, gender: VoiceGender): Speech.Voice | null {
        const langCode = LANGUAGE_MAP[language];

        // Filter voices matching the language
        const languageVoices = this.cachedVoices.filter(v =>
            v.language.toLowerCase().startsWith(langCode.toLowerCase())
        );

        if (languageVoices.length === 0) {
            console.log(`⚠️ No voices found for language: ${langCode}`);
            return null;
        }

        console.log(`Found ${languageVoices.length} voices for ${langCode}`);

        const genderKeywords = gender === 'male' ? MALE_KEYWORDS : FEMALE_KEYWORDS;

        // Priority 1: Find Enhanced quality voice matching gender
        let bestVoice = languageVoices.find(v => {
            const name = (v.name || '').toLowerCase();
            const id = (v.identifier || '').toLowerCase();
            const isGenderMatch = genderKeywords.some(kw => name.includes(kw) || id.includes(kw));
            const isEnhanced = v.quality === 'Enhanced';
            return isGenderMatch && isEnhanced;
        });

        if (bestVoice) {
            // console.log(`✅ Found Enhanced ${gender} voice: ${bestVoice.name}`);

            return bestVoice;
        }

        // Priority 2: Find any voice matching gender
        bestVoice = languageVoices.find(v => {
            const name = (v.name || '').toLowerCase();
            const id = (v.identifier || '').toLowerCase();
            return genderKeywords.some(kw => name.includes(kw) || id.includes(kw));
        });

        if (bestVoice) {
            // console.log(`✅ Found ${gender} voice: ${bestVoice.name}`);

            return bestVoice;
        }

        // Priority 3: Find Enhanced quality voice (any gender)
        bestVoice = languageVoices.find(v => v.quality === 'Enhanced');
        if (bestVoice) {
            console.log(`⚠️ Using Enhanced voice (no gender match): ${bestVoice.name}`);
            return bestVoice;
        }

        // Priority 4: Return first available voice for language
        console.log(`⚠️ Using default voice for ${langCode}: ${languageVoices[0].name}`);
        return languageVoices[0];
    }

    public async speak(
        text: string,
        language: SupportedLanguage = 'en',
        gender: VoiceGender = 'female',
        rate: number = 0.95,
        pitch: number = 1.0,
        onDone?: () => void
    ): Promise<void> {
        if (this.isSpeakingInternal) {
            await this.stop();
        }

        // Ensure voices are loaded
        await this.loadVoices();

        const voice = this.findBestVoice(language, gender);
        const langCode = LANGUAGE_MAP[language] + '-IN';

        this.isSpeakingInternal = true;

        const options: Speech.SpeechOptions = {
            language: voice?.language || langCode,
            // Configurable settings
            pitch: pitch,
            rate: rate,
            onDone: () => {
                this.isSpeakingInternal = false;
                if (onDone) onDone();
            },
            onError: (error) => {
                console.error('❌ Speech error:', error);
                this.isSpeakingInternal = false;
                if (onDone) onDone();
            }
        };

        // Use specific voice if found
        if (voice?.identifier) {
            options.voice = voice.identifier;
            // console.log(`🔊 Speaking with voice: ${voice.name}`);

        } else {
            // Fallback: Adjust pitch only if no specific voice found AND pitch matches default
            // If user explicitly sent pitch (e.g. from Persona), use it
            if (pitch === 1.0) {
                options.pitch = gender === 'female' ? 1.15 : 0.85;
            }
            console.log(`🔊 Speaking with pitch adjustment (no specific voice)`);
        }

        Speech.speak(text, options);
    }

    public async stop(): Promise<void> {
        try {
            await Speech.stop();
        } catch (e) {
            // Ignore stop errors
        }
        this.isSpeakingInternal = false;
    }

    public isSpeaking(): boolean {
        return this.isSpeakingInternal;
    }

    public async getAvailableVoices(): Promise<Speech.Voice[]> {
        await this.loadVoices();
        return this.cachedVoices;
    }

    public async listVoicesForLanguage(language: SupportedLanguage): Promise<Speech.Voice[]> {
        await this.loadVoices();
        const langCode = LANGUAGE_MAP[language];
        return this.cachedVoices.filter(v =>
            v.language.toLowerCase().startsWith(langCode.toLowerCase())
        );
    }
}

export default SpeechService.getInstance();
