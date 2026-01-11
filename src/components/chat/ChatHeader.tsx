/**
 * Chat Header Component
 * Extracted from ChatScreen for maintainability
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ChatHeaderProps {
    isGuest: boolean;
    guestRemaining: number;
    selectedLanguage: string;
    languageDisplayName: string;
    voiceGender: 'male' | 'female';
    onVoiceGenderToggle: () => void;
    onLanguagePress: () => void;
    onLogout: () => void;
    colors: any;
    isDark: boolean;
}

export default function ChatHeader({
    isGuest,
    guestRemaining,
    languageDisplayName,
    voiceGender,
    onVoiceGenderToggle,
    onLanguagePress,
    onLogout,
    colors,
}: ChatHeaderProps) {
    return (
        <LinearGradient colors={[colors.card, colors.background]} style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.headerLeft}>
                <View style={styles.headerLogoWrapper}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.headerLogo}>
                        <MaterialCommunityIcons name="meditation" size={22} color="#fff" />
                    </LinearGradient>
                </View>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>VEDA AI</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
                        {isGuest ? `Guest • ${guestRemaining} left` : 'Premium Member'}
                    </Text>
                </View>
            </View>

            <View style={styles.headerRight}>
                {/* Voice Gender Toggle */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.selectionAsync();
                        onVoiceGenderToggle();
                    }}
                    style={[styles.genderButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                >
                    <Ionicons
                        name={voiceGender === 'female' ? "woman" : "man"}
                        size={16}
                        color={voiceGender === 'female' ? "#EC4899" : "#3B82F6"}
                    />
                </TouchableOpacity>

                {/* Language Selector */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.selectionAsync();
                        onLanguagePress();
                    }}
                    style={[styles.languageButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                >
                    <Text style={[styles.languageButtonText, { color: colors.text }]}>
                        {languageDisplayName.slice(0, 3)}
                    </Text>
                    <Ionicons name="language" size={16} color={colors.subtext} />
                </TouchableOpacity>

                <TouchableOpacity onPress={onLogout} style={[styles.logoutButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <Ionicons name="power-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        paddingTop: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        backgroundColor: '#0F172A',
        zIndex: 10,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerLogoWrapper: {
        marginRight: 12,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    headerLogo: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC' },
    headerSubtitle: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    genderButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#334155',
    },
    languageButtonText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', marginRight: 4 },
    logoutButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
