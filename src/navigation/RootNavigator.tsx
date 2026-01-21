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
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';

export type RootStackParamList = {
    Chat: { chatId?: string };
    Settings: undefined;
    EditProfile: undefined;
    About: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
    Memory: undefined;
    Profile: undefined;
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
            >
                {(props) => (
                    <ScreenErrorBoundary screenName="Chat">
                        <ChatScreen {...props} onLogout={onLogout} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen
                name="Settings"
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade',
                }}
            >
                {(props) => (
                    <ScreenErrorBoundary screenName="Settings">
                        <SettingsScreen {...props} onLogout={onLogout} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen
                name="EditProfile"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            >
                {(props) => (
                    <ScreenErrorBoundary screenName="EditProfile">
                        <EditProfileScreen {...props} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen name="About">
                {(props) => (
                    <ScreenErrorBoundary screenName="About">
                        <AboutScreen {...props} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen name="PrivacyPolicy">
                {(props) => (
                    <ScreenErrorBoundary screenName="PrivacyPolicy">
                        <PrivacyPolicyScreen {...props} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen name="TermsOfService">
                {(props) => (
                    <ScreenErrorBoundary screenName="TermsOfService">
                        <TermsScreen {...props} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen
                name="Memory"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            >
                {(props) => (
                    <ScreenErrorBoundary screenName="Memory">
                        <MemoryScreen {...props} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>

            <Stack.Screen
                name="Profile"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            >
                {(props) => (
                    <ScreenErrorBoundary screenName="Profile">
                        <ProfileScreen {...props} />
                    </ScreenErrorBoundary>
                )}
            </Stack.Screen>
        </Stack.Navigator>
    );
}
