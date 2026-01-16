import React, { useEffect, useRef, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Platform,
    Animated,
    TouchableOpacity,
    Clipboard,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable } from 'react-native-gesture-handler';
import Markdown from 'react-native-markdown-display';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SourcesCitation } from '../SourcesCitation';
import { shadows } from '../../config/colors';
import { borderRadius, spacing, avatarSize } from '../../config/spacing';
import { duration, easing } from '../../config/animations';
import CodeBlock from './CodeBlock';

interface Attachment {
    id: string;
    uri: string;
    type: 'image' | 'video' | 'file';
    name?: string;
}

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
    attachments?: Attachment[];
    agentUsed?: string;
    isLatest?: boolean;
    isTyping?: boolean;
    onCopy?: () => void;
    onRegenerate?: () => void;
    onInteract?: () => void;
    onReply?: () => void;
    onDelete?: () => void;
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
    onInteract,
    onReply,
    onDelete,
}: MessageBubbleProps) => {
    const { colors, theme, isDark } = useTheme();
    const isUser = role === 'user';
    const isAi = role === 'assistant';

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const cursorOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: duration.normal,
                easing: easing.easeOut,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: duration.normal,
                easing: easing.easeOutCubic,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: duration.normal,
                easing: easing.easeOutCubic,
                useNativeDriver: true,
            }),
        ]).start();

        if (isTyping) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(cursorOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(cursorOpacity, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            cursorOpacity.setValue(0);
        }
    }, [isTyping]);

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onInteract) {
            onInteract();
        } else if (onCopy) {
            Clipboard.setString(content);
            onCopy();
        }
    };

    const swipeableRef = useRef<Swipeable>(null);

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const scale = dragX.interpolate({
            inputRange: [0, 50],
            outputRange: [0.5, 1.2],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.swipeLeftContainer}>
                <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons name="arrow-undo-circle" size={28} color={colors.primary} />
                </Animated.View>
            </View>
        );
    };

    const handleSwipeOpen = (direction: 'left' | 'right') => {
        if (direction === 'left' && onReply) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onReply();
            swipeableRef.current?.close();
        }
    };

    // Enhanced Markdown styles
    const markdownStyles = {
        body: {
            color: colors.text,
            fontSize: 16,
            lineHeight: 24,
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 8,
        },
        strong: {
            fontWeight: '600' as const,
        },
        em: {
            fontStyle: 'italic' as const,
        },
        code_inline: {
            backgroundColor: isUser
                ? 'rgba(255,255,255,0.15)'
                : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            borderRadius: 4,
            paddingHorizontal: 6,
            paddingVertical: 2,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 14,
        },
        fence: {
            backgroundColor: isDark ? '#121212' : '#F9F9F9',
            color: colors.text,
            borderRadius: borderRadius.md,
            padding: spacing[4],
            marginVertical: spacing[3],
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        },
        code_block: {
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 14,
            lineHeight: 22,
            color: isDark ? '#E0E0E0' : '#333333',
        },
        link: {
            color: colors.primary,
            textDecorationLine: 'underline' as const,
        },
        blockquote: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            paddingLeft: spacing[3],
            paddingVertical: spacing[2],
            marginVertical: spacing[2],
        },
        list_item: {
            marginBottom: spacing[1],
        },
        bullet_list: {
            marginBottom: spacing[2],
        },
        ordered_list: {
            marginBottom: spacing[2],
        },
    };

    if (isUser) {
        return (
            <Animated.View
                style={[
                    styles.userRow,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                <Swipeable
                    ref={swipeableRef}
                    renderLeftActions={onReply ? renderLeftActions : undefined}
                    onSwipeableOpen={handleSwipeOpen}
                    overshootLeft={false}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={handleLongPress}
                        delayLongPress={300}
                        style={[
                            styles.userBubble,
                            {
                                backgroundColor: isDark ? colors.chatUserBubble : '#E8F4F0',
                                borderColor: isDark ? colors.chatUserBubbleBorder : '#D0E8E0',
                            },
                            shadows.sm,
                        ]}
                        accessibilityLabel={`You said: ${content}`}
                        accessibilityRole="text"
                    >
                        {attachments && attachments.length > 0 && (
                            <View style={styles.attachmentGrid}>
                                {attachments.map((att, index) => (
                                    <View key={index} style={[styles.attachmentContainer, att.type === 'file' && { width: 140, padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                        {att.type === 'image' ? (
                                            <Image source={{ uri: att.uri }} style={styles.attachmentImage} />
                                        ) : (
                                            <View style={styles.fileAttachmentRow}>
                                                <Ionicons name="document-text" size={24} color={colors.primary} />
                                                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                                                    {att.name || 'Document'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                        <Markdown
                            style={{
                                ...markdownStyles,
                                body: { ...markdownStyles.body, color: theme === 'light' ? '#1A1A1A' : '#ECECEC' }
                            }}
                            rules={{
                                fence: (node: any) => {
                                    const lang = node.sourceInfo || 'text';
                                    return <CodeBlock key={node.key} language={lang}>{node.content}</CodeBlock>;
                                },
                            }}
                        >
                            {content}
                        </Markdown>
                    </TouchableOpacity>
                </Swipeable>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                styles.aiRow,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                    ],
                },
            ]}
        >
            {/* AI Avatar with subtle glow effect */}
            <View style={[styles.avatarContainer, { backgroundColor: 'transparent' }]}>
                <View style={[styles.avatarGlow, { backgroundColor: colors.primary }]} />
                <Image
                    source={require('../../../assets/veda-avatar.png')}
                    style={styles.avatar}
                    resizeMode="cover"
                    accessibilityLabel="VEDA AI Assistant Avatar"
                />
            </View>

            <View style={styles.aiContent}>
                <Swipeable
                    ref={swipeableRef}
                    renderLeftActions={onReply ? renderLeftActions : undefined}
                    onSwipeableOpen={handleSwipeOpen}
                    overshootLeft={false}
                >
                    {/* Agent Name */}
                    {agentUsed && (
                        <View style={styles.agentRow}>
                            <Text style={[styles.agentName, { color: colors.primary }]}>
                                VEDA AI
                            </Text>
                            <View style={[styles.agentBadge, { backgroundColor: `${colors.primary}20` }]}>
                                <Text style={[styles.agentBadgeText, { color: colors.primary }]}>
                                    {agentUsed}
                                </Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onLongPress={handleLongPress}
                        delayLongPress={300}
                        style={shadows.sm}
                    >
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                                : ['#FFFFFF', '#F8FBF9']}
                            style={[
                                styles.aiBubble,
                                {
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E8F2EE',
                                }
                            ]}
                            accessibilityLabel={`AI responded: ${content}`}
                            accessibilityRole="text"
                        >
                            <Markdown
                                style={markdownStyles}
                                rules={{
                                    fence: (node: any) => {
                                        const lang = node.sourceInfo || 'text';
                                        return <CodeBlock key={node.key} language={lang}>{node.content}</CodeBlock>;
                                    },
                                }}
                            >
                                {content}
                            </Markdown>
                            {isTyping && (
                                <View style={styles.cursorContainer}>
                                    <Animated.View style={[styles.cursor, { backgroundColor: colors.primary, opacity: cursorOpacity }]} />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Swipeable>

                {/* Action buttons for latest AI message */}
                {/* ... (Keep existing actions outside swipeable?) or inside? Keeping outside for now to avoid complexity */}

                {isLatest && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                Clipboard.setString(content);
                                onCopy?.();
                            }}
                            accessibilityLabel="Copy message content"
                            accessibilityRole="button"
                        >
                            <Ionicons name="copy-outline" size={16} color={colors.subtext} />
                        </TouchableOpacity>
                        {onRegenerate && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    onRegenerate();
                                }}
                                accessibilityLabel="Regenerate AI response"
                                accessibilityRole="button"
                            >
                                <Ionicons name="refresh-outline" size={16} color={colors.subtext} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Sources / Citations */}
                {sources && sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                        <SourcesCitation sources={sources} compact={true} />
                    </View>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    swipeLeftContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        marginRight: 8,
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: spacing[6],
        paddingHorizontal: spacing[4],
    },
    userBubble: {
        maxWidth: '80%',
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
    avatarContainer: {
        width: avatarSize.sm,
        height: avatarSize.sm,
        borderRadius: avatarSize.sm / 2,
        marginRight: spacing[3],
        marginTop: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    avatarGlow: {
        position: 'absolute',
        width: avatarSize.sm + 4,
        height: avatarSize.sm + 4,
        borderRadius: (avatarSize.sm + 4) / 2,
        opacity: 0.2,
    },
    avatar: {
        width: avatarSize.sm,
        height: avatarSize.sm,
        borderRadius: avatarSize.sm / 2,
    },
    aiContent: {
        flex: 1,
    },
    agentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing[1],
    },
    agentName: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    agentBadge: {
        marginLeft: spacing[2],
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    agentBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing[3],
        gap: spacing[2],
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sourcesContainer: {
        marginTop: spacing[3],
    },
    aiBubble: {
        borderRadius: borderRadius.bubble,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderTopLeftRadius: borderRadius.sm,
        borderWidth: 1,
    },
    cursorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    cursor: {
        width: 8,
        height: 16,
        borderRadius: 2,
        opacity: 0.8,
    },
    attachmentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    attachmentContainer: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    attachmentImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    fileAttachmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    fileName: {
        fontSize: 12,
        flex: 1,
    },
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        marginBottom: 12,
        borderRadius: borderRadius.lg,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },
});

export default memo(MessageBubble, (prevProps, nextProps) => {
    return (
        prevProps.content === nextProps.content &&
        prevProps.isTyping === nextProps.isTyping &&
        prevProps.role === nextProps.role &&
        prevProps.isLatest === nextProps.isLatest &&
        prevProps.sources === nextProps.sources
    );
});

