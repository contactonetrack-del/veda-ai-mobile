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
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface SidebarDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85; // 85% width like ChatGPT

export default function SidebarDrawer({ isOpen, onClose, onNewChat, onSelectChat }: SidebarDrawerProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Open/Close Animation
    useEffect(() => {
        if (isOpen) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
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

    const [historyGroups, setHistoryGroups] = useState<{ title: string; items: any[] }[]>([]);

    useEffect(() => {
        if (isOpen && user?.id !== 'guest') {
            loadHistory();
        } else if (isOpen && user?.id === 'guest') {
            setHistoryGroups([{ title: 'Guest Session', items: [{ id: 'local', title: 'Current Session', time: 'Now' }] }]);
        }
    }, [isOpen, user]);

    const loadHistory = async () => {
        try {
            // Import dynamically to avoid circular deps if any, or just use imported api
            const chats = await require('../../services/api').getChats();
            // Group logic (simplified for now)
            setHistoryGroups([
                {
                    title: 'Recent Chats',
                    items: chats.map((c: any) => ({
                        id: c.id,
                        title: c.title || 'New Chat',
                        time: new Date(c.created_at).toLocaleDateString()
                    }))
                }
            ]);
        } catch (e) {
            console.log('Failed to load history', e);
        }
    };

    if (!isOpen && typeof slideAnim === 'object') {
        // Force render if open, otherwise rely on translation to hide off-screen 
        // effectively optimizing render when fully closed/off-screen is not strictly necessary due to Modal 
        // But since we aren't using a Modal for the drawer content itself (custom viz), 
        // we might handle visibility.
        // Actually, let's use a Modal for the whole overlay to handle z-index easily.
    }

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
                    <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
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
                        <View style={[styles.searchBox, { backgroundColor: colors.inputBg }]}>
                            <Ionicons name="search" size={20} color={colors.subtext} />
                            <Text style={{ color: colors.subtext, marginLeft: 8 }}>Search chats...</Text>
                        </View>
                    </View>

                    {/* Chat History List */}
                    <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                        {/* ChatGPT-style: New Chat Item prominently? Usually in header or fab. 
                             We'll put detailed items here. */}

                        <TouchableOpacity
                            style={[styles.newChatRow, { borderColor: colors.cardBorder }]}
                            onPress={() => {
                                onNewChat();
                                onClose();
                            }}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#FFF' : '#000' }]}>
                                <Ionicons name="add" size={20} color={isDark ? '#000' : '#FFF'} />
                            </View>
                            <Text style={[styles.newChatText, { color: colors.text }]}>New Chat</Text>
                        </TouchableOpacity>

                        {historyGroups.map((group, index) => (
                            <View key={index} style={styles.groupContainer}>
                                <Text style={[styles.groupTitle, { color: colors.subtext }]}>{group.title}</Text>
                                {group.items.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.historyItem}
                                        onPress={() => onSelectChat(item.id)}
                                    >
                                        <Text
                                            style={[styles.historyItemText, { color: colors.text }]}
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>

                    {/* Footer: User Profile & Settings */}
                    <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
                        <TouchableOpacity
                            style={styles.userRow}
                            onPress={() => {
                                onClose();
                                // @ts-ignore
                                navigation.navigate('Settings');
                            }}
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
        padding: 10,
        borderRadius: 8,
    },
    newChatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
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
    },
    historyItemText: {
        fontSize: 15,
        fontWeight: '400',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
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
    }
});
