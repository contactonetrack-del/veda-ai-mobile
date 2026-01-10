/**
 * VEDA AI Mobile - API Client
 * Connects to the FastAPI backend on Render
 * Supports multilingual responses including Bhojpuri (Beta)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Production backend URL
const API_BASE_URL = 'https://veda-ai-backend-ql2b.onrender.com';
const API_V1 = `${API_BASE_URL}/api/v1`;

// Token storage keys
const TOKEN_KEY = 'veda_auth_token';
const USER_KEY = 'veda_user';

// Helper to get stored token
async function getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
}

// Helper to make authenticated requests
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

// ==================== AUTH ====================

export async function signup(email: string, password: string, name?: string) {
    const response = await fetch(`${API_V1}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
    }

    const data = await response.json();

    if (data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
    }
    if (data.user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
}

export async function login(email: string, password: string) {
    const response = await fetch(`${API_V1}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();

    if (data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, data.access_token);
    }
    if (data.user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
}

export async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
}

export async function getCurrentUser() {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

export async function isAuthenticated(): Promise<boolean> {
    const token = await getToken();
    return token !== null;
}

// ==================== CHATS ====================

export async function getChats() {
    const response = await authFetch(`${API_V1}/chats/`);

    if (!response.ok) {
        throw new Error('Failed to fetch chats');
    }

    return response.json();
}

export async function createChat(title: string) {
    const response = await authFetch(`${API_V1}/chats/`, {
        method: 'POST',
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        throw new Error('Failed to create chat');
    }

    return response.json();
}

export async function getChatMessages(chatId: string) {
    const response = await authFetch(`${API_V1}/chats/${chatId}/messages`);

    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }

    return response.json();
}

export async function sendMessage(chatId: string, content: string) {
    const response = await authFetch(`${API_V1}/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}

// ==================== ORCHESTRATOR API (Phase 1: Perplexity-class) ====================

interface SourceInfo {
    title: string;
    url: string;
    favicon?: string;
    source_type?: string;
}

interface OrchestratorResponse {
    response: string;
    intent: string;
    agentUsed: string;
    sources: SourceInfo[];
    reviewed: boolean;
    contextUsed: boolean;
    verified: boolean;
    confidence: number;
    timestamp: string;
    success: boolean;
    error?: string;
}

/**
 * Send message through the multi-agent orchestrator.
 * Uses backend AI with web search capabilities.
 */
