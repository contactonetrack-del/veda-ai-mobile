import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Modal,
    Animated,
    Image,
    ScrollView,
    Platform,
    Alert,
    RefreshControl,
    SectionList,
    TextInput,
    Keyboard
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { getChats, deleteChat as apiDeleteChat } from '../../services/api';
import { ListItemSkeleton } from '../common/SkeletonLoader';
import KnowledgeBaseModal from '../modals/KnowledgeBaseModal';


interface SidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onSelectContextDocument?: (document: any) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85; // 85% width like ChatGPT

// Date helper function
const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const getDaysDifference = (d1: Date, d2: Date) => {
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export default function SidebarDrawer({ isOpen, onClose, onNewChat, onSelectChat, onSelectContextDocument }: SidebarDrawerProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

    const [allChats, setAllChats] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Open/Close Animation
    useEffect(() => {
        if (isOpen) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 90,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -DRAWER_WIDTH,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isOpen]);

    // Folder State
    const [folders, setFolders] = useState([
        { id: 'all', name: 'All Chats', icon: 'grid-outline' },
        { id: 'work', name: 'Work', icon: 'briefcase-outline' },
        { id: 'personal', name: 'Personal', icon: 'person-outline' },
        { id: 'ideas', name: 'Ideas', icon: 'bulb-outline' }
    ]);
    const [activeFolderId, setActiveFolderId] = useState('all');

    // Grouping Logic
    const getGroupedChats = () => {
        let filtered = allChats;

        // 1. Filter by Folder (Real Phase 12 logic)
        if (activeFolderId !== 'all') {
            filtered = allChats.filter(c => c.folder_id === activeFolderId);
        }

        // 2. Filter by Search (Same as before)
        if (searchQuery.trim()) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.preview && c.preview.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        const groups: { title: string; items: any[] }[] = [];
        const now = new Date();
        const yesterdayDate = new Date();
        yesterdayDate.setDate(now.getDate() - 1);

        const today: any[] = [];
        const yesterday: any[] = [];
        const previous7Days: any[] = [];
        const older: any[] = [];

        filtered.forEach(chat => {
            const date = new Date(chat.created_at || new Date());

            if (isSameDay(date, now)) {
                today.push(chat);
            } else if (isSameDay(date, yesterdayDate)) {
                yesterday.push(chat);
            } else if (getDaysDifference(date, now) <= 7) {
                previous7Days.push(chat);
            } else {
                older.push(chat);
            }
        });

        if (today.length > 0) groups.push({ title: 'Today', items: today });
        if (yesterday.length > 0) groups.push({ title: 'Yesterday', items: yesterday });
        if (previous7Days.length > 0) groups.push({ title: 'Previous 7 Days', items: previous7Days });
        if (older.length > 0) groups.push({ title: 'Older', items: older });

        return groups;
    };

    const historyGroups = getGroupedChats();

    const loadHistory = async () => {
        if (!refreshing) setIsLoading(true);
        try {
            const response = await getChats();
            const chats = response.chats || response || [];
            const formattedChats = chats.map((chat: any) => ({
                id: chat.id || chat.chat_id,
                title: chat.title || chat.name || 'Untitled Chat',
                preview: chat.last_message || chat.preview || 'No messages yet',
                created_at: chat.created_at || chat.updated_at || new Date().toISOString(),
                folder_id: chat.folder_id || 'all',
            }));
            setAllChats(formattedChats);
        } catch (e) {
            console.log('Failed to load history', e);
            setAllChats([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (isOpen && user?.id !== 'guest') {
            loadHistory();
        } else if (isOpen && user?.id === 'guest') {
            setAllChats([{ id: 'local', title: 'Current Session', preview: 'Chatting as Guest', created_at: new Date().toISOString(), folder_id: 'all' }]);
        }
    }, [isOpen, user]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            loadHistory(),
            new Promise(resolve => setTimeout(resolve, 500))
        ]);
        setRefreshing(false);
    }, [user]);

    const handleDeleteChat = async (chatId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiDeleteChat(chatId);
                            setAllChats(prev => prev.filter(c => c.id !== chatId));
                        } catch (e) {
                            console.error('Failed to delete', e);
                            Alert.alert('Error', 'Could not delete chat. Please try again.');
                        }
                    }

                }
            ]
        );
    };

    const handleMoveToFolder = async (chatId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Dynamic folder selection
        const options = folders.filter(f => f.id !== 'all').map(f => f.name);
        options.push('All Chats (Ungrouped)');
        options.push('Cancel');

        const buttons: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' | 'default' }[] = folders
            .filter(f => f.id !== 'all')
            .map(f => ({
                text: f.name,
                onPress: async () => {
                    try {
                        const { updateChatFolder } = require('../../services/api');
                        await updateChatFolder(chatId, f.id);
                        setAllChats(prev => prev.map(c => c.id === chatId ? { ...c, folder_id: f.id } : c));
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } catch (e) {
                        Alert.alert('Error', 'Failed to move chat');
                    }
                }
            }));
        buttons.push({ text: 'Cancel', style: 'cancel' });

        Alert.alert('Move to Folder', 'Select a folder for this chat:', buttons);
    };

    const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, chatId: string) => {
        const scale = dragX.interpolate({
            inputRange: [0, 80],
            outputRange: [0.5, 1],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.folderAction}
                onPress={() => handleMoveToFolder(chatId)}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons name="folder-outline" size={24} color="#FFF" />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, chatId: string) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0.5],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteChat(chatId)}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons name="trash" size={24} color="#FFF" />
                </Animated.View>
            </TouchableOpacity>
        );
    };

    if (!isOpen && typeof slideAnim === 'object') {
        // Force render if open, otherwise rely on translation to hide off-screen 
    }

    // Helper to format date nicely
    const renderDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlayContainer}>
                {/* Backdrop with Fade */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.backdropTouch}
                        onPress={onClose}
                        activeOpacity={1}
                        accessibilityLabel="Close sidebar"
                        accessibilityRole="button"
                    />
                </Animated.View>

                {/* Drawer with Slide */}
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            backgroundColor: colors.background,
                            transform: [{ translateX: slideAnim }],
                            width: DRAWER_WIDTH,
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom
                        }
                    ]}
                >
                    {/* Header Code: Search & New Chat */}
                    <View style={styles.header}>
                        <View
                            style={[styles.searchBox, { backgroundColor: colors.inputBg }]}
                        >
                            <Ionicons name="search" size={20} color={colors.subtext} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search chats..."
                                placeholderTextColor={colors.subtext}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                accessibilityLabel="Search chat history"
                                accessibilityRole="search"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={colors.subtext} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Folder Tabs - Smart Folders */}
                    <View style={styles.folderTabsContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderTabsContent}>
                            {folders.map(folder => (
                                <TouchableOpacity
                                    key={folder.id}
                                    style={[
                                        styles.folderTab,
                                        activeFolderId === folder.id && { backgroundColor: isDark ? colors.card : '#E0E7FF', borderColor: colors.primary },
                                        { borderColor: isDark ? colors.cardBorder : '#e2e8f0' }
                                    ]}
                                    onPress={() => {
                                        setActiveFolderId(folder.id);
                                        Haptics.selectionAsync();
                                    }}
                                >
                                    <Ionicons
                                        name={folder.icon as any}
                                        size={14}
                                        color={activeFolderId === folder.id ? colors.primary : colors.subtext}
                                    />
                                    <Text style={[
                                        styles.folderTabText,
                                        { color: activeFolderId === folder.id ? colors.primary : colors.subtext }
                                    ]}>
                                        {folder.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={[styles.folderTab, { borderStyle: 'dashed', borderColor: colors.subtext }]}
                                onPress={() => Alert.alert('New Folder', 'Create a new folder to organize your chats.')}
                            >
                                <Ionicons name="add" size={14} color={colors.subtext} />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Chat History List */}
                    {isLoading && !refreshing ? (
                        <View style={styles.historyList}>
                            {/* Header Placeholder */}
                            <TouchableOpacity style={[styles.newChatRow, { borderColor: colors.cardBorder }]}>
                                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#FFF' : '#000' }]}>
                                    <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
                                </View>
                                <Text style={[styles.newChatText, { color: colors.text }]}>New Chat</Text>
                            </TouchableOpacity>
                            {/* Skeletons */}
                            <View style={{ paddingHorizontal: 16 }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <View key={i} style={{ marginBottom: 16 }}>
                                        <ListItemSkeleton />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <SectionList
                            style={styles.historyList}
                            sections={historyGroups.map(g => ({ title: g.title, data: g.items }))}
                            keyExtractor={(item: any) => item.id}
                            renderItem={({ item }: { item: any }) => (
                                <Swipeable
                                    renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item.id)}
                                    renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
                                    overshootRight={false}
                                    overshootLeft={false}
                                >
                                    <TouchableOpacity
                                        style={[styles.historyItem, { backgroundColor: colors.background }]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            onSelectChat(item.id);
                                        }}
                                        accessibilityLabel={`Chat: ${item.title}`}
                                        accessibilityRole="button"
                                        accessibilityHint="Double tap to open this chat"
                                    >
                                        <View style={styles.historyItemHeader}>
                                            <Text
                                                style={[styles.historyItemText, { color: colors.text }]}
                                                numberOfLines={1}
                                            >
                                                {item.title}
                                            </Text>
                                            <Text style={[styles.historyItemTime, { color: colors.subtext }]}>
                                                {renderDate(item.created_at)}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[styles.historyItemPreview, { color: colors.subtext }]}
                                            numberOfLines={1}
                                        >
                                            {item.preview || 'No messages yet'}
                                        </Text>
                                    </TouchableOpacity>
                                </Swipeable>
                            )}
                            renderSectionHeader={({ section: { title } }: { section: { title: string } }) => (
                                <View style={styles.groupContainer}>
                                    <Text style={[styles.groupTitle, { color: colors.subtext }]}>{title}</Text>
                                </View>
                            )}
                            stickySectionHeadersEnabled={false}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.primary}
                                    colors={[colors.primary]}
                                />
                            }
                            ListHeaderComponent={
                                <TouchableOpacity
                                    style={[styles.newChatRow, { borderColor: colors.cardBorder }]}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        onNewChat();
                                        onClose();
                                    }}
                                    accessibilityLabel="Start a new chat"
                                    accessibilityRole="button"
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#FFF' : '#000' }]}>
                                        <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
                                    </View>
                                    <Text style={[styles.newChatText, { color: colors.text }]}>New Chat</Text>
                                </TouchableOpacity>
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    {searchQuery.trim() ? (
                                        <>
                                            <Ionicons name="search-outline" size={48} color={colors.subtext} style={{ opacity: 0.5 }} />
                                            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                                No results found
                                            </Text>
                                            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
                                                Try a different search term
                                            </Text>
                                            <TouchableOpacity
                                                style={[styles.clearSearchButton, { borderColor: colors.primary }]}
                                                onPress={() => setSearchQuery('')}
                                            >
                                                <Text style={[styles.clearSearchText, { color: colors.primary }]}>
                                                    Clear Search
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="chatbubbles-outline" size={48} color={colors.subtext} style={{ opacity: 0.5 }} />
                                            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                                No chats yet
                                            </Text>
                                            <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
                                                Start a new conversation to get going
                                            </Text>
                                        </>
                                    )}
                                </View>
                            }
                        />
                    )}

                    {/* Footer: User Profile & Settings */}
                    <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
                        <TouchableOpacity
                            style={styles.knowledgeButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setShowKnowledgeModal(true);
                            }}
                        >
                            <Ionicons name="library" size={20} color={colors.primary} />
                            <Text style={[styles.knowledgeText, { color: colors.text }]}>Knowledge Base</Text>
                            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                        </TouchableOpacity>

                        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

                        <TouchableOpacity
                            style={styles.userRow}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                onClose();
                                // @ts-ignore
                                navigation.navigate('Settings');
                            }}
                            accessibilityLabel="User profile and settings"
                            accessibilityRole="button"
                            accessibilityHint="View your account details and app settings"
                        >
                            <Image
                                source={require('../../../assets/icon.png')} // Fallback or user avatar
                                style={styles.userAvatar}
                            />
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: colors.text }]}>
                                    {user?.id === 'guest' ? 'Guest User' : user?.email?.split('@')[0] || 'User'}
                                </Text>
                                <Text style={[styles.userStatus, { color: colors.subtext }]}>
                                    {user?.id === 'guest' ? 'Free Plan' : 'Premium'}
                                </Text>
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={20} color={colors.subtext} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
            <KnowledgeBaseModal
                visible={showKnowledgeModal}
                onClose={() => setShowKnowledgeModal(false)}
                onSelectDocument={(doc) => {
                    onSelectContextDocument?.(doc);
                    setShowKnowledgeModal(false);
                    onClose(); // Close sidebar too
                }}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropTouch: {
        flex: 1,
    },
    drawer: {
        height: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        padding: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 40,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        height: '100%',
    },
    newChatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    folderTabsContainer: {
        marginBottom: 12,
    },
    folderTabsContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    folderTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    folderTabText: {
        fontSize: 12,
        fontWeight: '600',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    newChatText: {
        fontSize: 16,
        fontWeight: '600',
    },
    historyList: {
        flex: 1,
    },
    groupContainer: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    groupTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    historyItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    historyItemText: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
        marginRight: 8,
    },
    historyItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    historyItemTime: {
        fontSize: 11,
    },
    historyItemPreview: {
        fontSize: 13,
        opacity: 0.7,
    },
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 4,
        borderRadius: 8,
    },
    folderAction: {
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 4,
        borderRadius: 8,
    },
    footer: {
        padding: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 12,
    },
    knowledgeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        gap: 12,
    },
    knowledgeText: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.5,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ccc',
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
    },
    userStatus: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    clearSearchButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    clearSearchText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
