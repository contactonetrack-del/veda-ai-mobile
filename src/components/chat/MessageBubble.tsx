/**
 * Message Bubble Component
 * Extracted from ChatScreen for maintainability
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import * as Haptics from 'expo-haptics';
import { SourcesCitation, AgentBadge } from '../SourcesCitation';

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

interface MessageBubbleProps {
    message: Message;
    isSpeaking: boolean;
    onSpeakPress: () => void;
    colors: any;
    isDark: boolean;
    markdownStyles: any;
}

export default function MessageBubble({
    message,
    isSpeaking,
    onSpeakPress,
    colors,
    isDark,
    markdownStyles,
}: MessageBubbleProps) {
    const isUser = message.role === 'user';

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isUser) {
        return (
            <View style={styles.userMessageContainer}>
                <View style={styles.userCard}>
                    <LinearGradient
                        colors={['#1D4ED8', '#1E40AF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.userHeader}
                    >
                        <Text style={styles.userTimestamp}>{formatTime(message.timestamp)}</Text>
                        <Text style={styles.userName}>You</Text>
                        <View style={styles.userIconContainer}>
                            <Ionicons name="person" size={12} color="#fff" />
                        </View>
                    </LinearGradient>
                    <View style={styles.userContent}>
                        <Text style={styles.userMessageText}>{message.content}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.aiMessageContainer}>
            <View style={[styles.aiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.aiHeader, { backgroundColor: colors.inputBg, borderBottomColor: colors.cardBorder }]}>
                    <View style={[styles.aiIconContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.2)' }]}>
                        <MaterialCommunityIcons name="meditation" size={14} color={colors.primary} />
                    </View>
                    <Text style={[styles.aiName, { color: colors.text }]}>VEDA AI</Text>
                    {message.agentUsed && (
                        <AgentBadge agent={message.agentUsed} intent={message.intent} />
                    )}
                    <View style={{ flex: 1 }} />
                    <Text style={[styles.aiTimestamp, { color: colors.subtext }]}>{formatTime(message.timestamp)}</Text>
                </View>
                <View style={[styles.aiContent, { backgroundColor: colors.card }]}>
                    <Markdown style={markdownStyles}>
                        {message.content}
                    </Markdown>
                    {message.sources && message.sources.length > 0 && (
                        <SourcesCitation
                            sources={message.sources}
                            verified={message.verified}
                            confidence={message.confidence}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.voiceButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onSpeakPress();
                        }}
                    >
                        <Ionicons
                            name={isSpeaking ? "stop-circle" : "volume-high-outline"}
                            size={18}
                            color={isSpeaking ? "#10B981" : "#94A3B8"}
                        />
                        {isSpeaking && (
                            <Text style={styles.speakingText}>Speaking...</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    userMessageContainer: { alignItems: 'flex-end', marginBottom: 16, paddingLeft: 40 },
    userCard: {
        backgroundColor: '#1E3A8A',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    userTimestamp: { fontSize: 10, color: 'rgba(255,255,255,0.6)', flex: 1 },
    userName: { fontSize: 13, fontWeight: '600', color: '#fff', marginRight: 8 },
    userIconContainer: {
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userContent: { paddingHorizontal: 14, paddingVertical: 12 },
    userMessageText: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
    aiMessageContainer: { marginBottom: 16, paddingRight: 40 },
    aiCard: {
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    aiIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    aiName: { fontSize: 13, fontWeight: '600' },
    aiTimestamp: { fontSize: 10 },
    aiContent: { paddingHorizontal: 14, paddingVertical: 12 },
    voiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(148, 163, 184, 0.2)',
    },
    speakingText: {
        fontSize: 11,
        color: '#10B981',
        marginLeft: 6,
    },
});
