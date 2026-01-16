import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onMicPress: () => void;
    isLoading: boolean;
    isRecording: boolean;
}

export default function ChatInputBar({
    value,
    onChangeText,
    onSend,
    onMicPress,
    isLoading,
    isRecording
}: ChatInputBarProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const hasText = value.trim().length > 0;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
            }
        ]}>
            {/* Left Plus Button */}
            <TouchableOpacity
                style={[styles.plusButton, { backgroundColor: colors.card, borderColor: colors.inputBorder }]}
                onPress={() => { /* Handle attachments */ }}
            >
                <Ionicons name="add" size={24} color={colors.text} />
            </TouchableOpacity>

            {/* Input Capsule */}
            <View style={[
                styles.capsule,
                {
                    backgroundColor: colors.inputBg,
                    borderColor: isRecording ? colors.error : 'transparent',
                    borderWidth: isRecording ? 1 : 0
                }
            ]}>
                <TextInput
                    style={[styles.input, { color: colors.text, maxHeight: 100 }]}
                    placeholder={isRecording ? "Listening..." : "Message VEDA..."}
                    placeholderTextColor={colors.subtext}
                    value={value}
                    onChangeText={onChangeText}
                    multiline
                    returnKeyType="send"
                    onSubmitEditing={() => {
                        if (hasText && !isLoading && !isRecording) onSend();
                    }}
                    blurOnSubmit={true}
                />

                <View style={styles.rightActions}>
                    {/* Mic / Waveform */}
                    <TouchableOpacity onPress={onMicPress}>
                        <Ionicons
                            name={isRecording ? "stop-circle" : "mic"}
                            size={22}
                            color={isRecording ? colors.error : colors.text}
                        />
                    </TouchableOpacity>

                    {/* Send Button (only if text) */}
                    {hasText && (
                        <TouchableOpacity
                            onPress={onSend}
                            disabled={isLoading}
                            style={[styles.sendButton, { backgroundColor: colors.primary }]}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="arrow-up" size={18} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    plusButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginBottom: 2, // Align with capsule
    },
    capsule: {
        flex: 1, // Take remaining width
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 26,
        paddingVertical: 8,
        paddingLeft: 16,
        paddingRight: 8,
        minHeight: 52,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        marginRight: 8,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingRight: 4,
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
