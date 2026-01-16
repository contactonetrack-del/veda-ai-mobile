import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Image, Switch, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsRow from '../components/settings/SettingsRow';
import UsageStats from '../components/settings/UsageStats';
import VoiceSettingsModal, { VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../components/VoiceSettingsModal';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import { shadows } from '../config/colors';

interface SettingsScreenProps {
    onLogout: () => void;
    navigation: any;
}

export default function SettingsScreen({ onLogout, navigation }: SettingsScreenProps) {
    const { colors, isDark, setThemePreference, themePreference } = useTheme();
    const { user } = useAuth();
    const { language, setLanguage } = useLanguage();
    const insets = useSafeAreaInsets();

    // Local state for modals/settings
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [dailyReminders, setDailyReminders] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);

    // Initial load
    useEffect(() => {
        const loadSettings = async () => {
            const savedVoice = await AsyncStorage.getItem('voiceSettings');
            if (savedVoice) setVoiceSettings(JSON.parse(savedVoice));

            const savedNotifs = await AsyncStorage.getItem('notificationsEnabled');
            if (savedNotifs !== null) setNotificationsEnabled(JSON.parse(savedNotifs));

            const savedReminders = await AsyncStorage.getItem('dailyReminders');
            if (savedReminders !== null) setDailyReminders(JSON.parse(savedReminders));

            const savedMotion = await AsyncStorage.getItem('reducedMotion');
            if (savedMotion !== null) setReducedMotion(JSON.parse(savedMotion));

            const savedHaptics = await AsyncStorage.getItem('hapticsEnabled');
            if (savedHaptics !== null) setHapticsEnabled(JSON.parse(savedHaptics));
        };
        loadSettings();
    }, []);

    const saveSetting = async (key: string, value: any, setter: (val: any) => void) => {
        setter(value);
        // 1. Save locally immediately (Optimistic UI)
        await AsyncStorage.setItem(key, JSON.stringify(value));
        Haptics.selectionAsync();

        // 2. Sync to Cloud (Fire and Forget)
        if (user?.id !== 'guest') {
            try {
                // Map local keys to backend preference structure
                const payload = {
                    preferences: {
                        [key]: value
                    }
                };
                api.updateUserProfile(payload).catch((err: any) => console.log('Cloud sync failed:', err));
            } catch (e) {
                // Error handled in the catch above
            }
        }
    };


    const handleSaveVoice = (newSettings: VoiceSettings) => {
        setVoiceSettings(newSettings);
        AsyncStorage.setItem('voiceSettings', JSON.stringify(newSettings));
    };

    // Cycle theme: system -> light -> dark
    const handleThemeToggle = () => {
        const nextTheme = themePreference === 'system' ? 'light' : themePreference === 'light' ? 'dark' : 'system';
        setThemePreference(nextTheme);
    };

    const scrollY = useRef(new Animated.Value(0)).current;

    const renderHeader = () => (
        <Animated.View style={[styles.headerContainer, {
            opacity: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0],
                extrapolate: 'clamp',
            }),
            transform: [{
                translateY: scrollY.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, -20],
                    extrapolate: 'clamp',
                }),
            }]
        }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>Preferences & Account</Text>
        </Animated.View>
    );

    const renderProfileCard = () => (
        <View
            style={[styles.profileCard, { backgroundColor: isDark ? colors.card : '#FFF', ...shadows.md }]}
            accessibilityLabel={`Profile card for ${user?.id === 'guest' ? 'Guest User' : user?.email?.split('@')[0] || 'User'}`}
            accessible={true}
        >
            <LinearGradient
                colors={isDark ? ['#334155', '#1e293b'] : ['#E2E8F0', '#F8FAFC']}
                style={styles.profileBackground}
            />
            <Image
                source={require('../../assets/icon.png')}
                style={styles.avatar}
                accessibilityLabel="Your profile picture"
            />
            <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                    {user?.id === 'guest' ? 'Guest User' : user?.email?.split('@')[0] || 'User'}
                </Text>
                <View
                    style={styles.planBadge}
                    accessibilityLabel={`Subscription plan: ${user?.id === 'guest' ? 'Free Plan' : 'PRO'}`}
                >
                    <Text style={styles.planText}>{user?.id === 'guest' ? 'Free Plan' : 'PRO'}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
                accessibilityLabel="Edit profile"
                accessibilityRole="button"
            >
                <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {renderHeader()}
                {renderProfileCard()}

                {/* Personalization */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>APPEARANCE</Text>
                </View>
                <View style={[styles.cardContainer, { backgroundColor: isDark ? colors.card : '#FFF', ...shadows.sm }]}>
                    <SettingsRow
                        label="Dark Mode"
                        icon="moon"
                        value={undefined}
                        isLast={false}
                        rightElement={
                            <Switch
                                value={isDark}
                                onValueChange={(val) => {
                                    Haptics.selectionAsync();
                                    setThemePreference(val ? 'dark' : 'light');
                                }}
                                trackColor={{ false: '#767577', true: colors.primary }}
                                thumbColor={'#f4f3f4'}
                            />
                        }
                    />
                    <SettingsRow
                        label="Voice Settings"
                        icon="mic-outline"
                        value={`${voiceSettings.gender === 'male' ? 'Male' : 'Female'} • ${voiceSettings.rate}x`}
                        onPress={() => setShowVoiceSettings(true)}
                        accessibilityHint="Adjust AI voice gender and speech speed"
                        isLast
                    />
                </View>

                {/* Insights */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>INSIGHTS</Text>
                </View>
                <UsageStats />


                {/* Notifications */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>NOTIFICATIONS</Text>
                </View>
                <View style={[styles.cardContainer, { backgroundColor: isDark ? colors.card : '#FFF', ...shadows.sm }]}>
                    <SettingsRow
                        label="Push Notifications"
                        icon="notifications-outline"
                        value={undefined}
                        rightElement={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={(val) => saveSetting('notificationsEnabled', val, setNotificationsEnabled)}
                                trackColor={{ false: '#767577', true: colors.primary }}
                            />
                        }
                    />
                    <SettingsRow
                        label="Daily Reminders"
                        icon="alarm-outline"
                        value={undefined}
                        isLast
                        rightElement={
                            <Switch
                                value={dailyReminders}
                                onValueChange={(val) => saveSetting('dailyReminders', val, setDailyReminders)}
                                trackColor={{ false: '#767577', true: colors.primary }}
                            />
                        }
                    />
                </View>

                {/* Accessibility */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>ACCESSIBILITY</Text>
                </View>
                <View style={[styles.cardContainer, { backgroundColor: isDark ? colors.card : '#FFF', ...shadows.sm }]}>
                    <SettingsRow
                        label="Reduce Motion"
                        icon="move-outline"
                        value={undefined}
                        rightElement={
                            <Switch
                                value={reducedMotion}
                                onValueChange={(val) => saveSetting('reducedMotion', val, setReducedMotion)}
                                trackColor={{ false: '#767577', true: colors.primary }}
                            />
                        }
                    />
                    <SettingsRow
                        label="Haptic Feedback"
                        icon="finger-print-outline"
                        value={undefined}
                        rightElement={
                            <Switch
                                value={hapticsEnabled}
                                onValueChange={(val) => saveSetting('hapticsEnabled', val, setHapticsEnabled)}
                                trackColor={{ false: '#767577', true: colors.primary }}
                            />
                        }
                    />
                    <SettingsRow
                        label="High Contrast Mode"
                        icon="contrast-outline"
                        value={undefined}
                        isLast
                        rightElement={
                            <Switch
                                value={themePreference === 'highContrast'}
                                onValueChange={(val) => {
                                    Haptics.selectionAsync();
                                    setThemePreference(val ? 'highContrast' : 'dark');
                                }}
                                trackColor={{ false: '#767577', true: colors.primary }}
                            />
                        }
                    />
                </View>


                {/* General */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>GENERAL</Text>
                </View>
                <View style={[styles.cardContainer, { backgroundColor: isDark ? colors.card : '#FFF', ...shadows.sm }]}>
                    <SettingsRow
                        label="Language"
                        icon="language-outline"
                        value={api.SUPPORTED_LANGUAGES[language]?.name || 'English'}
                        onPress={() => Alert.alert('Language', 'Please change language from the Chat screen header.')}
                    />
                    <SettingsRow
                        label="Memory Bank"
                        icon="hardware-chip-outline"
                        value="Manage"
                        onPress={() => navigation.navigate('Memory')}
                        isLast
                    />
                </View>

                {/* Account Actions */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>ACCOUNT</Text>
                </View>
                <View style={[styles.cardContainer, { backgroundColor: isDark ? colors.card : '#FFF', ...shadows.sm }]}>
                    <SettingsRow
                        label="Clear History"
                        icon="trash-outline"
                        color={colors.error}
                        onPress={() => Alert.alert(
                            'Clear History',
                            'Delete all chat history permanently?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await AsyncStorage.multiRemove(['chat_sessions', 'current_chat', 'chat_messages']);
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                            Alert.alert('Success', 'Chat history cleared successfully');
                                        } catch (error) {
                                            Alert.alert('Error', 'Failed to clear history');
                                        }
                                    }
                                }

                            ]
                        )}
                    />
                    <SettingsRow
                        label="Log Out"
                        icon="log-out-outline"
                        color={colors.error}
                        onPress={onLogout}
                        isLast
                    />
                </View>

                <Text style={[styles.versionText, { color: colors.subtext }]}>
                    VEDA AI v1.2.0 • Build 2026.01.16
                </Text>

            </Animated.ScrollView>

            <VoiceSettingsModal
                visible={showVoiceSettings}
                onClose={() => setShowVoiceSettings(false)}
                currentSettings={voiceSettings}
                onSave={handleSaveVoice}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    headerContainer: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 32,
        overflow: 'hidden',
        position: 'relative',
    },
    profileBackground: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    planBadge: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    planText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
    },
    sectionTitleContainer: {
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.2,
    },
    cardContainer: {
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 40,
        opacity: 0.6,
    }
});
