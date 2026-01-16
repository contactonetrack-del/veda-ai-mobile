/**
 * Root Navigator
 * Handles top-level navigation (Replacing Tabs with direct Stack)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import MemoryScreen from '../screens/MemoryScreen';

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

export default function RootNavigator({ onLogout }: RootNavigatorProps) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
            initialRouteName="Chat"
        >
            <Stack.Screen
                name="Chat"
                options={{
                    animation: 'fade', // Smooth fade for the main screen
                }}
            >
                {(props) => <ChatScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>

            <Stack.Screen
                name="Settings"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
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