export async function sendOrchestratedMessage(
    message: string,
    userId: string = 'guest'
): Promise<OrchestratorResponse> {
    try {
        const response = await authFetch(`${API_V1}/orchestrator/query`, {
            method: 'POST',
            body: JSON.stringify({
                message,
                user_id: userId,
                context: {}
            }),
        });

        if (!response.ok) {
            throw new Error('Orchestrator request failed');
        }

        const data = await response.json();

        return {
            response: data.response,
            intent: data.intent,
            agentUsed: data.agent_used,
            sources: data.sources || [],
            reviewed: data.reviewed,
            contextUsed: data.context_used,
            verified: data.verified || false,
            confidence: data.confidence || 0.0,
            timestamp: data.timestamp,
            success: true
        };
    } catch (error) {
        console.error('[Orchestrator] Error:', error);
        return {
            response: "I'm having trouble processing your request. Please try again.",
            intent: 'error',
            agentUsed: '',
            sources: [],
            reviewed: false,
            contextUsed: false,
            verified: false,
            confidence: 0.0,
            timestamp: new Date().toISOString(),
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get orchestrator status and available agents.
 */
export async function getOrchestratorStatus() {
    try {
        const response = await fetch(`${API_V1}/orchestrator/status`);
        return response.json();
    } catch (error) {
        console.error('[Orchestrator] Status check failed:', error);
        return { status: 'unavailable', error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ==================== GUEST MODE ====================

// API key loaded from environment variable (set in .env file)
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

// Supported Languages (Zone-wise)
export const SUPPORTED_LANGUAGES = {
    // English (Default)
    en: { name: 'English', zone: 'Global', flag: '🌐' },
    // North Zone (UP-Bihar Region)
    hi: { name: 'हिंदी', zone: 'North', flag: '🇮🇳' },
    bho: { name: 'भोजपुरी (Beta)', zone: 'North', flag: '🇮🇳' },
    // South Zone
    ta: { name: 'தமிழ்', zone: 'South', flag: '🇮🇳' },
    te: { name: 'తెలుగు', zone: 'South', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ', zone: 'South', flag: '🇮🇳' },
    ml: { name: 'മലയാളം', zone: 'South', flag: '🇮🇳' },
    // East Zone
    bn: { name: 'বাংলা', zone: 'East', flag: '🇮🇳' },
    or: { name: 'ଓଡ଼ିଆ', zone: 'East', flag: '🇮🇳' },
    // West Zone
    mr: { name: 'मराठी', zone: 'West', flag: '🇮🇳' },
    gu: { name: 'ગુજરાતી', zone: 'West', flag: '🇮🇳' },
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export async function sendGuestMessage(message: string, languageCode: LanguageCode = 'en'): Promise<string> {
    const lang = SUPPORTED_LANGUAGES[languageCode];

    // Special prompt for Bhojpuri (Beta) - Pure language, family-friendly
    // Used in North Bihar, Eastern UP, Jharkhand regions
    const bhojpuriPrompt = `तू VEDA AI बाड़ऽ, भोजपुरी बोलेवाला लोग खातिर वेलनेस साथी।

भाषा के नियम:
- खाली शुद्ध भोजपुरी में जवाब देबऽ
- हिंदी या अंग्रेजी मिलाइब नाहीं
- देवनागरी लिपि में लिखबऽ
- गारी-गलौज बिल्कुल ना करबऽ
- सम्मानजनक भाषा बोलबऽ

शैली:
- छोट आ सीधा जवाब देबऽ
- **बोल्ड** में जरूरी बात लिखबऽ
- बिंदुवार लिखबऽ

विशेषज्ञता:
- भोजपुरी खान-पान (लिट्टी-चोखा, सत्तू, ठेकुआ, चूड़ा-दही)
- योग आ प्राणायाम
- आयुर्वेद के घरेलू नुस्खा
- स्वास्थ्य बीमा के जानकारी

हमेशा शुद्ध भोजपुरी में जवाब देबऽ। हर बार "प्रणाम" या "जय हो" मत बोलबऽ - सीधा जवाब देबऽ।`;

    // Standard prompt for other languages
    const standardPrompt = `You are VEDA AI, a premium wellness companion for Indian users.

RESPONSE LANGUAGE: ${lang.name} (${languageCode})
You MUST respond entirely in ${lang.name}. Use native script, not transliteration.

YOUR STYLE:
- **Premium & Professional:** Clear, elegant language in ${lang.name}.
- **Short & Crisp:** Use bullet points, avoid long paragraphs.
- **Natural Conversation:** Do NOT start every response with greetings like "Namaste". Only greet when contextually appropriate. Jump straight to helpful content.
- **Visual Formatting:** Use **Bold** for key terms, lists for steps.

EXPERTISE:
- Indian Nutrition (Roti, Dal, Ghee, regional foods)
- Yoga (Asanas, Pranayama)
- Ayurveda (Doshas, traditional remedies)
- Health Insurance (IRDAI guidelines)

Respond naturally in ${lang.name} with native script.`;

    const systemPrompt = languageCode === 'bho' ? bhojpuriPrompt : standardPrompt;

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Groq API Error:', error);
            throw new Error('Service busy. Please try again.');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No response generated.";

    } catch (error) {
        console.error('Guest Chat Error:', error);
        if (languageCode === 'bho') {
            return "माफ करीं, थोड़ी देर बाद फिर से कोशिश करीं।";
        } else if (languageCode === 'hi') {
            return "क्षमा करें, कृपया थोड़ी देर बाद पुनः प्रयास करें।";
        }
        return "Please try again in a moment.";
    }
}

// ==================== HEALTH CHECK ====================

export async function healthCheck(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
