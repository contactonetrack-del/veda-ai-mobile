/**
 * Sources Citation Component for Mobile
 * Phase 1: Perplexity-class Intelligence
 * Displays web search sources/citations for AI responses
 */
import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
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
            await WebBrowser.openBrowserAsync(url, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                toolbarColor: isDark ? '#121212' : '#ffffff',
                controlsColor: colors.primary,
            });
        } catch (error: unknown) {
            console.error('Error opening URL:', error);
            // Fallback
            Linking.openURL(url).catch((err: unknown) => console.error('Linking error:', err));
        }
    };

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'Source';
        }
    };

    const getFaviconUrl = (source: Source) => {
        if (source.favicon) return source.favicon;
        const hostname = getHostname(source.url);
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
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
                        <Text style={[styles.headerText, { color: colors.subtext }]}>Source Citations</Text>
                    </View>

                    {/* Featured Source (First one) */}
                    <TouchableOpacity
                        style={[styles.featuredCard, {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.backgroundSecondary,
                            borderColor: colors.cardBorder
                        }]}
                        onPress={() => handleOpenLink(citableSources[0].url)}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: getFaviconUrl(citableSources[0]) }}
                            style={styles.featuredFavicon}
                        />
                        <View style={styles.featuredContent}>
                            <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={1}>
                                {citableSources[0].title || getHostname(citableSources[0].url)}
                            </Text>
                            <Text style={[styles.featuredUrl, { color: colors.subtext }]} numberOfLines={1}>
                                {getHostname(citableSources[0].url)}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
                    </TouchableOpacity>

                    {/* Remaining Sources in Grid */}
                    {citableSources.length > 1 && (
                        <View style={styles.sourcesGrid}>
                            {citableSources.slice(1, 4).map((source, index) => (
                                <TouchableOpacity
                                    key={index + 1}
                                    style={[styles.gridItem, {
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.backgroundSecondary,
                                        borderColor: colors.cardBorder
                                    }]}
                                    onPress={() => handleOpenLink(source.url)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.gridInfo}>
                                        <Image
                                            source={{ uri: getFaviconUrl(source) }}
                                            style={styles.gridFavicon}
                                        />
                                        <Text
                                            style={[styles.gridTitle, { color: colors.text }]}
                                            numberOfLines={1}
                                        >
                                            {source.title || getHostname(source.url)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
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

    const getAgentIcon = (): keyof typeof Ionicons.glyphMap => {
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
            <Ionicons name={getAgentIcon()} size={10} color={color} />
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
    featuredCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 8,
    },
    featuredFavicon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        marginRight: 12,
    },
    featuredContent: {
        flex: 1,
    },
    featuredTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    featuredUrl: {
        fontSize: 11,
    },
    sourcesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gridItem: {
        flex: 1,
        minWidth: '45%',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    gridInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    gridFavicon: {
        width: 14,
        height: 14,
        borderRadius: 3,
    },
    gridTitle: {
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
