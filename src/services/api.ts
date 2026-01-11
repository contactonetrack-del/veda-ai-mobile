/**
 * VEDA AI Mobile - API Client
 * Connects to the FastAPI backend on Render
 * Supports multilingual responses including Bhojpuri (Beta)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Production backend URL
// Local backend URL (Physical Device & Emulator)
// Production backend URL (Render)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://veda-ai-backend-ql2b.onrender.com';
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
    userId: string = 'guest',
    mode: 'auto' | 'study' | 'research' | 'analyze' | 'wellness' | 'search' | 'protection' = 'auto',
    style: 'auto' | 'fast' | 'planning' = 'auto',
    languageCode: LanguageCode = 'en'
): Promise<OrchestratorResponse> {
    try {
        let contextMessage = message;
        if (languageCode !== 'en') {
            const langName = SUPPORTED_LANGUAGES[languageCode].name;
            contextMessage = `[Response Language: ${langName}] ${message}`;
        }

        const response = await authFetch(`${API_V1}/orchestrator/query`, {
            method: 'POST',
            body: JSON.stringify({
                message: contextMessage,
                user_id: userId,
                context: {},
                mode: mode,
                style: style
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


// Supported Languages (Zone-wise)
// Supported Languages (Zone-wise)
export const SUPPORTED_LANGUAGES = {
    // English (Default)
    en: { name: 'English', zone: 'Global', flag: '🌐' },
    // North Zone (UP-Bihar Region)
    hi: { name: 'हिंदी', zone: 'North', flag: '🇮🇳' },
    bho: { name: 'भोजपुरी (Beta)', zone: 'North', flag: '🇮🇳' },
    pa: { name: 'ਪੰਜਾਬੀ (Punjabi)', zone: 'North', flag: '🇮🇳' },
    ur: { name: 'اردو (Urdu)', zone: 'North', flag: '🇮🇳' },
    ne: { name: 'नेपाली (Nepali)', zone: 'North', flag: '🇳🇵' },
    ks: { name: 'कॉशुर (Kashmiri)', zone: 'North', flag: '🇮🇳' },
    sd: { name: 'سنڌي (Sindhi)', zone: 'North', flag: '🇮🇳' },
    doi: { name: 'डोगरी (Dogri)', zone: 'North', flag: '🇮🇳' },
    mai: { name: 'मैथिली (Maithili)', zone: 'North', flag: '🇮🇳' },
    sat: { name: 'संताली (Santali)', zone: 'North', flag: '🇮🇳' },
    // South Zone
    ta: { name: 'தமிழ்', zone: 'South', flag: '🇮🇳' },
    te: { name: 'తెలుగు', zone: 'South', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ', zone: 'South', flag: '🇮🇳' },
    ml: { name: 'മലയാളം', zone: 'South', flag: '🇮🇳' },
    // East Zone
    bn: { name: 'বাংলা', zone: 'East', flag: '🇮🇳' },
    or: { name: 'ଓଡ଼ିଆ', zone: 'East', flag: '🇮🇳' },
    as: { name: 'অসমীয়া (Assamese)', zone: 'East', flag: '🇮🇳' },
    mni: { name: 'মৈতৈলোন (Manipuri)', zone: 'East', flag: '🇮🇳' },
    brx: { name: 'बड़ो (Bodo)', zone: 'East', flag: '🇮🇳' },
    // West Zone
    mr: { name: 'मराठी', zone: 'West', flag: '🇮🇳' },
    gu: { name: 'ગુજરાતી', zone: 'West', flag: '🇮🇳' },
    kok: { name: 'कोंकणी (Konkani)', zone: 'West', flag: '🇮🇳' },
    // Tribal
    gon: { name: 'गोंडी (Gondi)', zone: 'Tribal', flag: '🇮🇳' },
    hne: { name: 'छत्तीसगढ़ी (Chhattisgarhi)', zone: 'Tribal', flag: '🇮🇳' },
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export async function sendGuestMessage(message: string, languageCode: LanguageCode = 'en'): Promise<string> {
    try {
        // Use the backend orchestrator for guest chats too!
        // This ensures they get the same intelligence and we hide API keys.
        // We prepend context about the language if needed.

        let contextMessage = message;
        if (languageCode !== 'en') {
            const langName = SUPPORTED_LANGUAGES[languageCode].name;
            contextMessage = `[Response Language: ${langName}] ${message}`;
        }

        const result = await sendOrchestratedMessage(contextMessage, "guest");

        if (result.success) {
            return result.response;
        } else {
            throw new Error(result.error || "Failed to get response");
        }

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

// ==================== LOCAL AI API (Zero-Cost Local Models) ====================

interface LocalLLMOptions {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    reasoningMode?: boolean;
}

/**
 * Query local LLM (zero-cost, runs on Ollama)
 */
