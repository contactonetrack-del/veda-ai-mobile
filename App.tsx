/**
 * VEDA AI Mobile App
 * Main entry point with Tab Navigation
 */

import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/i18n'; // Initialize i18n
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
import { View, ActivityIndicator, StyleSheet, Image, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import BiometricLockScreen from './src/screens/BiometricLockScreen';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import NotificationManager from './src/services/NotificationManager';
import ProfileScreen from './src/screens/ProfileScreen';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { registerForPushNotificationsAsync, addNotificationListeners } from './src/services/NotificationService';
import * as Notifications from 'expo-notifications';
import linking from './src/navigation/linking';
import AnalyticsService from './src/services/AnalyticsService';

// Initialize crash reporting and analytics early
AnalyticsService.initSentry();
AnalyticsService.initAnalytics();

// Ignore specific deprecation warnings
LogBox.ignoreLogs([
  'expo-av is deprecated',
  'Support for defaultProps'
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();


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
      } catch (e) {
        console.warn(e);
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

  if (isFirstLaunch === null) {
    // Show loading indicator instead of null to prevent blank screen
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

  // Root Navigator logic
  if (user && (showApp || user.id !== 'none')) {
    return (
      <NavigationContainer linking={linking}>
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
}

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  // ... rest of the file

  React.useEffect(() => {
    let isMounted = true;



    async function prepare() {
      try {
        // Sync notifications on launch
        NotificationManager.syncNotifications().catch(err => console.log('Notification sync error:', err));

        // Preload critical assets with a timeout
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

        // Race between asset loading and a 3-second timeout
        await Promise.race([
          Promise.all([...cacheImages]),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);
      } catch (e) {
        console.warn('Asset preloading error:', e);
      } finally {
        if (isMounted) {
          setAppIsReady(true);
        }
      }
    }

    prepare();

    // Fallback: Force ready after 5 seconds no matter what
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('Splash screen timeout - forcing app ready');
        setAppIsReady(true);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Notification listeners
  React.useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) console.log('Push Token:', token);
    });

    const cleanup = addNotificationListeners(
      notification => {
        console.log('Notification Received:', notification);
      },
      response => {
        console.log('Notification Response:', response);
      }
    );

    return () => {
      cleanup();
    };
  }, []);

  // CRITICAL: Hide splash screen immediately when appIsReady becomes true
  React.useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Keep splash screen visible
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <StatusBar style="light" />
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
                <BiometricLockScreen />
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
