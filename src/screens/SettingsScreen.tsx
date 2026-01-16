import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsRow from '../components/settings/SettingsRow';
import VoiceSettingsModal, { VoiceSettings, DEFAULT_VOICE_SETTINGS } from '../components/VoiceSettingsModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_LANGUAGES } from '../services/api';

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

    // Initial load of voice settings
    React.useEffect(() => {
        AsyncStorage.getItem('voiceSettings').then(saved => {
            if (saved) setVoiceSettings(JSON.parse(saved));
        });
    }, []);

    const handleSaveVoice = (newSettings: VoiceSettings) => {
        setVoiceSettings(newSettings);
        AsyncStorage.setItem('voiceSettings', JSON.stringify(newSettings));
    };

    // Cycle theme: system -> light -> dark
    const handleThemeToggle = () => {
        const nextTheme = themePreference === 'system' ? 'light' : themePreference === 'light' ? 'dark' : 'system';
        setThemePreference(nextTheme);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>

                {/* Personalization Section */}
                <SettingsSection title="Personalization">
                    <SettingsRow
                        label="Theme"
                        icon="moon" // or contrast-outline
                        value={themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}
                        onPress={handleThemeToggle}
                    />
                    <SettingsRow
                        label="Voice"
                        icon="mic"
                        value={`${voiceSettings.gender === 'male' ? 'Male' : 'Female'} • ${voiceSettings.rate}x`}
                        onPress={() => setShowVoiceSettings(true)}
                    />
                    <SettingsRow
                        label="Language"
                        icon="language"
                        value={SUPPORTED_LANGUAGES[language]?.name || 'English'}
                        onPress={() => Alert.alert('Language', 'Please change language from the Chat screen header for now.')}
                        isLast
                    />
                </SettingsSection>

                {/* Data Controls Section */}
                <SettingsSection title="Data Controls">
                    <SettingsRow
                        label="Memory Bank"
                        icon="server-outline"
                        value="Manage"
                        onPress={() => navigation.navigate('Memory')}
                    />
                    <SettingsRow
                        label="Export History"
                        icon="download-outline"
                        onPress={() => Alert.alert('Export', 'Export functionality coming soon.')}
                    />
                    <SettingsRow
                        label="Clear All Chats"
                        icon="trash-outline"
                        color="#EF4444"
                        onPress={() => Alert.alert(
                            'Clear History',
                            'Are you sure you want to delete all chat history? This cannot be undone.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete all') }
                            ]
                        )}
                        isLast
                    />
                </SettingsSection>

                {/* Account Section */}
                <SettingsSection title="Account">
                    <SettingsRow
                        label="Edit Profile"
                        icon="person-circle-outline"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <SettingsRow
                        label="Subscription"
                        icon="star-outline"
                        value={user?.id === 'guest' ? 'Free' : 'Premium'}
                        onPress={() => Alert.alert('Subscription', 'Manage your subscription via the web portal.')}
                    />
                    <SettingsRow
                        label="About VEDA AI"
                        icon="information-circle-outline"
                        onPress={() => navigation.navigate('About')}
                    />
                    <SettingsRow
                        label="Log Out"
                        icon="log-out-outline"
                        onPress={onLogout}
                        isLast
                    />
                </SettingsSection>

                <Text style={[styles.versionText, { color: colors.subtext }]}>
                    VEDA AI v1.0.0 • Build 2026.01.16
                </Text>

            </ScrollView>

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
    header: {
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
        marginBottom: 40,
    }
});
