/**
 * Sources Citation Component for Mobile
 * Phase 1: Perplexity-class Intelligence
 * Displays web search sources/citations for AI responses
 */
import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Source {
    title: string;
    url: string;
    favicon?: string;
    source_type?: string;
}

interface SourcesCitationProps {
    sources: Source[];
    isFallback?: boolean;
    fallbackReason?: string;
    verified?: boolean;
    confidence?: number;
    compact?: boolean;
}

export function SourcesCitation({
    sources = [],
    isFallback = false,
    fallbackReason = '',
    verified = false,
    confidence = 0.0,
    compact = false
}: SourcesCitationProps) {
    const { colors, isDark } = useTheme();

    // Filter out sources without URLs
    const citableSources = sources.filter(s => s.url);

    if (citableSources.length === 0 && !isFallback) {
        return null;
    }

    const handleOpenLink = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        } catch (error) {
            console.error('Error opening URL:', error);
        }
    };

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Source';
        }
    };

    return (
        <View style={[styles.container, { borderTopColor: colors.cardBorder }]}>
            {verified && confidence >= 0.6 && (
                <View style={[styles.verificationBadge, {
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
                    borderColor: 'rgba(34, 197, 94, 0.3)'
                }]}>
                    <Ionicons name="shield-checkmark" size={12} color="#22c55e" />
                    <Text style={[styles.verificationText, { color: '#22c55e' }]}>
                        Verified ({Math.round(confidence * 100)}% confidence)
                    </Text>
                </View>
            )}
            {citableSources.length > 0 && (
                <>
                    <View style={styles.header}>
                        <Ionicons name="link-outline" size={13} color={colors.subtext} />
                        <Text style={[styles.headerText, { color: colors.subtext }]}>Related Sources</Text>
                    </View>
                    <View style={styles.sourcesList}>
                        {citableSources.slice(0, 3).map((source, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.sourceItem, {
                                    backgroundColor: colors.inputBg,
                                    borderColor: colors.cardBorder
                                }]}
                                onPress={() => handleOpenLink(source.url)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.sourceInfo}>
                                    {source.favicon ? (
                                        <Image
                                            source={{ uri: source.favicon }}
                                            style={styles.favicon}
                                        />
                                    ) : (
                                        <Ionicons name="document-text-outline" size={12} color={colors.primary} />
                                    )}
                                    <Text
                                        style={[styles.sourceTitle, { color: colors.text }]}
                                        numberOfLines={1}
                                    >
                                        {source.title || getHostname(source.url)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {isFallback && (
                <View style={[styles.fallbackNotice, {
                    backgroundColor: colors.accent + '15',
                    borderColor: colors.accent + '40'
                }]}>
                    <Ionicons name="information-circle-outline" size={14} color={colors.accent} />
                    <Text style={[styles.fallbackText, { color: colors.accent }]}>
                        {fallbackReason === 'search_quota_exceeded'
                            ? 'Search quota exceeded. Using internal knowledge.'
                            : 'Answered from VEDA knowledge base.'}
                    </Text>
                </View>
            )}
        </View>
    );
}

interface AgentBadgeProps {
    agent?: string;
    intent?: string;
}

export function AgentBadge({ agent, intent }: AgentBadgeProps) {
    const { colors } = useTheme();

    if (!agent) return null;

    const getAgentColor = () => {
        switch (intent) {
            case 'search': return '#6366f1';
            case 'wellness': return '#34d399';
            case 'tool': return '#fb923c';
            case 'deep_research': return '#8b5cf6'; // Violet for Deep Research
            default: return colors.primary;
        }
    };

    const getAgentIcon = () => {
        switch (intent) {
            case 'search': return 'search-outline';
            case 'wellness': return 'fitness-outline';
            case 'tool': return 'construct-outline';
            case 'deep_research': return 'library-outline';
            default: return 'sparkles-outline';
        }
    };

    const color = getAgentColor();

    return (
        <View style={[styles.agentBadge, {
            backgroundColor: color + '20',
            borderColor: color + '40'
        }]}>
            <Ionicons name={getAgentIcon() as any} size={10} color={color} />
            <Text style={[styles.agentBadgeText, { color }]}>
                {agent.replace('Agent', '')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    sourcesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sourceItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        minWidth: 100,
        maxWidth: '48%',
    },
    sourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    favicon: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    sourceTitle: {
        fontSize: 11,
        fontWeight: '500',
        flex: 1,
    },
    fallbackNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 10,
    },
    fallbackText: {
        fontSize: 11,
        flex: 1,
        lineHeight: 16,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 14,
        alignSelf: 'flex-start',
    },
    verificationText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    agentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    agentBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
});

export default SourcesCitation;
