/**
 * Profile Stack Navigator - Nested navigation for Profile tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';

export type ProfileStackParamList = {
    ProfileHome: undefined;
    EditProfile: undefined;
    About: undefined;
    PrivacyPolicy: undefined;
    TermsOfService: undefined;
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
            <Stack.Screen name="ProfileHome">
                {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsScreen} />
        </Stack.Navigator>
    );
}
