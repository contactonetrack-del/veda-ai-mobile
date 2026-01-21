import React from 'react';
import { Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing } from '../../config';
import CodeBlock from './CodeBlock';

interface MarkdownContentProps {
    content: string;
    isUser: boolean;
    isDark: boolean;
}

export const MarkdownContent = ({ content, isUser, isDark }: MarkdownContentProps) => {
    const { colors } = useTheme();

    const markdownStyles = {
        body: {
            color: isUser ? (isDark ? '#FFFFFF' : '#1A1A1A') : colors.text,
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
            color: isUser ? (isDark ? '#FFFFFF' : '#1A1A1A') : colors.primary,
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

    return (
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
    );
};
