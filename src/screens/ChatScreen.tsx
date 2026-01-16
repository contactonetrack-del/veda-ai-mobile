/**
 * Chat Screen - Ultra Premium ChatGPT-Style UI
 * Refactored for minimalism and component modularity
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    Modal,
    ScrollView,
    Keyboard,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpeechService from '../services/SpeechService';
import VoiceInputService from '../services/VoiceInputService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import VoiceSettingsModal, { VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../components/VoiceSettingsModal';
import { useNavigation } from '@react-navigation/native';

// New Components
import ChatHeader from '../components/chat/ChatHeader';
import ChatInputBar from '../components/chat/ChatInputBar';
import MessageBubble from '../components/chat/MessageBubble';
import SidebarDrawer from '../components/chat/SidebarDrawer';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    sources?: any[];
    agentUsed?: string;
    intent?: string;
    verified?: boolean;
    confidence?: number;
}

export default function ChatScreen({ onLogout }: { onLogout: () => void }) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [guestCount, setGuestCount] = useState(0);
    const { language: selectedLanguage, setLanguage, t } = useLanguage();
    const { colors, isDark } = useTheme();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    // Removed duplicates
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    const SUGGESTED_ACTIONS = [
        { icon: 'image-outline', label: 'Create image', prompt: 'Create an image of a futuristic city', color: '#10A37F' },
        { icon: 'eye-outline', label: 'Analyze images', prompt: 'Analyze this image for me', color: '#3B82F6' },
        { icon: 'document-text-outline', label: 'Summarize text', prompt: 'Summarize this text', color: '#F59E0B' },
        { icon: 'bulb-outline', label: 'Make a plan', prompt: 'Make a plan for a weekend trip', color: '#8B5CF6' },
        { icon: 'pencil-outline', label: 'Help me write', prompt: 'Help me write a professional email', color: '#EC4899' },
        { icon: 'code-slash-outline', label: 'Code', prompt: 'Write a Python script to scrape a website', color: '#6366F1' },
        { icon: 'school-outline', label: 'Get advice', prompt: 'Give me career advice', color: '#14B8A6' },
        { icon: 'gift-outline', label: 'Surprise me', prompt: 'Tell me a fun fact', color: '#EF4444' }
    ];

    const displayedSuggestions = showAllSuggestions ? SUGGESTED_ACTIONS : SUGGESTED_ACTIONS.slice(0, 3);

    // Kept for API compatibility, but hidden from UI mostly in this minimal version
    const [selectedMode, setSelectedMode] = useState<'auto'>('auto');
    const conversationStyle = 'auto';

    const isGuest = user?.id === 'guest';
    const guestLimit = 5;
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);

    // Welcome Message Logic
    const getWelcomeMessage = (lang: LanguageCode, gender: 'male' | 'female'): string => {
        // Simplified welcome for clean UI
        const greetings = {
            en: "Namaste! I'm VEDA AI. How can I help you with your wellness journey today?",
            hi: "नमस्ते! मैं VEDA AI हूँ। आज मैं आपकी स्वास्थ्य यात्रा में कैसे मदद कर सकती हूँ?",
            // ... fallback to English for others to save space/time, can expand later
        };
        return greetings[lang as keyof typeof greetings] || greetings.en;
    };

    // Initial empty state (no welcome message) to show "What can I help with?"
    // useEffect(() => { ... }, []); // Removed to support empty state UI


    // Preferences & Keyboard
    useEffect(() => {
        AsyncStorage.getItem('voiceSettings').then(saved => {
            if (saved) setVoiceSettings(JSON.parse(saved));
        });

        if (Platform.OS === 'android') {
            const showSub = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
            const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
            return () => { showSub.remove(); hideSub.remove(); };
        }
    }, []);

    // Save voice settings
    useEffect(() => {
        AsyncStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
    }, [voiceSettings]);

    async function handleSend() {
        if (!input.trim()) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isGuest && guestCount >= guestLimit) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Guest limit reached. Please sign up to continue!",
                timestamp: new Date()
            }]);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        if (currentlySpeaking) {
            SpeechService.stop();
            setCurrentlySpeaking(null);
        }

        try {
            let responseData;
            if (isGuest) {
                const text = await api.sendGuestMessage(userMsg.content, selectedLanguage);
                responseData = { response: text, sources: [], agentUsed: 'Guest', intent: 'chat', verified: false, confidence: 1 };
                setGuestCount(p => p + 1);
            } else {
                responseData = await api.sendOrchestratedMessage(userMsg.content, user?.id, selectedMode, conversationStyle, selectedLanguage);
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseData.response,
                timestamp: new Date(),
                sources: responseData.sources,
                agentUsed: responseData.agentUsed,
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I'm having trouble connecting. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }

    const handleVoiceInput = async () => {
        if (isRecording) {
            setIsRecording(false);
            const uri = await VoiceInputService.stopRecording();
            if (uri) {
                setInput('Transcribing...');
                const text = await VoiceInputService.transcribeAudio(uri, selectedLanguage);
                setInput(text || '');
            }
        } else {
            const started = await VoiceInputService.startRecording();
            if (started) {
                setIsRecording(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        }
    };

    const handleNewChat = () => {
        setMessages([]); // Clear messages to show Empty State
    };

    const handleLoadChat = async (chatId: string) => {
        try {
            setLoading(true);
            setIsSidebarOpen(false);
            const messages = await api.getChatMessages(chatId);
            setMessages(messages.map((m: any) => ({
                id: m.id || Date.now().toString(),
                role: m.role,
                content: m.content,
                timestamp: new Date(m.created_at || Date.now()),
                sources: m.sources,
                agentUsed: m.agent_used
            })));
        } catch (error) {
            Alert.alert("Error", "Failed to load chat history");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <ChatHeader
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onNewChat={handleNewChat}
                currentModel={selectedMode === 'auto' ? 'VEDA Auto' : selectedMode}
            />

            <SidebarDrawer
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNewChat={handleNewChat}
                onSelectChat={handleLoadChat}
            />

            {messages.length === 0 ? (
                <ScrollView contentContainerStyle={styles.emptyContainer}>

                    <Text style={[styles.emptyTitle, { color: colors.text }]}>What can I help with?</Text>

                    <View style={styles.suggestionsGrid}>
                        {displayedSuggestions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.suggestionItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                                onPress={() => setInput(action.prompt)}
                            >
                                <Ionicons name={action.icon as any} size={20} color={action.color} />
                                <Text style={[styles.suggestionText, { color: colors.subtext }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}

                        {!showAllSuggestions && (
                            <TouchableOpacity
                                style={[styles.suggestionItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setShowAllSuggestions(true);
                                }}
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color={colors.subtext} />
                                <Text style={[styles.suggestionText, { color: colors.subtext }]}>More</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => (
                        <MessageBubble
                            role={item.role}
                            content={item.content}
                            sources={item.sources}
                            agentUsed={item.agentUsed}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ChatInputBar
                    value={input}
                    onChangeText={setInput}
                    onSend={handleSend}
                    onMicPress={handleVoiceInput}
                    isLoading={loading}
                    isRecording={isRecording}
                />
            </KeyboardAvoidingView>

            {/* Hidden Voice Settings for now, accessed via Sidebar later or Header logic */}
            <VoiceSettingsModal
                visible={showVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
                currentSettings={voiceSettings}
                onSave={setVoiceSettings}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageList: {
        paddingVertical: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    // Modal Styles (simplified for this file, ideally shared)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    // spacer: { flex: 1 }, // Removed
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
