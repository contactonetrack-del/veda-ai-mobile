/**
 * Tab Navigator - Premium Bottom Tab Navigation (ChatGPT-style)
 * Simplified: Chat + Profile only
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatScreen from '../screens/ChatScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
    onLogout: () => void;
}

export default function TabNavigator({ onLogout }: TabNavigatorProps) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.cardBorder,
                    height: 65 + insets.bottom,
                    paddingTop: 10,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.subtext,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}
            screenListeners={{
                tabPress: () => {
                    Haptics.selectionAsync();
                },
            }}
        >
            <Tab.Screen
                name="Home"
                options={{
                    tabBarLabel: 'Chat',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                            <MaterialCommunityIcons
                                name="meditation"
                                size={22}
                                color={color}
                            />
                        </View>
                    ),
                }}
            >
                {() => <ChatScreen onLogout={onLogout} />}
            </Tab.Screen>

            <Tab.Screen
                name="Profile"
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconWrapper, focused && styles.activeIconWrapper]}>
                            <Ionicons
                                name="person"
                                size={20}
                                color={color}
                            />
                        </View>
                    ),
                }}
            >
                {() => <ProfileStackNavigator onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        width: 36,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    activeIconWrapper: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
});


