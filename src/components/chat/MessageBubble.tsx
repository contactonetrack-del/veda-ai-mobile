import React, { useEffect, useRef, memo } from 'react';
import { View, StyleSheet, Animated as RNAnimated, Clipboard, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { SourcesCitation } from '../SourcesCitation';
import { spacing, borderRadius } from '../../config';
import ThinkingBubble from './ThinkingBubble';
import { AiMetadata } from './AiMetadata';
import { MessageAttachments } from './MessageAttachments';
import { LeftSwipeAction, RightSwipeActions, MessageFooterActions } from './MessageActions';
import { MarkdownContent } from './MarkdownContent';
import { Attachment, MessageSource } from '../../types/chat';
import { ReactionsList } from './ReactionsList';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    sources?: MessageSource[];
    attachments?: Attachment[];
    agentUsed?: string;
    isLatest?: boolean;
    isTyping?: boolean;
    onCopy?: () => void;
    onRegenerate?: () => void;
    onReply?: () => void;
    onDelete?: () => void;
    onReaction?: (emoji: string) => void;
    onLongPress?: () => void;
    reactions?: string[];
    thinking?: string;
    thinkingLevel?: 'low' | 'medium' | 'high';
    provider?: string;
}

const MessageBubble = ({
    role,
    content,
    sources,
    attachments,
    agentUsed,
    isLatest = false,
    isTyping = false,
    onCopy,
    onRegenerate,
    onReply,
    onDelete,
    onReaction,
    onLongPress,
    reactions,
    thinking,
    thinkingLevel,
    provider,
}: MessageBubbleProps) => {
    const { colors, isDark } = useTheme();
    const swipeableRef = useRef<Swipeable>(null);
    const isUser = role === 'user';

    // Animation values
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const cursorOpacity = useSharedValue(1);

    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!hasAnimated.current) {
            opacity.value = withTiming(1, { duration: 400 });
            translateY.value = withSpring(0, { damping: 15 });
            hasAnimated.current = true;
        }
    }, []);

    useEffect(() => {
        if (isTyping) {
            cursorOpacity.value = withRepeat(
                withSequence(
                    withTiming(0, { duration: 500 }),
                    withTiming(1, { duration: 500 })
                ),
                -1,
                true
            );
        } else {
            cursorOpacity.value = 1;
        }
    }, [isTyping]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const renderLeftActions = (progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => (
        <LeftSwipeAction dragX={dragX} onAction={() => { }} />
    );

    const renderRightActions = (progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => (
        <RightSwipeActions
            onReply={onReply}
            onCopy={onCopy}
            onDelete={onDelete}
            closeSwipe={() => swipeableRef.current?.close()}
            content={content}
        />
    );

    if (isUser) {
        return (
            <Animated.View style={[styles.userRow, animatedStyle]}>
                <Swipeable
                    ref={swipeableRef}
                    renderLeftActions={onReply ? renderLeftActions : undefined}
                    renderRightActions={onReply || onCopy || onDelete ? renderRightActions : undefined}
                    onSwipeableLeftOpen={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onReply?.();
                        swipeableRef.current?.close();
                    }}
                    overshootLeft={false}
                    friction={2}
                    rightThreshold={40}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onLongPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            onLongPress?.();
                        }}
                    >
                        <LinearGradient
                            colors={isDark ? ['#3B82F6', '#2563EB'] : ['#60A5FA', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.userBubble, { borderColor: 'rgba(255,255,255,0.1)' }]}
                        >
                            {attachments && attachments.length > 0 && (
                                <MessageAttachments attachments={attachments} isDark={isDark} />
                            )}
                            <MarkdownContent content={content} isUser={true} isDark={isDark} />
                            <ReactionsList
                                reactions={reactions || []}
                                onReactionPress={onReaction}
                                isUser={true}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </Swipeable>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[styles.aiRow, animatedStyle]}>
            <View style={styles.aiContent}>
                <AiMetadata agentUsed={agentUsed} provider={provider} isTyping={isTyping} />

                <Swipeable
                    ref={swipeableRef}
                    renderLeftActions={onReply ? renderLeftActions : undefined}
                    renderRightActions={onReply || onCopy || onDelete ? renderRightActions : undefined}
                    onSwipeableLeftOpen={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onReply?.();
                        swipeableRef.current?.close();
                    }}
                    overshootLeft={false}
                    friction={2}
                    rightThreshold={40}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onLongPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            onLongPress?.();
                        }}
                        style={[
                            styles.aiBubble,
                            {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                            }
                        ]}
                    >
                        {thinking && (
                            <ThinkingBubble
                                thinking={thinking}
                                thinkingLevel={thinkingLevel || 'medium'}
                            />
                        )}

                        <MarkdownContent content={content} isUser={false} isDark={isDark} />

                        {isTyping && (
                            <View style={styles.cursorContainer}>
                                <Animated.View style={[
                                    styles.cursor,
                                    { backgroundColor: colors.primary, opacity: cursorOpacity.value }
                                ]} />
                            </View>
                        )}

                        <ReactionsList
                            reactions={reactions || []}
                            onReactionPress={onReaction}
                            isUser={false}
                        />

                        <View style={styles.footerRow}>
                            <View />
                            <MessageFooterActions
                                isLatest={isLatest}
                                onCopy={() => {
                                    Clipboard.setString(content);
                                    onCopy?.();
                                }}
                                onRegenerate={onRegenerate}
                                isDark={isDark}
                            />
                        </View>
                    </TouchableOpacity>
                </Swipeable>

                {sources && sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                        <SourcesCitation sources={sources} compact={true} />
                    </View>
                )}
            </View>

            <View />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    userRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: spacing[6],
        paddingHorizontal: spacing[4],
    },
    userBubble: {
        maxWidth: '85%',
        borderRadius: borderRadius.bubble,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderBottomRightRadius: borderRadius.sm,
        borderWidth: 1,
    },
    aiRow: {
        flexDirection: 'row',
        marginBottom: spacing[6],
        paddingHorizontal: spacing[4],
    },
    aiContent: {
        flex: 1,
    },
    aiBubble: {
        borderRadius: borderRadius.bubble,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderTopLeftRadius: borderRadius.sm,
        borderWidth: 1,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing[2],
    },
    cursorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    cursor: {
        width: 6,
        height: 18,
        borderRadius: 1,
        marginLeft: 2,
    },
    sourcesContainer: {
        marginTop: spacing[3],
    },
});

export default memo(MessageBubble, (prev, next) => {
    // Primitive comparisons
    if (
        prev.content !== next.content ||
        prev.isTyping !== next.isTyping ||
        prev.role !== next.role ||
        prev.isLatest !== next.isLatest ||
        prev.thinking !== next.thinking ||
        prev.thinkingLevel !== next.thinkingLevel ||
        prev.agentUsed !== next.agentUsed ||
        prev.provider !== next.provider
    ) {
        return false;
    }

    // Array checks - Shallow equality on length to avoid re-renders on new references with same content
    if (prev.sources?.length !== next.sources?.length) return false;
    if (prev.attachments?.length !== next.attachments?.length) return false;
    if (prev.reactions?.length !== next.reactions?.length) return false;

    // Check last reaction just in case (optional, but good for real-time updates)
    const prevLastReaction = prev.reactions?.[prev.reactions.length - 1];
    const nextLastReaction = next.reactions?.[next.reactions.length - 1];
    if (prevLastReaction !== nextLastReaction) return false;

    return true;
});
