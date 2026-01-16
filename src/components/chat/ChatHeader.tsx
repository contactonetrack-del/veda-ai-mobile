import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

interface ChatHeaderProps {
    onOpenSidebar: () => void;
    onNewChat: () => void;
    currentModel?: string;
}

export default function ChatHeader({ onOpenSidebar, onNewChat, currentModel = 'VEDA AI' }: ChatHeaderProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background,
                paddingTop: insets.top,
                borderBottomColor: isDark ? '#2F2F2F' : '#E5E5E5',
            }
        ]}>
            <View
                style={styles.content}
                accessibilityRole="header"
            >
                {/* Left: Hamburger (Circular) */}
                <TouchableOpacity
                    onPress={onOpenSidebar}
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

                {/* Right: Profile */}
                <View style={styles.rightRow}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings')}
                        style={[styles.circleButton, { backgroundColor: isDark ? '#2F2F2F' : '#F7F7F8', marginLeft: 8 }]}
                        accessibilityLabel="Open settings and profile"
                        accessibilityRole="button"
                    >
                        {user?.photoURL ? (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={{ width: 32, height: 32, borderRadius: 16 }}
                            />
                        ) : (
                            <Ionicons name="person" size={20} color={colors.text} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
