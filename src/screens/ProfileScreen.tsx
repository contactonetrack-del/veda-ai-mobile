/**
 * Profile Screen - User Settings & Info
 * Now with real settings that persist via AsyncStorage
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Switch,
    Modal,
    Linking,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../services/api';
import NotificationService from '../services/NotificationService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileScreenProps {
    onLogout: () => void;
}

// Language display names - English with native in parentheses
const LANGUAGE_NAMES: Record<LanguageCode, string> = {
    en: 'English',
    hi: 'Hindi (हिंदी)',
    bho: 'Bhojpuri (भोजपुरी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    bn: 'Bengali (বাংলা)',
    or: 'Odia (ଓଡ଼ିଆ)',
    mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)',
};

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
    const { user } = useAuth();
    const isGuest = user?.id === 'guest';
    const { language: selectedLanguage, setLanguage, t } = useLanguage();
    const { colors, theme, toggleTheme, isDark } = useTheme();

    // Settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState(user?.name || 'User');

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
                if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');

                // Load avatar and name from AsyncStorage
                if (user?.id) {
                    const savedAvatar = await AsyncStorage.getItem(`user_avatar_${user.id}`);
                    const savedName = await AsyncStorage.getItem(`user_name_${user.id}`);
                    if (savedAvatar) setAvatar(savedAvatar);
                    if (savedName) setDisplayName(savedName);
                }
            } catch (error) {
                console.log('Error loading settings:', error);
            }
        };
        loadSettings();
    }, [user?.id]);

    // Handle language change
    const handleLanguageChange = async (lang: LanguageCode) => {
        await setLanguage(lang);
        setShowLanguageModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    // Handle notification toggle
    const handleNotificationToggle = async (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (value) {
            // User wants to enable notifications
            try {
                const token = await NotificationService.registerForPushNotificationsAsync();

                if (!token) {
                    // Permission denied
                    Alert.alert(
                        t('notifications'),
                        'Please enable notifications in your device settings to receive updates.',
                        [{ text: 'OK' }]
                    );
                    setNotificationsEnabled(false);
                    return;
                }

                // Permission granted
                setNotificationsEnabled(true);
                await AsyncStorage.setItem('notificationsEnabled', 'true');

                // Schedule a test notification
                await NotificationService.scheduleNotification(
                    t('app_name'),
                    'Notifications enabled! We will keep you updated on your wellness journey.',
                    1 // 1 second later
                );

            } catch (error) {
                console.log('Error enabling notifications:', error);
                setNotificationsEnabled(false);
            }
        } else {
            // User wants to disable
            setNotificationsEnabled(false);
            await AsyncStorage.setItem('notificationsEnabled', 'false');
            await NotificationService.cancelAllNotifications();
        }
    };

    // Open external links
    const openLink = (url: string, title: string) => {
        Linking.openURL(url).catch(() => {
            Alert.alert(title, 'This will be available soon!');
        });
    };

    function handleLogout() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLogout();
    }

    const navigation = useNavigation();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Header */}
            <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <Ionicons name="person-circle" size={24} color={colors.primary} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile')}</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                <TouchableOpacity
                    style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => navigation.navigate('EditProfile' as never)}
                >
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImage} />
                    ) : (
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.avatarContainer}
                        >
                            <Ionicons
                                name={isGuest ? "person-outline" : "person"}
                                size={40}
                                color="#fff"
                            />
                        </LinearGradient>
                    )}
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {isGuest ? t('guest_user') : displayName}
                        </Text>
                        <Text style={[styles.userEmail, { color: colors.subtext }]}>
                            {isGuest ? t('limited_access') : (user?.email || '')}
                        </Text>
                        {isGuest ? (
                            <View style={styles.guestBadge}>
                                <Text style={styles.guestBadgeText}>{t('five_free_msgs')}</Text>
                            </View>
                        ) : (
                            <Text style={[styles.editProfileText, { color: colors.primary }]}>{t('tap_to_edit')}</Text>
                        )}
                    </View>
                    {!isGuest && (
                        <Ionicons name="chevron-forward" size={20} color="#64748B" />
                    )}
                </TouchableOpacity>

                {/* Settings Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{t('settings')}</Text>

                    <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        {/* Language Setting */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => setShowLanguageModal(true)}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="language" size={20} color="#3B82F6" />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t('language')}</Text>
                            <Text style={[styles.menuItemValue, { color: colors.subtext }]}>{LANGUAGE_NAMES[selectedLanguage]}</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                        </TouchableOpacity>

                        <View style={[styles.menuDivider, { backgroundColor: colors.cardBorder }]} />

                        {/* Notifications Toggle */}
                        <View style={styles.menuItem}>
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="notifications" size={20} color="#F59E0B" />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t('notifications')}</Text>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={handleNotificationToggle}
                                trackColor={{ false: colors.inputBorder, true: colors.primary }}
                                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <View style={[styles.menuDivider, { backgroundColor: colors.cardBorder }]} />

                        {/* Theme Toggle */}
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                toggleTheme();
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                                <MaterialCommunityIcons
                                    name={isDark ? "weather-night" : "weather-sunny"}
                                    size={20}
                                    color={isDark ? "#818CF8" : "#F59E0B"}
                                />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t('theme')}</Text>
                            <Text style={[styles.menuItemValue, { color: colors.subtext }]}>
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{t('about')}</Text>

                    <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('About' as never)}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="information-circle" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t('about_veda')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                        </TouchableOpacity>

                        <View style={[styles.menuDivider, { backgroundColor: colors.cardBorder }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="document-text" size={20} color={colors.subtext} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t('privacy_policy')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                        </TouchableOpacity>

                        <View style={[styles.menuDivider, { backgroundColor: colors.cardBorder }]} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('TermsOfService' as never)}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                                <Ionicons name="shield-checkmark" size={20} color={colors.subtext} />
                            </View>
                            <Text style={[styles.menuItemText, { color: colors.text }]}>{t('terms_of_service')}</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text style={styles.logoutButtonText}>
                        {isGuest ? t('sign_in_up') : t('logout')}
                    </Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.versionText}>{t('app_name')} v1.0.0 (Beta)</Text>

            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_language')}</Text>
                            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                                <Ionicons name="close" size={24} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.languageList}>
                            {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                                <TouchableOpacity
                                    key={code}
                                    style={[
                                        styles.languageItem,
                                        { backgroundColor: colors.background },
                                        selectedLanguage === code && {
                                            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                            borderColor: colors.primary,
                                            borderWidth: 1
                                        }
                                    ]}
                                    onPress={() => handleLanguageChange(code as LanguageCode)}
                                >
                                    <Text style={[
                                        styles.languageItemText,
                                        { color: colors.text },
                                        selectedLanguage === code && { color: colors.primary, fontWeight: '600' }
                                    ]}>
                                        {name}
                                    </Text>
                                    {selectedLanguage === code && (
                                        <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F8FAFC',
        marginLeft: 12,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    // User Card
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        padding: 20,
        marginBottom: 24,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 70,
        height: 70,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    userEmail: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 2,
    },
    guestBadge: {
        backgroundColor: '#FCD34D20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    guestBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FCD34D',
    },
    editProfileText: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 4,
        fontWeight: '500',
    },
    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuCard: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#1E293B',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        color: '#E2E8F0',
    },
    menuItemValue: {
        fontSize: 14,
        color: '#64748B',
        marginRight: 8,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#1E293B',
        marginLeft: 62,
    },
    disabledItem: {
        opacity: 0.5,
    },
    disabledText: {
        color: '#475569',
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: 14,
        padding: 14,
        marginTop: 8,
    },
    logoutButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#EF4444',
        marginLeft: 8,
    },
    // Version
    versionText: {
        textAlign: 'center',
        color: '#475569',
        fontSize: 12,
        marginTop: 20,
        marginBottom: 40,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0F172A',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#F8FAFC',
    },
    languageList: {
        padding: 16,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#1E293B',
    },
    languageItemSelected: {
        backgroundColor: '#10B98120',
        borderWidth: 1,
        borderColor: '#10B981',
    },
    languageItemText: {
        fontSize: 16,
        color: '#E2E8F0',
    },
    languageItemTextSelected: {
        color: '#10B981',
        fontWeight: '600',
    },
});
