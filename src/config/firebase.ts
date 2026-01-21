/**
 * Firebase Configuration for VEDA AI Mobile
 */

import { initializeApp } from 'firebase/app';
// @ts-ignore: Firebase types compatibility
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Validate Firebase Config to avoid crashes on missing env vars
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Defensive Initialization
let app: any, auth: any, db: any;
try {
    if (!firebaseConfig.apiKey) {
        console.error("❌ Firebase API Key is missing! Check your environment variables.");
    }
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
    db = getFirestore(app);
} catch (error) {
    console.error("🔥 Firebase Initialization Error:", error);
}

export { app, auth, db };
