/**
 * Chat Screen - Ultra Premium ChatGPT-Style UI
 * Refactored for minimalism and component modularity
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
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
import { FlashList } from '@shopify/flash-list';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

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
import SkeletonBubble from '../components/chat/SkeletonBubble';
import SidebarDrawer from '../components/chat/SidebarDrawer';
import ReactionMenu from '../components/chat/ReactionMenu';
import { Attachment } from '../components/chat/ChatInputBar';
import Confetti, { ConfettiRef } from '../components/Confetti';
import { getContextualSuggestions } from '../services/SuggestionService';



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
    attachments?: Attachment[];
}

// Optimized wrapper to prevent re-renders
const MessageItem = React.memo(({
    item,
    index,
    messagesLength,
    isStreaming,
    onInteract,
    onDelete,
    onReply
}: {
    item: Message,
    index: number,
    messagesLength: number,
    isStreaming: boolean,
    onInteract: (msg: Message) => void,
    onDelete: (msg: Message) => void,
    onReply: (msg: Message) => void
}) => {
    // Memoize handlers for this specific item
    const handleInteract = useCallback(() => onInteract(item), [item, onInteract]);
    const handleDelete = useCallback(() => onDelete(item), [item, onDelete]);
    const handleReply = useCallback(() => onReply(item), [item, onReply]);

    return (
        <MessageBubble
            role={item.role}
            content={item.content}
            sources={item.sources}
            attachments={item.attachments}
            agentUsed={item.agentUsed}
            isLatest={index === messagesLength - 1}
            isTyping={isStreaming && index === messagesLength - 1}
            onInteract={handleInteract}
            onDelete={handleDelete}
            onReply={handleReply}
        />
    );
});

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
    const flashListRef = useRef<any>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<{ id: string, text: string }[]>([]);
    const confettiRef = useRef<ConfettiRef>(null);
    const [audioLevel, setAudioLevel] = useState(0);




    // Reaction Menu State
    const [activeMessage, setActiveMessage] = useState<Message | null>(null);
    const [showReactionMenu, setShowReactionMenu] = useState(false);

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

        // Smart keyboard handling
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            if (Platform.OS === 'android') {
                setKeyboardHeight(e.endCoordinates.height);
            }
            // Smoothly scroll to bottom when keyboard opens
            setTimeout(() => {
                flashListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        const hideSub = Keyboard.addListener(hideEvent, () => {
            if (Platform.OS === 'android') {
                setKeyboardHeight(0);
            }
        });

        return () => { showSub.remove(); hideSub.remove(); };
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
            timestamp: new Date(),
            attachments: [...attachments] // Clone current attachments
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAttachments([]); // Clear attachments after sending
        setLoading(true);
        setIsStreaming(false);
        await new Promise(r => setTimeout(r, 800));

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
                content: '', // Start empty for streaming
                timestamp: new Date(),
                sources: responseData.sources,
                agentUsed: responseData.agentUsed,
            };
            setMessages(prev => [...prev, aiMsg]);
            setLoading(false);
            setIsStreaming(true);

            // Simulate streaming effect
            const fullContent = responseData.response;
            let currentContent = '';
            const words = fullContent.split(' ');

            for (let i = 0; i < words.length; i++) {
                currentContent += (i === 0 ? '' : ' ') + words[i];

                // Update the last message
                await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
                setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0) {
                        newMessages[newMessages.length - 1].content = currentContent;
                    }
                    return newMessages;
                });

                // Subtle haptic every few words
                if (i % 4 === 0) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            }

            setIsStreaming(false);

            // Generate contextual suggestions after AI response
            const nextSuggestions = getContextualSuggestions(fullContent);
            setDynamicSuggestions(nextSuggestions);

            // Trigger confetti for high confidence or wellness triggers
            if (responseData.verified || fullContent.toLowerCase().includes('congratulations') || fullContent.toLowerCase().includes('great job')) {
                confettiRef.current?.trigger();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I'm having trouble connecting. Please try again.",
                timestamp: new Date()
            }]);
            setIsStreaming(false);
        } finally {
            setLoading(false);
        }
    }

    const handleVoiceInput = async () => {
        if (isRecording) {
            setIsRecording(false);
            VoiceInputService.setStatusUpdateListener(() => { }); // Clear listener
            const uri = await VoiceInputService.stopRecording();
            setAudioLevel(0);
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

                // Subscribe to audio levels
                VoiceInputService.setStatusUpdateListener((status) => {
                    if (status.metering !== undefined) {
                        // Normalize -60dB to 0dB range to 0-1
                        const db = status.metering;
                        const normalized = Math.min(Math.max((db + 60) / 60, 0), 1);
                        setAudioLevel(normalized);
                    }
                });
            }
        }
    };

    const handleNewChat = () => {
        setMessages([]); // Clear messages to show Empty State
    };

    const handleContextDocumentSelect = (doc: any) => {
        const newAttachment: Attachment = {
            id: Date.now().toString(),
            uri: doc.id ? `kb://${doc.id}` : 'kb://unknown',
            type: 'file',
            name: doc.source ? `Ref: ${doc.source.substring(0, 20)}...` : 'Knowledge Context',
        };
        setAttachments(prev => [...prev, newAttachment]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Optional: Auto-populate input if empty
        if (!input.trim()) {
            setInput(`Using context from "${doc.source || 'document'}": `);
        }
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

    const handleMessageInteract = (message: Message) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setActiveMessage(message);
        setShowReactionMenu(true);
    };

    const handleReactionSelect = (reaction: string) => {
        // In a real app, update the message with the reaction in backend/state
        // In a real app, update the message with the reaction in backend/state
        // For demo, maybe show a toast or just close
    };

    const handleActionSelect = (action: 'copy' | 'reply' | 'regenerate' | 'delete') => {
        if (!activeMessage) return;

        switch (action) {
            case 'copy':
                import('react-native').then(({ Clipboard }) => {
                    Clipboard.setString(activeMessage.content);
                });
                break;
            case 'reply':
                setInput(`Replying to: "${activeMessage.content.substring(0, 50)}..." `);
                break;
            case 'regenerate':
                if (activeMessage.role === 'assistant') {
                    // Logic to regenerate
                    // Logic to regenerate
                }
                break;
            case 'delete':
                setMessages(prev => prev.filter(m => m.id !== activeMessage.id));
                break;
        }
    };

    const handleAttachPress = async () => {
        Alert.alert(
            'Attach',
            'Select attachment type:',
            [
                {
                    text: 'Photo Library',
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsMultipleSelection: true,
                            selectionLimit: 5,
                            quality: 0.8,
                        });

                        if (!result.canceled && result.assets && result.assets.length > 0) {
                            const newAttachments: Attachment[] = result.assets.map(asset => ({
                                id: Date.now().toString() + Math.random().toString(),
                                uri: asset.uri,
                                type: 'image',
                                name: asset.fileName || 'Image',
                            }));
                            setAttachments(prev => [...prev, ...newAttachments]);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                    }
                },
                {
                    text: 'Document (PDF)',
                    onPress: async () => {
                        try {
                            const result = await DocumentPicker.getDocumentAsync({
                                type: 'application/pdf',
                                copyToCacheDirectory: true,
                                multiple: true
                            });

                            if (!result.canceled && result.assets) {
                                const newAttachments: Attachment[] = result.assets.map(asset => ({
                                    id: Date.now().toString() + Math.random().toString(),
                                    uri: asset.uri,
                                    type: 'file',
                                    name: asset.name || 'Document.pdf',
                                }));
                                setAttachments(prev => [...prev, ...newAttachments]);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }
                        } catch (err) {
                            console.log('Doc picker error', err);
                        }
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    const handleRemoveAttachment = (id: string) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSuggestionSelect = (text: string) => {
        setInput(text);
        setShowAllSuggestions(false);
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
                onSelectContextDocument={handleContextDocumentSelect}
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
                <View style={[styles.messageList, { flex: 1 }]}>
                    <FlashList
                        ref={flashListRef}
                        data={messages}
                        renderItem={({ item, index }) => (
                            <MessageItem
                                item={item}
                                index={index}
                                messagesLength={messages.length}
                                isStreaming={isStreaming}
                                onInteract={handleMessageInteract}
                                onDelete={(msg: Message) => {
                                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                }}
                                onReply={(msg: Message) => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setInput(`Replying to: "${msg.content.substring(0, 50)}..." `);
                                }}
                            />
                        )}
                        // @ts-ignore
                        estimatedItemSize={150}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}
                        onContentSizeChange={() => flashListRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={loading ? <SkeletonBubble /> : null}
                        extraData={[isStreaming, messages.length]} // Ensure updates when these change
                    />
                </View>
            )
            }


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
                    attachments={attachments}
                    onRemoveAttachment={handleRemoveAttachment}
                    onAttachPress={handleAttachPress}
                    suggestions={messages.length === 0
                        ? SUGGESTED_ACTIONS.map(a => ({ id: a.label, text: a.prompt }))
                        : dynamicSuggestions
                    }
                    onSuggestionSelect={handleSuggestionSelect}
                    audioLevel={audioLevel}
                />
            </KeyboardAvoidingView>

            <Confetti ref={confettiRef} />


            {/* Hidden Voice Settings for now, accessed via Sidebar later or Header logic */}
            <VoiceSettingsModal
                visible={showVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
                currentSettings={voiceSettings}
                onSave={setVoiceSettings}
            />

            <ReactionMenu
                visible={showReactionMenu}
                onClose={() => setShowReactionMenu(false)}
                onReactionSelect={handleReactionSelect}
                onActionSelect={handleActionSelect}
                messageContent={activeMessage?.content}
            />
        </View >
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
