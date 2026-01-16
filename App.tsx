/**
 * VEDA AI Mobile App
 * Main entry point with Tab Navigation
 */

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';
import ToastProvider from './src/components/common/Toast';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [showApp, setShowApp] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  React.useEffect(() => {
    async function checkFirstLaunch() {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
    }
    checkFirstLaunch();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  if (isLoading || isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Show onboarding if it's the first launch
  if (isFirstLaunch) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  // Error Handling Wrapper
  try {
    // If user is authenticated or showApp is true, show main app
    if (user && (showApp || user.id !== 'none')) {
      // Note: user.id !== 'none' is a safety check if your context defaults to a dummy user
      return (
        <NavigationContainer>
          <RootNavigator
            onLogout={async () => {
              await logout();
              setShowApp(false);
            }}
          />
        </NavigationContainer>
      );
    }

    // Show auth screen
    return (
      <AuthScreen
        onSuccess={() => setShowApp(true)}
      />
    );
  } catch (error) {
    console.error("💥 Critical App Error:", error);
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <StatusBar style="light" />
              <AppContent />
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
});
