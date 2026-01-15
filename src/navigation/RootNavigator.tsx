/**
 * Root Navigator
 * Handles top-level navigation (Tabs + Modals/Full-screen specific flows)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import MemoryScreen from '../screens/MemoryScreen';

export type RootStackParamList = {
    Main: undefined;
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
        >
            <Stack.Screen name="Main">
                {(props) => <TabNavigator {...props} onLogout={onLogout} />}
            </Stack.Screen>
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
