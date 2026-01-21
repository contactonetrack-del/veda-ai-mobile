import * as Sentry from '@sentry/react-native';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebaseConfig';

// Initialize Sentry for crash reporting
export const initSentry = () => {
    Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
        debug: __DEV__,
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
    });
};

// Capture exception with Sentry
export const captureException = (error: Error, context?: Record<string, any>) => {
    if (context) {
        Sentry.setContext('extra', context);
    }
    Sentry.captureException(error);
};

// Capture message with Sentry
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level);
};

// Set user context for Sentry
export const setUser = (id: string, email?: string, username?: string) => {
    Sentry.setUser({ id, email, username });
};

// Clear user context
export const clearUser = () => {
    Sentry.setUser(null);
};

// Firebase Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;

export const initAnalytics = () => {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.warn('Firebase Analytics initialization failed:', error);
    }
};

// Track screen views
export const trackScreen = (screenName: string, screenClass?: string) => {
    if (analytics) {
        logEvent(analytics, 'screen_view', {
            firebase_screen: screenName,
            firebase_screen_class: screenClass || screenName,
        });
    }
};

// Track custom events
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (analytics) {
        logEvent(analytics, eventName, params);
    }
};

// Track chat events
export const trackChatEvent = (action: 'send_message' | 'receive_response' | 'voice_input' | 'vision_analysis', metadata?: Record<string, any>) => {
    trackEvent(`chat_${action}`, {
        ...metadata,
        timestamp: Date.now(),
    });
};

// Track errors
export const trackError = (errorType: string, errorMessage: string) => {
    trackEvent('app_error', {
        error_type: errorType,
        error_message: errorMessage,
    });
    captureMessage(`${errorType}: ${errorMessage}`, 'error');
};

export default {
    initSentry,
    initAnalytics,
    captureException,
    captureMessage,
    setUser,
    clearUser,
    trackScreen,
    trackEvent,
    trackChatEvent,
    trackError,
};
