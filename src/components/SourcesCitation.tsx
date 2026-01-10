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
}

export function SourcesCitation({ sources = [], isFallback = false, fallbackReason = '' }: SourcesCitationProps) {
    const { theme } = useTheme();

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
        <View style={[styles.container, { borderTopColor: theme.border }]}>
            {citableSources.length > 0 && (
                <>
                    <View style={styles.header}>
                        <Ionicons name="globe-outline" size={12} color={theme.textMuted} />
                        <Text style={[styles.headerText, { color: theme.textMuted }]}>Sources</Text>
                    </View>
                    <View style={styles.sourcesList}>
                        {citableSources.slice(0, 4).map((source, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.sourceChip, {
                                    backgroundColor: theme.cardBackground,
                                    borderColor: theme.border
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
                                    <View style={[styles.sourceNumber, { backgroundColor: theme.primary + '30' }]}>
                                        <Text style={[styles.sourceNumberText, { color: theme.primary }]}>
                                            {index + 1}
                                        </Text>
                                    </View>
                                )}
                                <Text
                                    style={[styles.sourceTitle, { color: theme.text }]}
                                    numberOfLines={1}
                                >
                                    {source.title || getHostname(source.url)}
                                </Text>
                                <Ionicons name="open-outline" size={12} color={theme.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {isFallback && (
                <View style={[styles.fallbackNotice, {
                    backgroundColor: theme.warning + '15',
                    borderColor: theme.warning + '40'
                }]}>
                    <Ionicons name="alert-circle-outline" size={14} color={theme.warning} />
                    <Text style={[styles.fallbackText, { color: theme.warning }]}>
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
    const { theme } = useTheme();

    if (!agent) return null;

    const getAgentColor = () => {
        switch (intent) {
            case 'search': return '#6366f1';
            case 'wellness': return '#34d399';
            case 'tool': return '#fb923c';
            default: return theme.primary;
        }
    };

    const getAgentIcon = () => {
        switch (intent) {
            case 'search': return 'search-outline';
            case 'wellness': return 'fitness-outline';
            case 'tool': return 'construct-outline';
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
