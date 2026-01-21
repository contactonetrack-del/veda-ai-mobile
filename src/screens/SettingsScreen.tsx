import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Image, Switch, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { GlassView } from '../components/common/GlassView';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsRow from '../components/settings/SettingsRow';
import UsageStats from '../components/settings/UsageStats';
import VoiceSettingsModal, { VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../components/VoiceSettingsModal';
import NotificationManager from '../services/NotificationManager';
import LanguageSettingsModal from '../components/LanguageSettingsModal';
import BiometricService from '../services/BiometricService';
import { ProfileService } from '../services/ProfileService';
import { LANGUAGES } from '../services/LanguageService';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import { shadows } from '../config/colors';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'> & {
    onLogout: () => void;
};

export default function SettingsScreen({ onLogout, navigation }: SettingsScreenProps) {
    const { colors, isDark, setThemePreference, themePreference } = useTheme();
    const { user } = useAuth();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    // Local state for modals/settings
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [dailyReminders, setDailyReminders] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [hapticsEnabled, setHapticsEnabled] = useState(true);

    // New Feature States
    const [showLanguageSettings, setShowLanguageSettings] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);

    // Profile State
    const [profileAvatar, setProfileAvatar] = useState<string | null>(user?.photoURL || null);

    // Refresh profile when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                if (user?.id) {
                    const profile = await ProfileService.getProfile(user.id);
                    if (profile.avatar) {
                        setProfileAvatar(profile.avatar);
                    } else if (user.photoURL) {
                        setProfileAvatar(user.photoURL);
                    }
                }
            };
            loadProfile();
        }, [user?.id, user?.photoURL])
    );
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

            // Check Biometrics
            const bioAvail = await BiometricService.hasHardwareAsync();
            setBiometricAvailable(bioAvail);
            if (bioAvail) {
                const bioEnabled = await BiometricService.isLockEnabled();
                setBiometricEnabled(bioEnabled);
            }
        };
        loadSettings();
    }, []);

    const saveSetting = async <T,>(key: string, value: T, setter: (val: T) => void) => {
        setter(value);
        // 1. Save locally immediately (Optimistic UI)
        await AsyncStorage.setItem(key, JSON.stringify(value));
        Haptics.selectionAsync();

        if (key === 'dailyReminders') {
            await NotificationManager.syncNotifications();
        }

        // 2. Sync to Cloud (Fire and Forget)
        if (user?.id !== 'guest') {
            try {
                // Map local keys to backend preference structure
                const payload = {
                    preferences: {
                        [key]: value
                    }
                };
                api.updateUserProfile(payload).catch((err: unknown) => console.log('Cloud sync failed:', err));
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

    const handleBiometricToggle = async (value: boolean) => {
        const success = await BiometricService.setLockEnabled(value);
        if (success) {
            setBiometricEnabled(value);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>{t('settings.subtitle')}</Text>
        </Animated.View>
    );

    const renderProfileCard = () => {
        const displayName = user?.name || user?.email?.split('@')[0] || 'User';
        const isGuest = user?.id === 'guest';
        // Use context subscription tier if available, fall back to guest logic
        const subTier = user?.subscriptionTier || (isGuest ? 'free' : 'pro');
        const planName = t(`settings.profile.${subTier}_plan`);

        return (
            <View
                style={[styles.profileCard, { backgroundColor: isDark ? colors.card : '#FFF', borderColor: colors.cardBorder }]}
                accessibilityLabel={`Profile card for ${displayName}`}
                accessible={true}
            >
                <LinearGradient
                    colors={isDark ? ['#334155', '#1e293b'] : ['#E2E8F0', '#F8FAFC']}
                    style={styles.profileBackground}
                />

                <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => navigation.navigate('Profile' as never)}
                >
                    <Image
                        source={profileAvatar ? { uri: profileAvatar } : require('../../assets/icon.png')}
                        style={styles.avatar}
                        accessibilityLabel="Your profile picture"
                    />
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: colors.text }]}>
                            {displayName}
                        </Text>
                        <View
                            style={[
                                styles.planBadge,
                                { backgroundColor: planName.includes('FREE') ? colors.subtext : '#6366F1' }
                            ]}
                            accessibilityLabel={`Subscription plan: ${planName}`}
                        >
                            <Text style={styles.planText}>{planName}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

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
    };

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
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.appearance')}</Text>
                </View>
                <GlassView style={[styles.cardContainer, styles.glassCardOverride]}>
                    <SettingsRow
                        label={t('settings.items.dark_mode')}
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
                        label={t('settings.items.voice_settings')}
                        icon="mic-outline"
                        value={`${voiceSettings.gender === 'male' ? t('settings.voice.gender_male') : t('settings.voice.gender_female')} • ${voiceSettings.speed ?? 1}x`}
                        onPress={() => setShowVoiceSettings(true)}
                        accessibilityHint="Adjust AI voice gender and speech speed"
                        isLast
                    />
                </GlassView>

                {/* Insights */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.insights')}</Text>
                </View>
                <UsageStats />


                {/* Notifications */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.notifications')}</Text>
                </View>
                <GlassView style={[styles.cardContainer, styles.glassCardOverride]}>
                    <SettingsRow
                        label={t('settings.items.push_notifications')}
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
                        label={t('settings.items.daily_reminders')}
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
                </GlassView>

                {/* Accessibility */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.accessibility')}</Text>
                </View>
                <GlassView style={[styles.cardContainer, styles.glassCardOverride]}>
                    <SettingsRow
                        label={t('settings.items.reduce_motion')}
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
                        label={t('settings.items.haptic_feedback')}
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
                        label={t('settings.items.high_contrast')}
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
                </GlassView>

                {/* Security */}
                {biometricAvailable && (
                    <>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.security')}</Text>
                        </View>
                        <GlassView style={[styles.cardContainer, styles.glassCardOverride]}>
                            <SettingsRow
                                label={t('settings.items.app_lock')}
                                icon="scan-outline" // Use scan-outline for biometric detection look
                                value={biometricEnabled ? t('common.on') : t('common.off')}
                                isLast
                                rightElement={
                                    <Switch
                                        value={biometricEnabled}
                                        onValueChange={handleBiometricToggle}
                                        trackColor={{ false: '#767577', true: colors.primary }}
                                    />
                                }
                            />
                        </GlassView>
                    </>
                )}


                {/* General */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.general')}</Text>
                </View>
                <GlassView style={[styles.cardContainer, styles.glassCardOverride]}>
                    <SettingsRow
                        label={t('common.language')}
                        icon="language-outline"
                        value={LANGUAGES.find(l => l.code === language)?.nativeName || 'English'}
                        onPress={() => setShowLanguageSettings(true)}
                    />
                    <SettingsRow
                        label={t('settings.items.memory_bank')}
                        icon="hardware-chip-outline"
                        value={t('common.manage')}
                        onPress={() => navigation.navigate('Memory')}
                        isLast
                    />
                </GlassView>

                {/* Account Actions */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('settings.sections.account')}</Text>
                </View>
                <GlassView style={[styles.cardContainer, styles.glassCardOverride]}>
                    <SettingsRow
                        label={t('settings.items.clear_history')}
                        icon="trash-outline"
                        color={colors.error}
                        onPress={() => Alert.alert(
                            t('settings.actions.clear_history_confirm_title'),
                            t('settings.actions.clear_history_confirm_body'),
                            [
                                { text: t('common.cancel'), style: 'cancel' },
                                {
                                    text: t('common.delete'),
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await AsyncStorage.multiRemove(['chat_sessions', 'current_chat', 'chat_messages']);
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                            Alert.alert(t('common.success'), t('settings.actions.clear_history_success'));
                                        } catch (error) {
                                            Alert.alert(t('common.error'), t('settings.actions.clear_history_error'));
                                        }
                                    }
                                }

                            ]
                        )}
                    />
                    <SettingsRow
                        label={t('settings.items.log_out')}
                        icon="log-out-outline"
                        color={colors.error}
                        onPress={onLogout}
                        isLast
                    />
                </GlassView>

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

            <LanguageSettingsModal
                visible={showLanguageSettings}
                onClose={() => setShowLanguageSettings(false)}
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
        marginBottom: 24,
        overflow: 'hidden',
    },
    glassCardOverride: {
        // Additional styles if needed, e.g. border handled by GlassView
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 10,
        marginBottom: 40,
        opacity: 0.6,
    }
});
