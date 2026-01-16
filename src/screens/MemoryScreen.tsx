import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassView } from '../components/common/GlassView';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMemories, deleteMemory, clearMemory } from '../services/api';

interface Memory {
    id: string;
    text: string;
    metadata?: {
        role?: string;
        timestamp?: string;
    };
    created_at: string;
}

export default function MemoryScreen({ navigation }: { navigation: any }) {
    const { user } = useAuth();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMemories();
        }
    }, [user]);

    const fetchMemories = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await getMemories(user.id);
            setMemories(data);
        } catch (error) {
            console.error("Failed to load memories", error);
            Alert.alert("Error", "Failed to load memories");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!user?.id) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await deleteMemory(user.id, id);
            setMemories(prev => prev.filter(m => m.id !== id));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error("Failed to delete memory", error);
            Alert.alert("Error", "Failed to delete memory");
        }
    };

    const handleClearAll = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Wipe Memory?",
            "Are you sure you want to wipe all long-term memory? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Wipe All",
                    style: "destructive",
                    onPress: async () => {
                        if (!user?.id) return;
                        try {
                            await clearMemory(user.id);
                            setMemories([]);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        } catch (error) {
                            console.error("Failed to clear memory", error);
                            Alert.alert("Error", "Failed to clear memory");
                        }
                    }
                }
            ]
        );
    };


    const renderItem = ({ item }: { item: Memory }) => (
        <GlassView style={styles.memoryItem} intensity={25}>
            <View style={styles.memoryContentContainer}>
                <Text style={[styles.memoryText, { color: colors.text }]}>{item.text}</Text>
                <View style={styles.memoryMeta}>
                    <Text style={[styles.memoryRole, { color: colors.primary }]}>{item.metadata?.role || 'assistant'}</Text>
                    <Text style={[styles.memoryDate, { color: colors.subtext }]}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
            >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </GlassView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <MaterialCommunityIcons name="cpu-64-bit" size={24} color={colors.primary} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Neural Memory Bank</Text>
                </View>
                <TouchableOpacity onPress={handleClearAll} style={styles.wipeButton}>
                    <Ionicons name="trash-bin" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={[styles.statsContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.statsText, { color: colors.subtext }]}>
                    {memories.length} Active Vectors
                </Text>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.subtext }]}>Accessing Neural Core...</Text>
                </View>
            ) : memories.length === 0 ? (
                <View style={styles.centerContainer}>
                    <MaterialCommunityIcons name="brain" size={64} color={colors.subtext} style={{ opacity: 0.5 }} />
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>No long-term memories stored yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={memories}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold', // Bolder title
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    wipeButton: {
        padding: 8,
        borderRadius: 20,
    },
    statsContainer: {
        padding: 12,
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    statsText: {
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    listContainer: {
        padding: 16,
        paddingTop: 0,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
    memoryItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: 12,
        marginBottom: 16, // More spacing
        padding: 16,
        overflow: 'hidden',
        // Removed border, relying on background contrast or slight elevation if needed
    },
    memoryContentContainer: {
        flex: 1,
        marginRight: 12,
    },
    memoryText: {
        fontSize: 15, // Slightly larger
        lineHeight: 22,
        marginBottom: 10,
    },
    memoryMeta: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 12,
    },
    memoryRole: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    memoryDate: {
        fontSize: 11,
        opacity: 0.6,
    },
    deleteBtn: {
        padding: 8,
    }
});
