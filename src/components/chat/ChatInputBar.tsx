import React, { useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    Animated,
    Keyboard,
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadows } from '../../config/colors';
import { borderRadius, spacing, touchTarget } from '../../config/spacing';
import { duration, easing } from '../../config/animations';
import WaveformVisualizer from './WaveformVisualizer';
import SuggestionsCarousel from './SuggestionsCarousel';
import MarkdownToolbar from './MarkdownToolbar';


export interface Attachment {
    id: string;
    uri: string;
    type: 'image' | 'video' | 'file';
    name?: string;
}

interface ChatInputBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onMicPress: () => void;
    isLoading: boolean;
    isRecording: boolean;
    onAttachPress?: () => void;
    suggestions?: { id: string; text: string }[];
    onSuggestionSelect?: (text: string) => void;
    attachments?: Attachment[];
    onRemoveAttachment?: (id: string) => void;
}

export default function ChatInputBar({
    value,
    onChangeText,
    onSend,
    onMicPress,
    isLoading,
    isRecording,
    onAttachPress,
    suggestions = [],
    onSuggestionSelect,
    attachments = [],
    onRemoveAttachment,
}: ChatInputBarProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const hasText = value.trim().length > 0;

    // Animation values
    const sendButtonScale = useRef(new Animated.Value(0)).current;
    const sendButtonOpacity = useRef(new Animated.Value(0)).current;
    const recordingPulse = useRef(new Animated.Value(1)).current;
    const capsuleBorderAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [selection, setSelection] = React.useState({ start: 0, end: 0 });


    // Animate send button appearance
    useEffect(() => {
        Animated.parallel([
            Animated.spring(sendButtonScale, {
                toValue: hasText ? 1 : 0,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.timing(sendButtonOpacity, {
                toValue: hasText ? 1 : 0,
                duration: duration.fast,
                useNativeDriver: true,
            }),
        ]).start();
    }, [hasText]);

    // Recording pulse animation
    useEffect(() => {
        if (isRecording) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(recordingPulse, {
                        toValue: 1.1,
                        duration: 500,
                        easing: easing.easeInOut,
                        useNativeDriver: true,
                    }),
                    Animated.timing(recordingPulse, {
                        toValue: 1,
                        duration: 500,
                        easing: easing.easeInOut,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();

            // Animate border
            Animated.timing(capsuleBorderAnim, {
                toValue: 1,
                duration: duration.fast,
                useNativeDriver: false,
            }).start();

            return () => pulse.stop();
        } else {
            Animated.timing(capsuleBorderAnim, {
                toValue: 0,
                duration: duration.fast,
                useNativeDriver: false,
            }).start();
        }
    }, [isRecording]);

    const handleSend = () => {
        if (hasText && !isLoading && !isRecording) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Keyboard.dismiss();
            onSend();
        }
    };

    const handleMicPress = () => {
        Haptics.impactAsync(
            isRecording
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light
        );
        onMicPress();
    };

    const handleAttachPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAttachPress?.();
    };

    // Markdown formatting handlers
    const handleFormat = (prefix: string, suffix: string) => {
        const before = value.substring(0, selection.start);
        const selected = value.substring(selection.start, selection.end);
        const after = value.substring(selection.end);

        const newText = before + prefix + (selected || 'text') + suffix + after;
        onChangeText(newText);

        // Move cursor after the formatted text
        const newPos = selection.start + prefix.length + (selected || 'text').length + suffix.length;
        setTimeout(() => {
            setSelection({ start: newPos, end: newPos });
        }, 50);
    };

    const handleInsert = (text: string) => {
        const before = value.substring(0, selection.start);
        const after = value.substring(selection.end);
        const newText = before + text + after;
        onChangeText(newText);

        const newPos = selection.start + text.length;
        setTimeout(() => {
            setSelection({ start: newPos, end: newPos });
        }, 50);
    };


    const borderColor = capsuleBorderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', colors.error],
    });

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
            }
        ]}>
            {/* Suggestions Carousel */}
            {suggestions.length > 0 && onSuggestionSelect && (
                <SuggestionsCarousel
                    suggestions={suggestions}
                    onSelect={onSuggestionSelect}
                    visible={!isRecording && !hasText}
                />
            )}

            {/* Markdown Toolbar */}
            <MarkdownToolbar
                visible={isFocused && !isRecording}
                onFormat={handleFormat}
                onInsert={handleInsert}
            />


            {/* Attachment Preview Container */}
            {attachments.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.attachmentList}
                >
                    {attachments.map(item => (
                        <View key={item.id} style={[styles.attachmentItem, { backgroundColor: colors.card }]}>
                            {item.type === 'image' ? (
                                <Image source={{ uri: item.uri }} style={styles.attachmentThumb} />
                            ) : (
                                <Ionicons name="document-text" size={24} color={colors.primary} />
                            )}
                            <TouchableOpacity
                                style={styles.removeAttachment}
                                onPress={() => onRemoveAttachment?.(item.id)}
                            >
                                <Ionicons name="close-circle" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}

            <View style={styles.inputRow}>
                {/* Left Plus Button */}
                <TouchableOpacity
                    style={[
                        styles.plusButton,
                        {
                            backgroundColor: isDark ? colors.card : colors.inputBg,
                            borderColor: isDark ? colors.cardBorder : 'transparent',
                        },
                        shadows.sm,
                    ]}
                    onPress={handleAttachPress}
                    activeOpacity={0.7}
                    accessibilityLabel="Attach file or media"
                    accessibilityRole="button"
                >
                    <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>

                {/* Input Capsule */}
                <Animated.View style={[
                    styles.capsule,
                    {
                        backgroundColor: isDark ? colors.inputBg : '#F0F0F0',
                        borderColor: borderColor,
                        borderWidth: 1.5,
                    },
                    shadows.sm,
                ]}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                maxHeight: 120,
                            }
                        ]}
                        placeholder={isRecording ? "Listening..." : "Message VEDA..."}
                        placeholderTextColor={isRecording ? colors.error : colors.placeholder || colors.subtext}
                        value={value}
                        onChangeText={onChangeText}
                        multiline
                        returnKeyType="default"
                        blurOnSubmit={false}
                        editable={!isLoading && !isRecording}
                        accessibilityLabel="Chat input field"
                        accessibilityHint="Type your message here to chat with VEDA AI"
                        ref={inputRef}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                        selection={selection}
                    />


                    {/* Waveform Overlay during Recording */}
                    {isRecording && (
                        <View style={styles.waveformOverlay} importantForAccessibility="no-hide-descendants">
                            <WaveformVisualizer isActive={isRecording} />
                        </View>
                    )}

                    <View style={styles.rightActions}>
                        {/* Mic Button */}
                        <Animated.View style={{ transform: [{ scale: recordingPulse }] }}>
                            <TouchableOpacity
                                onPress={handleMicPress}
                                style={[
                                    styles.micButton,
                                    isRecording && {
                                        backgroundColor: `${colors.error}20`,
                                    },
                                ]}
                                activeOpacity={0.7}
                                accessibilityLabel={isRecording ? "Stop recording" : "Voice input"}
                                accessibilityRole="button"
                                accessibilityHint={isRecording ? "Tap to finish recording your message" : "Tap to speak your message"}
                            >
                                <Ionicons
                                    name={isRecording ? "stop-circle" : "mic-outline"}
                                    size={22}
                                    color={isRecording ? colors.error : colors.subtext}
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Send Button */}
                        <Animated.View
                            style={{
                                transform: [{ scale: sendButtonScale }],
                                opacity: sendButtonOpacity,
                            }}
                        >
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={isLoading || !hasText}
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: colors.primary,
                                        opacity: isLoading ? 0.7 : 1,
                                    },
                                ]}
                                activeOpacity={0.8}
                                accessibilityLabel="Send message"
                                accessibilityRole="button"
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Ionicons name="arrow-up" size={18} color="#FFF" />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingVertical: spacing[2],
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing[4],
        gap: spacing[3],
    },
    attachmentList: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[2],
        gap: spacing[2],
    },
    attachmentItem: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    attachmentThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeAttachment: {
        position: 'absolute',
        top: -8,
        right: -8,
        zIndex: 1,
    },
    plusButton: {
        width: touchTarget.md,
        height: touchTarget.md,
        borderRadius: touchTarget.md / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginBottom: 2,
    },
    capsule: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius['2xl'],
        paddingVertical: spacing[2],
        paddingLeft: spacing[4],
        paddingRight: spacing[2],
        minHeight: 52,
    },
    waveformOverlay: {
        position: 'absolute',
        left: 0,
        right: 50,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: spacing[1],
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        marginRight: spacing[2],
        lineHeight: 22,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
    },
    micButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
