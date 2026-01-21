import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import * as api from '../../services/api';
import * as Haptics from 'expo-haptics';

export interface KnowledgeDocument {
    content: string;
    source: string;
    score: number;
}

interface KnowledgeBaseModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDocument?: (document: KnowledgeDocument) => void;
}

export default function KnowledgeBaseModal({ visible, onClose, onSelectDocument }: KnowledgeBaseModalProps): React.ReactElement | null {
    const { colors, isDark } = useTheme();
    const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [stats, setStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<KnowledgeDocument[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSelect = (item: KnowledgeDocument) => {
        Haptics.selectionAsync();
        onSelectDocument?.(item);
        onClose();
    };

    useEffect(() => {
        if (visible) {
            checkStatus();
        }
    }, [visible]);

    const checkStatus = async () => {
        try {
            setStatus('loading');
            const data = await api.getKnowledgeStatus();
            setStats(data);
            setStatus('connected');
        } catch (error: unknown) {
            console.error('KB Status Error:', error);
            setStatus('error');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            const results = await api.searchKnowledge(searchQuery);
            setSearchResults(results.results || []);
        } catch (error: unknown) {
            console.error('KB Search Error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const renderStatusBadge = () => {
        if (status === 'loading') return (
            <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]}>
                <ActivityIndicator size="small" color={colors.text} />
                <Text style={[styles.badgeText, { color: colors.text }]}>Connecting...</Text>
            </View>
        );
        if (status === 'error') return (
            <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={[styles.badgeText, { color: '#EF4444' }]}>Disconnected</Text>
            </View>
        );
        return (
            <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#10A37F" />
                <Text style={[styles.badgeText, { color: '#065F46' }]}>Active & Synced</Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <BlurView intensity={isDark ? 80 : 90} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <View style={[styles.container, { backgroundColor: colors.card }]}>
                            {/* Header */}
                            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                                <View>
                                    <Text style={[styles.title, { color: colors.text }]}>Knowledge Base</Text>
                                    <Text style={[styles.subtitle, { color: colors.subtext }]}>Real-time RAG Connection</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Status Section */}
                            <View style={styles.section}>
                                <View style={styles.statusRow}>
                                    <Text style={[styles.label, { color: colors.subtext }]}>Status</Text>
                                    {renderStatusBadge()}
                                </View>
                                {stats && (
                                    <View style={[styles.statsBox, { backgroundColor: colors.background }]}>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.document_count || 0}</Text>
                                            <Text style={[styles.statLabel, { color: colors.subtext }]}>Documents</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.chunk_count || 0}</Text>
                                            <Text style={[styles.statLabel, { color: colors.subtext }]}>Chunks</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.primary }]}>Vector</Text>
                                            <Text style={[styles.statLabel, { color: colors.subtext }]}>Index Type</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Search Section */}
                            <View style={styles.section}>
                                <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>Visual Explorer</Text>
                                <View style={[styles.searchBox, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                                    <Ionicons name="search" size={20} color={colors.subtext} />
                                    <TextInput
                                        style={[styles.searchInput, { color: colors.text }]}
                                        placeholder="Search knowledge base..."
                                        placeholderTextColor={colors.subtext}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onSubmitEditing={handleSearch}
                                        returnKeyType="search"
                                    />
                                    {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
                                </View>
                            </View>

                            {/* Results List */}
                            <ScrollView style={styles.resultsList} contentContainerStyle={{ paddingBottom: 20 }}>
                                {searchResults.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.resultItem, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={[styles.resultContent, { color: colors.text }]} numberOfLines={3}>
                                            {item.content || "No content preview"}
                                        </Text>
                                        <View style={styles.resultMeta}>
                                            <Ionicons name="document-text-outline" size={12} color={colors.subtext} />
                                            <Text style={[styles.resultSource, { color: colors.subtext }]}>
                                                {item.source || 'Unknown Source'}
                                            </Text>
                                            <Text style={[styles.resultScore, { color: colors.primary }]}>
                                                {(item.score * 100).toFixed(0)}% match
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                                {!isSearching && searchResults.length === 0 && searchQuery.length > 0 && (
                                    <Text style={[styles.emptyText, { color: colors.subtext }]}>No relevant knowledge found.</Text>
                                )}
                            </ScrollView>

                        </View>
                    </KeyboardAvoidingView>
                </BlurView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
    },
    section: {
        marginBottom: 24,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 6,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    statsBox: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(150,150,150,0.2)',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        height: '100%',
    },
    resultsList: {
        flex: 1,
    },
    resultItem: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    resultContent: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resultSource: {
        fontSize: 12,
    },
    resultScore: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 'auto',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    }
});
