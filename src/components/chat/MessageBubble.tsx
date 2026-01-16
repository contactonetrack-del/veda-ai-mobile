import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { useTheme } from '../../context/ThemeContext';
import { SourcesCitation } from '../SourcesCitation';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
    agentUsed?: string;
}

export default function MessageBubble({ role, content, sources, agentUsed }: MessageBubbleProps) {
    const { colors, theme } = useTheme();
    const isUser = role === 'user';
    const isAi = role === 'assistant';

    // Markdown styles
    const markdownStyles = {
        body: {
            color: colors.text,
            fontSize: 16,
            lineHeight: 24,
            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 8
        },
        code_inline: {
            backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : colors.inputBg,
            borderRadius: 4,
            paddingHorizontal: 4,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        fence: {
            backgroundColor: colors.inputBg,
            color: colors.text,
            borderRadius: 8,
            padding: 8,
            marginVertical: 4,
        }
    };

    if (isUser) {
        return (
            <View style={styles.userRow}>
                <View style={[styles.userBubble, { backgroundColor: colors.chatUserBubble }]}>
                    <Markdown style={{
                        ...markdownStyles,
                        body: { ...markdownStyles.body, color: theme === 'light' ? '#1A1A1A' : '#ECECEC' }
                    }}>
                        {content}
                    </Markdown>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.aiRow}>
            {/* AI Avatar */}
            <View style={[styles.avatarContainer, { backgroundColor: 'transparent' }]}>
                <Image
                    source={require('../../../assets/veda-avatar.png')}
                    style={styles.avatar}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.aiContent}>
                {/* Agent Name (Optional, subtle) */}
                {agentUsed && (
                    <Text style={[styles.agentName, { color: colors.primary }]}>
                        VEDA AI
                    </Text>
                )}

                {/* Message Content */}
                <Markdown style={markdownStyles}>
                    {content}
                </Markdown>

                {/* Sources / Citations */}
                {sources && sources.length > 0 && (
                    <View style={styles.sourcesContainer}>
                        <SourcesCitation sources={sources} compact={true} />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    userRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    userBubble: {
        maxWidth: '80%',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomRightRadius: 4, // Subtle "tail" effect
    },
    aiRow: {
        flexDirection: 'row',
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        marginTop: 2, // Align with text top
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    aiContent: {
        flex: 1,
    },
    agentName: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    sourcesContainer: {
        marginTop: 8,
    }
});
