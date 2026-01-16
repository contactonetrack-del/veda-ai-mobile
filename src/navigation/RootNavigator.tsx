/**
 * Root Navigator
 * Handles top-level navigation (Replacing Tabs with direct Stack)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Easing } from 'react-native';

// Screens
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import MemoryScreen from '../screens/MemoryScreen';
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
    Chat: undefined;
    Settings: undefined;
    EditProfile: undefined;
    About: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
    Memory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
    onLogout: () => void;
}

// Custom "Fluid Fade" Transition
const FluidTransition = {
    gestureDirection: 'horizontal' as const,
    transitionSpec: {
        open: {
            animation: 'timing' as const,
            config: {
                duration: 400,
                easing: Easing.out(Easing.poly(5)),
            },
        },
        close: {
            animation: 'timing' as const,
            config: {
                duration: 400,
                easing: Easing.out(Easing.poly(5)),
            },
        },
    },
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                    {
                        scale: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.95, 1],
                        }),
                    },
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                }),
            },
        };
    },
};

export default function RootNavigator({ onLogout }: RootNavigatorProps) {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...FluidTransition, // Apply custom transition globally
                contentStyle: { backgroundColor: colors.background },
            }}
            initialRouteName="Chat"
        >
            <Stack.Screen
                name="Chat"
                options={{
                    // specific override if needed, but FluidTransition is good
                }}
            >
                {(props) => <ChatScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>

            <Stack.Screen
                name="Settings"
                options={{
                    presentation: 'transparentModal', // Better for glass effects
                    animation: 'fade', // Modal fade often looks cleaner
                }}
            >
                {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>

            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsScreen} />

            <Stack.Screen
                name="Memory"
                component={MemoryScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
        </Stack.Navigator>
    );
}
