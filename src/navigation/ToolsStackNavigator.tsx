/**
 * Tools Stack Navigator - Nested navigation for Tools tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ToolsScreen from '../screens/ToolsScreen';
import CalorieCounterScreen from '../screens/CalorieCounterScreen';
import InsuranceEstimatorScreen from '../screens/InsuranceEstimatorScreen';
import SnapThaliScreen from '../screens/SnapThaliScreen';

export type ToolsStackParamList = {
    ToolsHome: undefined;
    CalorieCounter: undefined;
    InsuranceEstimator: undefined;
    SnapThali: undefined;
};

const Stack = createNativeStackNavigator<ToolsStackParamList>();

export default function ToolsStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="ToolsHome" component={ToolsScreen} />
            <Stack.Screen name="CalorieCounter" component={CalorieCounterScreen} />
            <Stack.Screen name="InsuranceEstimator" component={InsuranceEstimatorScreen} />
            <Stack.Screen name="SnapThali" component={SnapThaliScreen} />
        </Stack.Navigator>
    );
}
