import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen'; // Check import path
import ProfileScreen from '../screens/ProfileScreen'; // Keep for legacy or if needed temporarily
import EditProfileScreen from '../screens/EditProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';

export type ProfileStackParamList = {
    SettingsHome: undefined;
    ProfileHome: undefined; // Deprecated route name, keeping for safety if referenced elsewhere
    EditProfile: undefined;
    About: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
    Memory: undefined; // Add this if referenced in Settings
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

interface ProfileStackNavigatorProps {
    onLogout: () => void;
}

export default function ProfileStackNavigator({ onLogout }: ProfileStackNavigatorProps) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="SettingsHome">
                {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsScreen} />
        </Stack.Navigator>
    );
}
