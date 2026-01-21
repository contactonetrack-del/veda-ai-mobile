import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { GlassView } from '../common/GlassView';
import { useFocusEffect } from '@react-navigation/native';
import { ProfileService } from '../../services/ProfileService';
import { useCallback, useState } from 'react';

interface ChatHeaderProps {
    onOpenSidebar: () => void;
    onNewChat: () => void;
    currentModel?: string;
    onStartVoice?: () => void;
}

export default function ChatHeader({ onOpenSidebar, onNewChat, currentModel = 'VEDA AI', onStartVoice }: ChatHeaderProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [profileAvatar, setProfileAvatar] = useState<string | null>(user?.photoURL || null);

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

    return (
        <GlassView
            intensity={80}
            border={false}
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    backgroundColor: colors.glass, // Use semi-transparent glass color
                    borderBottomColor: colors.glassBorder,
                    borderBottomWidth: 1,
                }
            ]}
        >
            <View
                style={styles.content}
                accessibilityRole="header"
            >
                {/* Left: Hamburger (Circular) */}
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onOpenSidebar();
                    }}
                    style={[styles.circleButton, { backgroundColor: isDark ? '#2F2F2F' : '#F7F7F8' }]}
                    accessibilityLabel="Open sidebar menu"
                    accessibilityRole="button"
                >
                    <Ionicons name="menu" size={24} color={colors.text} />
                </TouchableOpacity>

                {/* Center: Title (No Pill) */}
                <View
                    style={styles.titleContainer}
                    accessibilityLabel="Veda AI version 1.0"
                    accessible={true}
                >
                    <Text style={[styles.titleText, { color: colors.text }]}>Veda AI</Text>
                    <Text style={{ fontSize: 12, color: colors.subtext, marginLeft: 4 }}>v1.0</Text>
                </View>

                {/* Right: Profile & Voice */}
                <View style={styles.rightRow}>
                    {/* Voice Mode Button */}
                    {onStartVoice && (
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                onStartVoice();
                            }}
                            style={[styles.circleButton, { backgroundColor: isDark ? '#2F2F2F' : '#F7F7F8', marginRight: 8 }]}
                            accessibilityLabel="Start Voice Mode"
                            accessibilityRole="button"
                        >
                            <Ionicons name="headset" size={22} color={colors.text} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.navigate('Settings');
                        }}
                        style={[styles.circleButton, { backgroundColor: isDark ? '#2F2F2F' : '#F7F7F8', marginLeft: 8 }]}
                        accessibilityLabel="Open settings and profile"
                        accessibilityRole="button"
                    >

                        {profileAvatar ? (
                            <Image
                                source={{ uri: profileAvatar }}
                                style={{ width: 32, height: 32, borderRadius: 16 }}
                            />
                        ) : (
                            <Ionicons name="person" size={20} color={colors.text} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </GlassView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        // Removed borderBottomWidth for cleaner look
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: { // Cleanup old
        padding: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
    },
    modelSelector: { // Cleanup old
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    modelText: { // Cleanup old
        fontSize: 16,
    }
});