export async function queryLocalLLM(
    prompt: string,
    modelType: string = 'reasoning',
    options: LocalLLMOptions = {}
) {
    const response = await authFetch(`${API_V1}/local-llm/query`, {
        method: 'POST',
        body: JSON.stringify({
            prompt,
            model_type: modelType,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000,
            system_prompt: options.systemPrompt || null,
            reasoning_mode: options.reasoningMode || false
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Local LLM query failed');
    }

    return response.json();
}

/**
 * Get local LLM status
 */
export async function getLocalLLMStatus() {
    const response = await authFetch(`${API_V1}/local-llm/status`);
    return response.json();
}

// ==================== ADVANCED REASONING API ====================

/**
 * Use advanced reasoning for complex problems
 */
export async function advancedReasoning(
    query: string,
    method: string = 'auto',
    context: string | null = null
) {
    const response = await authFetch(`${API_V1}/reasoning/query`, {
        method: 'POST',
        body: JSON.stringify({
            query,
            method,
            context,
            num_attempts: 3,
            num_paths: 3
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Reasoning query failed');
    }

    return response.json();
}

/**
 * Get available reasoning methods
 */
export async function getReasoningMethods() {
    const response = await authFetch(`${API_V1}/reasoning/methods`);
    return response.json();
}

// ==================== KNOWLEDGE BASE & RAG API ====================

interface KnowledgeQueryOptions {
    collection?: string;
    numContexts?: number;
    modelType?: string;
    includeSources?: boolean;
}

/**
 * Query knowledge base with RAG
 */
export async function queryKnowledge(query: string, options: KnowledgeQueryOptions = {}) {
    const response = await authFetch(`${API_V1}/knowledge/query`, {
        method: 'POST',
        body: JSON.stringify({
            query,
            collection: options.collection || null,
            num_contexts: options.numContexts || 3,
            model_type: options.modelType || 'reasoning',
            include_sources: options.includeSources !== false
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Knowledge query failed');
    }

    return response.json();
}

/**
 * Search knowledge base
 */
export async function searchKnowledge(query: string, limit: number = 5) {
    const response = await authFetch(`${API_V1}/knowledge/search`, {
        method: 'POST',
        body: JSON.stringify({ query, limit }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Knowledge search failed');
    }

    return response.json();
}

/**
 * Get knowledge base status
 */
export async function getKnowledgeStatus() {
    const response = await authFetch(`${API_V1}/knowledge/status`);
    return response.json();
}

// ==================== DOMAIN EXPERTS API ====================

interface ExpertQueryOptions {
    useReasoning?: boolean;
    reasoningMethod?: string;
    context?: string;
}

/**
 * Query a domain expert
 */
export async function queryExpert(
    query: string,
    expert: string | null = null,
    options: ExpertQueryOptions = {}
) {
    const response = await authFetch(`${API_V1}/experts/query`, {
        method: 'POST',
        body: JSON.stringify({
            query,
            expert,
            use_reasoning: options.useReasoning || false,
            reasoning_method: options.reasoningMethod || 'auto',
            context: options.context || null
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Expert query failed');
    }

    return response.json();
}

/**
 * List all domain experts
 */
export async function listExperts() {
    const response = await authFetch(`${API_V1}/experts/list`);
    return response.json();
}

// ==================== BROWSER AGENT API ====================

/**
 * Web search using browser agent
 */
export async function webSearch(query: string, numResults: number = 3) {
    const response = await authFetch(`${API_V1}/browser/search`, {
        method: 'POST',
        body: JSON.stringify({ query, num_results: numResults }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Web search failed');
    }

    return response.json();
}

/**
 * Get browser agent status
 */
export async function getBrowserStatus() {
    const response = await authFetch(`${API_V1}/browser/status`);
    return response.json();
}
