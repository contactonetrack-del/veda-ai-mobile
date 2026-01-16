/**
 * VEDA AI Mobile App
 * Main entry point with Tab Navigation
 */

import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();


function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [showApp, setShowApp] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  const [appIsReady, setAppIsReady] = useState(false);

  React.useEffect(() => {
    async function prepare() {
      try {
        // Preload assets
        const imageAssets = [
          require('./assets/onboarding-1.png'),
          require('./assets/onboarding-2.png'),
          require('./assets/onboarding-3.png'),
          require('./assets/veda-avatar.png'),
          require('./assets/veda-premium-icon.png'),
        ];

        const cacheImages = imageAssets.map(image => {
          return Asset.fromModule(image).downloadAsync();
        });

        await Promise.all([...cacheImages]);

        // Artificial delay for splash screen if needed, or just let it finish
        // await new Promise(resolve => setTimeout(resolve, 2000));

        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (e) {
        console.warn(e);
        setIsFirstLaunch(false); // Default to main app on error to avoid active blocking
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);


  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || isFirstLaunch === null) {
    return null; // SplashScreen is visible
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
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
      </GestureHandlerRootView>
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
