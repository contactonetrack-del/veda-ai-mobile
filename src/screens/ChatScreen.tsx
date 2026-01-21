/**
 * Chat Screen - Ultra Premium ChatGPT-Style UI
 * Refactored for minimalism and high modularity
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// Modular Components
import ChatHeader from '../components/chat/ChatHeader';
import ChatInputBar from '../components/chat/ChatInputBar';
import SidebarDrawer from '../components/chat/SidebarDrawer';
import ReactionMenu from '../components/chat/ReactionMenu';
import AttachmentModal from '../components/chat/AttachmentModal';
import Confetti, { ConfettiRef } from '../components/Confetti';
import VoiceSettingsModal, { DEFAULT_VOICE_SETTINGS } from '../components/VoiceSettingsModal';
import MessageList from '../components/chat/MessageList';
import ChatEmptyState from '../components/chat/ChatEmptyState';
import { AsyncBoundary } from '../components/common/AsyncBoundary';
import { VoiceModeModal } from '../components/voice/VoiceModeModal';

// Hooks & Types
import { useChatFlow, ChatFlowHook } from '../hooks/useChatFlow';
import { Message, Attachment } from '../types/chat';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'> & {
    onLogout?: () => void;
};

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'> & {
    onLogout: () => void;
};

export default function ChatScreen({ navigation, onLogout }: ChatScreenProps) {
    const { user } = useAuth();
    const { language: selectedLanguage } = useLanguage();
    const { colors, isDark } = useTheme();

    // UI Local State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);
    const [showReactionMenu, setShowReactionMenu] = useState(false);
    const [activeMessage, setActiveMessage] = useState<Message | null>(null);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const [voiceSettings, setVoiceSettings] = useState(DEFAULT_VOICE_SETTINGS);

    const flashListRef = useRef<any>(null);
    const inputRef = useRef<TextInput>(null);
    const confettiRef = useRef<ConfettiRef>(null);

    // Business Logic Hook
    const {
        messages, setMessages,
        input, setInput,
        loading, isStreaming,
        attachments, setAttachments,
        dynamicSuggestions,
        audioLevel, isRecording,
        replyTo, setReplyTo,
        handleSend,
        handleVoiceInput,
        handleAttachmentSelect,
        handleMessageReaction,
        handleActionSelect,
        voiceMode,
        startVoiceSession,
        endVoiceSession,
        voiceTranscript
    }: ChatFlowHook = useChatFlow(user, selectedLanguage, voiceSettings, 'auto');

    // Track API errors for AsyncBoundary
    const [apiError, setApiError] = useState<Error | null>(null);

    const SUGGESTED_ACTIONS: { icon: keyof typeof Ionicons.glyphMap, label: string, prompt: string, color: string }[] = [
        { icon: 'image-outline', label: 'Create image', prompt: 'Create an image of a futuristic city', color: '#10A37F' },
        { icon: 'eye-outline', label: 'Analyze images', prompt: 'Analyze this image for me', color: '#3B82F6' },
        { icon: 'document-text-outline', label: 'Summarize text', prompt: 'Summarize this text', color: '#F59E0B' },
        { icon: 'bulb-outline', label: 'Make a plan', prompt: 'Make a plan for a weekend trip', color: '#8B5CF6' },
        { icon: 'pencil-outline', label: 'Help me write', prompt: 'Help me write a professional email', color: '#EC4899' },
        { icon: 'code-slash-outline', label: 'Code', prompt: 'Write a Python script to scrape a website', color: '#6366F1' },
    ];

    const displayedSuggestions = showAllSuggestions ? SUGGESTED_ACTIONS : SUGGESTED_ACTIONS.slice(0, 3);

    const onMessageInteract = (msg: Message) => {
        setActiveMessage(msg);
        setShowReactionMenu(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <ChatHeader
                onOpenSidebar={() => setIsSidebarOpen(true)}
                onNewChat={() => setMessages([])}
                currentModel="VEDA Auto"
                onStartVoice={startVoiceSession}
            />

            <SidebarDrawer
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onNewChat={() => { setMessages([]); setIsSidebarOpen(false); }}
                onSelectChat={() => { }} // Integration pending
                onSelectContextDocument={() => { }}
            />

            <AsyncBoundary
                isLoading={loading && messages.length === 0}
                error={apiError}
                onRetry={() => {
                    setApiError(null);
                    // Retry last send if there was an error
                    if (input) handleSend();
                }}
                loadingMessage="Starting conversation..."
                errorMessage="Failed to connect to VEDA AI"
            >
                {messages.length === 0 ? (
                    <ChatEmptyState
                        suggestions={SUGGESTED_ACTIONS}
                        displayedSuggestions={displayedSuggestions}
                        showAllSuggestions={showAllSuggestions}
                        setShowAllSuggestions={setShowAllSuggestions}
                        onSuggestionPress={setInput}
                    />
                ) : (
                    <MessageList
                        messages={messages}
                        flashListRef={flashListRef}
                        isStreaming={isStreaming}
                        loading={loading}
                        onMessageDelete={(msg) => setMessages((prev: Message[]) => prev.filter((m: Message) => m.id !== msg.id))}
                        onMessageReply={(msg) => {
                            setReplyTo(msg);
                            inputRef.current?.focus();
                        }}
                        onMessageReaction={(msg, emoji) => handleMessageReaction(msg, emoji)}
                        onMessageLongPress={onMessageInteract}
                    />
                )}
            </AsyncBoundary>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ChatInputBar
                    ref={inputRef}
                    value={input}
                    onChangeText={setInput}
                    onSend={() => handleSend()}
                    onMicPress={handleVoiceInput}
                    isLoading={loading}
                    isRecording={isRecording}
                    onAttachPress={() => setShowAttachmentModal(true)}
                    suggestions={messages.length === 0
                        ? SUGGESTED_ACTIONS.map(a => ({ id: a.label, text: a.prompt }))
                        : dynamicSuggestions
                    }
                    onSuggestionSelect={setInput}
                    attachments={attachments}
                    onRemoveAttachment={(id) => setAttachments((prev: Attachment[]) => prev.filter((a: Attachment) => a.id !== id))}
                    audioLevel={audioLevel}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
            </KeyboardAvoidingView>

            <Confetti ref={confettiRef} />

            <VoiceSettingsModal
                visible={showVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
                currentSettings={voiceSettings}
                onSave={setVoiceSettings}
            />

            <ReactionMenu
                visible={showReactionMenu}
                onClose={() => setShowReactionMenu(false)}
                onReactionSelect={(r) => handleMessageReaction(activeMessage, r)}
                onActionSelect={(a) => handleActionSelect(activeMessage, a)}
                messageContent={activeMessage?.content}
            />

            <AttachmentModal
                visible={showAttachmentModal}
                onClose={() => setShowAttachmentModal(false)}
                onSelect={handleAttachmentSelect}
            />

            <VoiceModeModal
                visible={voiceMode !== 'idle'}
                onClose={endVoiceSession}
                mode={voiceMode}
                audioLevel={audioLevel}
                transcript={voiceTranscript}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
