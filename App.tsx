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
import AuthScreen from './src/screens/AuthScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [showApp, setShowApp] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Error Handling Wrapper
  try {
    // If user is authenticated or showApp is true, show main app
    if (user && showApp) {
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
            <StatusBar style="light" />
            <AppContent />
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
