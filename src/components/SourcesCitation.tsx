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
}

export function SourcesCitation({
    sources = [],
    isFallback = false,
    fallbackReason = '',
    verified = false,
    confidence = 0.0
}: SourcesCitationProps) {
    const { colors } = useTheme();

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
                    backgroundColor: '#22c55e25',
                    borderColor: '#22c55e60'
                }]}>
                    <Ionicons name="shield-checkmark" size={12} color="#22c55e" />
                    <Text style={[styles.verificationText, { color: '#22c55e' }]}>
                        Fact-Checked ({Math.round(confidence * 100)}% confidence)
                    </Text>
                </View>
            )}
            {citableSources.length > 0 && (
                <>
                    <View style={styles.header}>
                        <Ionicons name="globe-outline" size={12} color={colors.subtext} />
                        <Text style={[styles.headerText, { color: colors.subtext }]}>Sources</Text>
                    </View>
                    <View style={styles.sourcesList}>
                        {citableSources.slice(0, 4).map((source, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.sourceChip, {
                                    backgroundColor: colors.card,
                                    borderColor: colors.cardBorder
                                }]}
                                onPress={() => handleOpenLink(source.url)}
                                activeOpacity={0.7}
                            >
                                {source.favicon ? (
                                    <Image
                                        source={{ uri: source.favicon }}
                                        style={styles.favicon}
                                        defaultSource={require('../../assets/icon.png')}
                                    />
                                ) : (
                                    <View style={[styles.sourceNumber, { backgroundColor: colors.primary + '30' }]}>
                                        <Text style={[styles.sourceNumberText, { color: colors.primary }]}>
                                            {index + 1}
                                        </Text>
                                    </View>
                                )}
                                <Text
                                    style={[styles.sourceTitle, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {source.title || getHostname(source.url)}
                                </Text>
                                <Ionicons name="open-outline" size={12} color={colors.subtext} />
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
                    <Ionicons name="alert-circle-outline" size={14} color={colors.accent} />
                    <Text style={[styles.fallbackText, { color: colors.accent }]}>
                        {fallbackReason === 'search_quota_exceeded'
                            ? 'Search quota exceeded. Response based on AI knowledge.'
                            : 'Answered from AI knowledge base.'}
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
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    headerText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sourcesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    sourceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        maxWidth: 160,
    },
    favicon: {
        width: 14,
        height: 14,
        borderRadius: 4,
    },
    sourceNumber: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sourceNumberText: {
        fontSize: 10,
        fontWeight: '600',
    },
    sourceTitle: {
        flex: 1,
        fontSize: 12,
    },
    fallbackNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    fallbackText: {
        fontSize: 12,
        flex: 1,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    verificationText: {
        fontSize: 11,
        fontWeight: '600',
    },
    agentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    agentBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
});

export default SourcesCitation;
