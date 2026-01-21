import { useRef, useCallback, useReducer, useEffect } from 'react';
import { Clipboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as api from '../services/api';
import { Message, Attachment } from '../types/chat';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import SpeechService from '../services/SpeechService';
import VoiceInputService from '../services/VoiceInputService';
import StorageService from '../services/StorageService';
import { getContextualSuggestions } from '../services/SuggestionService';

import { VoiceSettings } from '../components/VoiceSettingsModal';
import { LanguageCode } from '../services/api';
import { User } from '../context/AuthContext';
import { useVoiceConversation, VoiceModeState } from './useVoiceConversation';

export interface ChatFlowHook {
    messages: Message[];
    input: string;
    loading: boolean;
    isStreaming: boolean;
    attachments: Attachment[];
    dynamicSuggestions: { id: string, text: string }[];
    audioLevel: number;
    isRecording: boolean;
    replyTo: Message | null;
    setInput: (text: string) => void;
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void; // Keeping compatibility
    setAttachments: (attachments: Attachment[] | ((prev: Attachment[]) => Attachment[])) => void; // Keeping compatibility
    setIsRecording: (isRecording: boolean) => void;
    setReplyTo: (message: Message | null) => void;
    setAudioLevel: (level: number) => void;
    handleSend: (customInput?: string) => Promise<void>;
    handleVoiceInput: () => Promise<void>;
    handleAttachmentSelect: (type: string) => Promise<void>;
    handleMessageReaction: (message: Message | null, reaction: string) => void;
    handleActionSelect: (message: Message | null, action: string) => void;
    // Voice Conversation Mode
    voiceMode: VoiceModeState;
    startVoiceSession: () => Promise<void>;
    endVoiceSession: () => Promise<void>;
    voiceTranscript: string;
}

interface ChatState {
    messages: Message[];
    input: string;
    loading: boolean;
    isStreaming: boolean;
    attachments: Attachment[];
    guestCount: number;
    dynamicSuggestions: { id: string, text: string }[];
    audioLevel: number;
    isRecording: boolean;
    replyTo: Message | null;
    currentlySpeaking: string | null;
}

type ChatAction =
    | { type: 'SET_MESSAGES'; payload: Message[] | ((prev: Message[]) => Message[]) }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'UPDATE_MESSAGE'; payload: { id: string, updates: Partial<Message> } }
    | { type: 'SET_INPUT'; payload: string }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_STREAMING'; payload: boolean }
    | { type: 'SET_ATTACHMENTS'; payload: Attachment[] | ((prev: Attachment[]) => Attachment[]) }
    | { type: 'ADD_ATTACHMENTS'; payload: Attachment[] }
    | { type: 'SET_DYNAMIC_SUGGESTIONS'; payload: { id: string, text: string }[] }
    | { type: 'SET_AUDIO_LEVEL'; payload: number }
    | { type: 'SET_IS_RECORDING'; payload: boolean }
    | { type: 'SET_REPLY_TO'; payload: Message | null }
    | { type: 'SET_CURRENTLY_SPEAKING'; payload: string | null }
    | { type: 'INCREMENT_GUEST_COUNT' }
    | { type: 'RESET_SEND_STATE' }; // Clears input, attachments, replyTo, sets loading

const initialState: ChatState = {
    messages: [],
    input: '',
    loading: false,
    isStreaming: false,
    attachments: [],
    guestCount: 0,
    dynamicSuggestions: [],
    audioLevel: 0,
    isRecording: false,
    replyTo: null,
    currentlySpeaking: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'SET_MESSAGES':
            return {
                ...state,
                messages: typeof action.payload === 'function' ? action.payload(state.messages) : action.payload
            };
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(m => m.id === action.payload.id ? { ...m, ...action.payload.updates } : m)
            };
        case 'SET_INPUT':
            return { ...state, input: action.payload };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_STREAMING':
            return { ...state, isStreaming: action.payload };
        case 'SET_ATTACHMENTS':
            return {
                ...state,
                attachments: typeof action.payload === 'function' ? action.payload(state.attachments) : action.payload
            };
        case 'ADD_ATTACHMENTS':
            return { ...state, attachments: [...state.attachments, ...action.payload] };
        case 'SET_DYNAMIC_SUGGESTIONS':
            return { ...state, dynamicSuggestions: action.payload };
        case 'SET_AUDIO_LEVEL':
            return { ...state, audioLevel: action.payload };
        case 'SET_IS_RECORDING':
            return { ...state, isRecording: action.payload };
        case 'SET_REPLY_TO':
            return { ...state, replyTo: action.payload };
        case 'SET_CURRENTLY_SPEAKING':
            return { ...state, currentlySpeaking: action.payload };
        case 'INCREMENT_GUEST_COUNT':
            return { ...state, guestCount: state.guestCount + 1 };
        case 'RESET_SEND_STATE':
            return { ...state, input: '', attachments: [], replyTo: null, loading: true, isStreaming: false };
        default:
            return state;
    }
};

