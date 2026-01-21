import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadows } from '../../config/colors';
import { borderRadius, spacing, touchTarget } from '../../config/spacing';
import { duration, easing } from '../../config/animations';
import { VoiceVisualizer } from './VoiceVisualizer';
import SuggestionsCarousel from './SuggestionsCarousel';


import { GlassView } from '../common/GlassView';


import { Attachment } from '../../types/chat';

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
    audioLevel?: number;
    useSearch?: boolean;
    onToggleSearch?: () => void;
    replyTo?: any;
    onCancelReply?: () => void;
}

const ChatInputBar = forwardRef<TextInput, ChatInputBarProps>(({
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
    audioLevel = 0,
    useSearch = false,
    onToggleSearch,
    replyTo,
    onCancelReply,
}, ref) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const hasText = value.trim().length > 0;

    // Animation values
    const sendButtonOpacity = useRef(new Animated.Value(hasText ? 1 : 0.5)).current;
    const recordingPulse = useRef(new Animated.Value(1)).current;
    const capsuleBorderAnim = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    useImperativeHandle(ref, () => inputRef.current as TextInput);


    // Animate send button opacity (Active/Inactive)
    useEffect(() => {
        Animated.timing(sendButtonOpacity, {
            toValue: hasText ? 1 : 0.5,
            duration: duration.fast,
            useNativeDriver: true,
        }).start();
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

            {/* Reply Preview */}
            {replyTo && (
                <View style={[styles.replyPreview, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={styles.replyContent}>
                        <Text style={[styles.replyTitle, { color: colors.primary }]}>Replying to</Text>
                        <Text numberOfLines={1} style={[styles.replyText, { color: colors.subtext }]}>
                            {replyTo.content}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onCancelReply} style={styles.cancelReply}>
                        <Ionicons name="close-circle" size={20} color={colors.subtext} />
                    </TouchableOpacity>
                </View>
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

                {/* Input Capsule with Glass Effect - Simplified to View to fix input issues */}
                <Animated.View style={[
                    styles.capsuleContainer,
                    {
                        borderColor: borderColor,
                        borderWidth: 1.5,
                        borderRadius: borderRadius['2xl'],
                        backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)',
                    },
                    shadows.sm,
                ]}>
                    <View
                        style={styles.glassCapsule}
                    >
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
                        />


                        {/* Waveform Overlay during Recording */}
                        {isRecording && (
                            <View style={styles.waveformOverlay} importantForAccessibility="no-hide-descendants">
                                <VoiceVisualizer visible={isRecording} level={audioLevel} />
                            </View>
                        )}

                        {/* Web Search Toggle */}
                        <TouchableOpacity
                            onPress={onToggleSearch}
                            style={[
                                styles.micButton,
                                useSearch && {
                                    backgroundColor: `${colors.primary}20`,
                                },
                            ]}
                            activeOpacity={0.7}
                            accessibilityLabel="Toggle web search"
                            accessibilityRole="button"
                        >
                            <Ionicons
                                name={useSearch ? "globe" : "globe-outline"}
                                size={22}
                                color={useSearch ? colors.primary : colors.subtext}
                            />
                        </TouchableOpacity>

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

                            {/* Send Button - Always Visible, Opacity Change */}
                            <Animated.View
                                style={{
                                    opacity: sendButtonOpacity,
                                    width: 34,
                                    marginLeft: 8,
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
                    </View>
                </Animated.View>
            </View>
        </View>
    );
});

export default ChatInputBar;

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
        paddingVertical: spacing[3],
        gap: spacing[3],
    },
    attachmentItem: {
        width: 72,
        height: 72,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        overflow: 'hidden',
    },
    attachmentThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removeAttachment: {
        position: 'absolute',
        top: -6,
        right: -6,
        zIndex: 10,
        backgroundColor: '#020617',
        borderRadius: 10,
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
    capsuleContainer: {
        flex: 1,
        borderRadius: borderRadius['2xl'],
        minHeight: 52,
    },
    glassCapsule: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[3], // Increased padding
        paddingLeft: spacing[4],
        paddingRight: spacing[2],
        width: '100%',
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
        flexShrink: 1,
        fontSize: 16,
        paddingVertical: Platform.OS === 'ios' ? spacing[3] : spacing[2], // Increased padding for better visibility
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        marginRight: spacing[2],
        lineHeight: 24, // increased line height
        paddingBottom: spacing[3], // Explicit bottom padding
        minHeight: 48, // Increased minHeight to prevent collapse
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        flexShrink: 0,
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
    replyPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        marginHorizontal: spacing[4],
        marginBottom: spacing[2],
        borderRadius: borderRadius.lg,
        gap: spacing[2],
    },
    replyContent: {
        flex: 1,
    },
    replyTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    replyText: {
        fontSize: 14,
    },
    cancelReply: {
        padding: 4,
    },
});
