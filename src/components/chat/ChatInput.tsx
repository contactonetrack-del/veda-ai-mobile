/**
 * Chat Input Component
 * Extracted from ChatScreen for maintainability
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatInputProps {
    input: string;
    onInputChange: (text: string) => void;
    onSend: () => void;
    onMicPress: () => void;
    isRecording: boolean;
    loading: boolean;
    placeholder: string;
    colors: any;
    useSearch: boolean;
    onToggleSearch: () => void;
}

export default function ChatInput({
    input,
    onInputChange,
    onSend,
    onMicPress,
    isRecording,
    loading,
    placeholder,
    colors,
    useSearch,
    onToggleSearch,
}: ChatInputProps) {
    const canSend = input.trim() && !isRecording && !loading;

    return (
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={input}
                    onChangeText={onInputChange}
                    placeholder={placeholder}
                    placeholderTextColor={colors.subtext}
                    multiline
                    maxLength={1000}
                />
            </View>

            {/* Web Search Toggle */}
            <TouchableOpacity
                style={[
                    styles.micButtonWrapper,
                    useSearch && { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }
                ]}
                onPress={onToggleSearch}
                disabled={loading}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={useSearch ? "globe" : "globe-outline"}
                    size={22}
                    color={useSearch ? "#3B82F6" : "#475569"}
                />
            </TouchableOpacity>

            {/* Microphone Button */}
            <TouchableOpacity
                style={[
                    styles.micButtonWrapper,
                    isRecording && styles.micButtonRecording
                ]}
                onPress={onMicPress}
                disabled={loading}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={isRecording ? "stop-circle" : "mic-outline"}
                    size={22}
                    color={isRecording ? "#fff" : "#10B981"}
                />
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity
                style={styles.sendButtonWrapper}
                onPress={onSend}
                disabled={!canSend}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={canSend ? ['#3B82F6', '#1D4ED8'] : ['#1E293B', '#1E293B']}
                    style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                >
                    <Ionicons name="arrow-up" size={20} color={canSend ? '#fff' : '#475569'} />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingBottom: 24,
        borderTopWidth: 1,
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 44,
        maxHeight: 120,
    },
    input: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
        maxHeight: 100,
    },
    micButtonWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButtonRecording: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },
    sendButtonWrapper: {
        width: 44,
        height: 44,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});
