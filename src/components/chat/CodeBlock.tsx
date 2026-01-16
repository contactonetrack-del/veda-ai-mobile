/**
 * CodeBlock - Syntax Highlighted Code Block
 * Renders code with colorful syntax highlighting for developer experience
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Clipboard as RNClipboard } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing } from '../../config/spacing';

interface CodeBlockProps {
    children: string;
    language?: string;
}

export default function CodeBlock({ children, language = 'javascript' }: CodeBlockProps) {
    const { colors, isDark } = useTheme();
    const [copied, setCopied] = useState(false);
    const code = children?.trim() || '';

    const handleCopy = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        RNClipboard.setString(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Map common language aliases
    const languageMap: Record<string, string> = {
        js: 'javascript',
        ts: 'typescript',
        py: 'python',
        rb: 'ruby',
        sh: 'bash',
        yml: 'yaml',
        md: 'markdown',
    };

    const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1E1E1E' : '#FAFAFA' }]}>
            {/* Header with language badge and copy button */}
            <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#E0E0E0' }]}>
                <Text style={[styles.languageLabel, { color: isDark ? '#888' : '#666' }]}>
                    {normalizedLang.toUpperCase()}
                </Text>
                <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopy}
                    activeOpacity={0.7}
                    accessibilityLabel="Copy code"
                    accessibilityRole="button"
                >
                    <Ionicons
                        name={copied ? 'checkmark' : 'copy-outline'}
                        size={16}
                        color={copied ? colors.primary : colors.subtext}
                    />
                    <Text style={[styles.copyText, { color: copied ? colors.primary : colors.subtext }]}>
                        {copied ? 'Copied!' : 'Copy'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Code Content */}
            <SyntaxHighlighter
                language={normalizedLang}
                style={isDark ? atomOneDark : atomOneLight}
                customStyle={styles.codeContainer}
                fontSize={13}
                highlighter="hljs"
            >
                {code}
            </SyntaxHighlighter>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.md,
        marginVertical: spacing[3],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderBottomWidth: 1,
    },
    languageLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    copyText: {
        fontSize: 12,
        fontWeight: '600',
    },
    codeContainer: {
        padding: spacing[3],
        margin: 0,
        backgroundColor: 'transparent',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});