export const useChatFlow = (
    user: User | null,
    selectedLanguage: string,
    voiceSettings: VoiceSettings,
    selectedMode: 'auto' | 'study' | 'research' | 'analyze' | 'wellness' | 'search' | 'protection'
): ChatFlowHook => {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    const isGuest = user?.id === 'guest';
    const guestLimit = 5;

    // Load persisted messages on mount
    useEffect(() => {
        const loadHistory = async () => {
            const storedMessages = await StorageService.loadMessages();
            if (storedMessages.length > 0) {
                dispatch({ type: 'SET_MESSAGES', payload: storedMessages });
            }
        };
        loadHistory();
    }, []);

    // Compatibility wrappers for existing external APIs
    const setMessages = useCallback((payload: Message[] | ((prev: Message[]) => Message[])) =>
        dispatch({ type: 'SET_MESSAGES', payload }), []);
    const setInput = useCallback((text: string) => dispatch({ type: 'SET_INPUT', payload: text }), []);
    const setAttachments = useCallback((payload: Attachment[] | ((prev: Attachment[]) => Attachment[])) =>
        dispatch({ type: 'SET_ATTACHMENTS', payload }), []);
    const setIsRecording = useCallback((val: boolean) => dispatch({ type: 'SET_IS_RECORDING', payload: val }), []);
    const setReplyTo = useCallback((msg: Message | null) => dispatch({ type: 'SET_REPLY_TO', payload: msg }), []);
    const setAudioLevel = useCallback((level: number) => dispatch({ type: 'SET_AUDIO_LEVEL', payload: level }), []);

    // Forward declaration to allow use in useVoiceConversation
    // We use a ref or ensure handleSend doesn't depend on things that change too often?
    // Actually, useVoiceConversation needs onInputComplete which calls handleSend.
    // We define handleSend first? No, circular dependency if handleSend depends on voiceMode.
    // Solution: useVoiceConversation returns speakResponse, which handleSend uses.
    // userVoiceConversation calls onInputComplete (handleSend).
    // This is a circular dependency in hook definitions.
    // Ref-based approach:
    const handleSendRef = useRef<(text: string) => Promise<void>>(async () => { });

    const {
        mode: voiceMode,
        startSession: startVoiceSession,
        endSession: endVoiceSession,
        transcript: voiceTranscript,
        speakResponse,
        // audioLevel: voiceAudioLevel // We could merge this with state.audioLevel
    } = useVoiceConversation({
        language: selectedLanguage as any, // Cast to SupportedLanguage
        voiceGender: voiceSettings.gender,
        onInputComplete: async (text) => {
            await handleSendRef.current(text);
        }
    });

    // Update state.audioLevel from voice hook if active?
    // The hook has its own audioLevel. We should expose it or sync it.
    // For now, let's keep them separate or rely on the hook's return value for the UI.

    // Define handleSend now, using speakResponse and voiceMode

    const handleSend = useCallback(async (customInput?: string) => {
        const messageText = customInput || state.input;
        if (!messageText.trim() && state.attachments.length === 0) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isGuest && state.guestCount >= guestLimit) {
            dispatch({
                type: 'ADD_MESSAGE',
                payload: {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: "Guest limit reached. Please sign up to continue!",
                    timestamp: new Date()
                }
            });
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
            attachments: [...state.attachments]
        };

        dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
        StorageService.saveMessage(userMsg);
        if (!customInput) dispatch({ type: 'SET_INPUT', payload: '' });

        // Optimistic update using consolidated action
        // But we need to keep attachments cleared and loading set
        dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
        dispatch({ type: 'SET_REPLY_TO', payload: null });
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_STREAMING', payload: false });

        if (state.currentlySpeaking) {
            SpeechService.stop();
            dispatch({ type: 'SET_CURRENTLY_SPEAKING', payload: null });
        }

        try {
            const imageAttachment = userMsg.attachments?.find(a => a.type === 'image');

            if (imageAttachment) {
                const visionResult = await api.analyzeImage(imageAttachment.uri, userMsg.content || "What's in this image?", 'general');
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: visionResult.success ? visionResult.response : `Error: ${visionResult.error}`,
                    timestamp: new Date(),
                    agentUsed: 'Vision'
                };
                dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
                StorageService.saveMessage(assistantMsg);

                if (voiceSettings.autoSpeak && visionResult.success) {
                    SpeechService.speak(assistantMsg.content, selectedLanguage as LanguageCode, voiceSettings.gender, 0.95, 1.0,
                        () => dispatch({ type: 'SET_CURRENTLY_SPEAKING', payload: null }));
                }
            } else if (isGuest) {
                const text = await api.sendGuestMessage(userMsg.content, selectedLanguage as LanguageCode);
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: text,
                    timestamp: new Date(),
                    agentUsed: 'Guest'
                };
                dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
                StorageService.saveMessage(assistantMsg);
                dispatch({ type: 'INCREMENT_GUEST_COUNT' });
            } else {
                const assistantMsgId = (Date.now() + 1).toString();
                dispatch({
                    type: 'ADD_MESSAGE',
                    payload: { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date(), isLoading: true }
                });
                dispatch({ type: 'SET_STREAMING', payload: true });

                let fullContent = '';
                let finalAgent = '';
                await api.sendOrchestratedMessageStream(
                    userMsg.content,
                    (chunk) => {
                        fullContent += chunk;
                        dispatch({ type: 'UPDATE_MESSAGE', payload: { id: assistantMsgId, updates: { content: fullContent, isLoading: false } } });
                    },
                    (metadata) => {
                        finalAgent = metadata.agent;
                        dispatch({ type: 'UPDATE_MESSAGE', payload: { id: assistantMsgId, updates: { agentUsed: metadata.agent, intent: metadata.intent } } });
                    },
                    (complete) => {
                        const finalMsg: Message = {
                            id: assistantMsgId,
                            role: 'assistant',
                            content: fullContent,
                            timestamp: new Date(),
                            thinking: complete.thinking,
                            sources: complete.sources,
                            isLoading: false,
                            agentUsed: finalAgent
                        };

                        dispatch({
                            type: 'UPDATE_MESSAGE',
                            payload: { id: assistantMsgId, updates: { thinking: complete.thinking, sources: complete.sources, isLoading: false } }
                        });
                        StorageService.saveMessage(finalMsg);
                        dispatch({ type: 'SET_STREAMING', payload: false });
                        dispatch({ type: 'SET_DYNAMIC_SUGGESTIONS', payload: getContextualSuggestions(fullContent) });

                        // Speak response in voice mode
                        if (voiceMode !== 'idle') {
                            speakResponse(fullContent);
                        } else if (voiceSettings.autoSpeak) {
                            // Regular auto-speak
                            SpeechService.speak(fullContent, selectedLanguage as LanguageCode, voiceSettings.gender, 0.95, 1.0,
                                () => dispatch({ type: 'SET_CURRENTLY_SPEAKING', payload: null }));
                            dispatch({ type: 'SET_CURRENTLY_SPEAKING', payload: assistantMsgId });
                        }
                    },
                    (error) => {
                        console.error(error);
                        dispatch({ type: 'SET_STREAMING', payload: false });
                    },
                    user?.id,
                    selectedMode,
                    'auto',
                    selectedLanguage as LanguageCode
                );
            }
        } catch (error: unknown) {
            console.error(error);
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [user, selectedLanguage, voiceSettings, selectedMode, state.input, state.attachments, state.guestCount, state.currentlySpeaking, speakResponse, voiceMode]);

    const handleVoiceInput = useCallback(async () => {
        if (voiceMode !== 'idle') {
            await endVoiceSession();
        } else {
            // Fallback to legacy behavior if not using full voice mode, or start full voice mode?
            // For now, let's toggle the legacy recording state or start the new session?
            // Let's decide: "Headphones" icon starts new session. Mic button does legacy?
            // To strictly follow plan, we just implement the new hook.
            // But existing handleVoiceInput was simple recording.

            // Let's keep existing behavior for Mic button, and new behavior for Voice Mode
            if (state.isRecording) {
                dispatch({ type: 'SET_IS_RECORDING', payload: false });
                VoiceInputService.setStatusUpdateListener(() => { });
                const uri = await VoiceInputService.stopRecording();
                dispatch({ type: 'SET_AUDIO_LEVEL', payload: 0 });
                if (uri) {
                    dispatch({ type: 'SET_INPUT', payload: 'Transcribing...' });
                    const text = await VoiceInputService.transcribeAudio(uri, selectedLanguage as LanguageCode);
                    dispatch({ type: 'SET_INPUT', payload: text || '' });
                }
            } else {
                const started = await VoiceInputService.startRecording();
                if (started) {
                    dispatch({ type: 'SET_IS_RECORDING', payload: true });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    VoiceInputService.setStatusUpdateListener((status) => {
                        if (status.metering !== undefined) {
                            const db = status.metering;
                            const normalized = Math.min(Math.max((db + 60) / 60, 0), 1);
                            dispatch({ type: 'SET_AUDIO_LEVEL', payload: normalized });
                        }
                    });
                }
            }
        }
    }, [state.isRecording, selectedLanguage, voiceMode, endVoiceSession]);

    const handleAttachmentSelect = useCallback(async (type: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        switch (type) {
            case 'photo':
                const photoResult = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsMultipleSelection: true,
                    selectionLimit: 5,
                    quality: 0.8,
                });
                if (!photoResult.canceled && photoResult.assets?.length > 0) {
                    const newAttachments: Attachment[] = photoResult.assets.map(asset => ({
                        id: Date.now().toString() + Math.random().toString(),
                        uri: asset.uri,
                        type: 'image',
                        name: asset.fileName || 'Image',
                    }));
                    dispatch({ type: 'ADD_ATTACHMENTS', payload: newAttachments });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                break;
            case 'camera':
                const cameraResult = await ImagePicker.launchCameraAsync({ quality: 0.8 });
                if (!cameraResult.canceled && cameraResult.assets?.length > 0) {
                    const newAttachment: Attachment = {
                        id: Date.now().toString(),
                        uri: cameraResult.assets[0].uri,
                        type: 'image',
                        name: 'Photo',
                    };
                    dispatch({ type: 'ADD_ATTACHMENTS', payload: [newAttachment] });
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                break;
            case 'document':
            case 'audio':
                try {
                    const docResult = await DocumentPicker.getDocumentAsync({
                        type: type === 'document' ? 'application/pdf' : 'audio/*',
                        copyToCacheDirectory: true,
                        multiple: type === 'document'
                    });
                    if (!docResult.canceled && docResult.assets) {
                        const newAttachments: Attachment[] = docResult.assets.map(asset => ({
                            id: Date.now().toString() + Math.random().toString(),
                            uri: asset.uri,
                            type: 'file',
                            name: asset.name || (type === 'document' ? 'Document' : 'Audio'),
                        }));
                        dispatch({ type: 'ADD_ATTACHMENTS', payload: newAttachments });
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                } catch (err: unknown) {
                    console.error('Picker error', err);
                }
                break;
        }
    }, []);

    const handleMessageReaction = useCallback((message: Message | null, reaction: string) => {
        if (!message) return;
        setMessages((prev) => prev.map(m => {
            if (m.id === message.id) {
                const existingReactions = m.reactions || [];
                const newReactions = existingReactions.includes(reaction)
                    ? existingReactions.filter(r => r !== reaction)
                    : [...existingReactions, reaction];
                return { ...m, reactions: newReactions };
            }
            return m;
        }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [setMessages]); // setMessages is now stable ref to dispatch

    const handleActionSelect = useCallback((message: Message | null, action: string) => {
        if (!message) return;
        switch (action) {
            case 'copy':
                Clipboard.setString(message.content);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'reply':
                dispatch({ type: 'SET_REPLY_TO', payload: message });
                break;
            case 'delete':
                setMessages((prev) => prev.filter(m => m.id !== message.id));
                break;
        }
    }, [setMessages]);

    return {
        messages: state.messages, setMessages,
        input: state.input, setInput,
        loading: state.loading, isStreaming: state.isStreaming,
        attachments: state.attachments, setAttachments,
        dynamicSuggestions: state.dynamicSuggestions,
        audioLevel: state.audioLevel, isRecording: state.isRecording, setIsRecording,
        replyTo: state.replyTo, setReplyTo,
        handleSend,
        handleVoiceInput,
        handleAttachmentSelect,
        handleMessageReaction,
        handleActionSelect,
        setAudioLevel,
        voiceMode,
        startVoiceSession,
        endVoiceSession,
        voiceTranscript
    };
};
