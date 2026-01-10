/**
 * Auth Context with Firebase Authentication
 * Manages real authentication state across the app
 * Uses expo-auth-session for Expo Go compatibility
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    updateProfile,
    GoogleAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface User {
    id: string;
    email: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    loginAsGuest: () => void;
    signInWithGoogle: () => Promise<void>;
    authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || undefined,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    // Expo Auth Session for Google Sign-in (works in Expo Go)
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: '247809272190-h2hkif95rb4ub2qsbes3nk8j8ogdtj32.apps.googleusercontent.com',
        androidClientId: '247809272190-g7nb702c4p2e7clpp5m7nn1ijq7r8ff9.apps.googleusercontent.com',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setIsLoading(true);
            signInWithCredential(auth, credential)
                .catch(error => {
                    const message = getErrorMessage(error.code);
                    setAuthError(message);
                    setIsLoading(false);
                });
        }
    }, [response]);

    // Listen to Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(mapFirebaseUser(firebaseUser));
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    async function login(email: string, password: string) {
        setAuthError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(mapFirebaseUser(userCredential.user));
        } catch (error: any) {
            const message = getErrorMessage(error.code);
            setAuthError(message);
            throw new Error(message);
        }
    }

    async function signup(email: string, password: string, name?: string) {
        setAuthError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name if provided
            if (name && userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
            }

            setUser({
                id: userCredential.user.uid,
                email: userCredential.user.email || '',
                name: name,
            });
        } catch (error: any) {
            const message = getErrorMessage(error.code);
            setAuthError(message);
            throw new Error(message);
        }
    }

    async function logout() {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    function loginAsGuest() {
        setUser({
            id: 'guest',
            email: 'guest@veda.ai',
            name: 'Guest User',
        });
    }

    async function signInWithGoogle() {
        setAuthError(null);
        try {
            const result = await promptAsync();
            if (result.type !== 'success') {
                if (result.type === 'cancel') {
                    throw new Error('Sign-in cancelled.');
                }
                return;
            }
            // The response useEffect will handle the credential exchange
        } catch (error: any) {
            setAuthError('Google Sign-in failed. Please try again.');
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: user !== null,
                login,
                signup,
                logout,
                loginAsGuest,
                signInWithGoogle,
                authError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// Firebase error code to user-friendly message
function getErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Try logging in.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-credential':
            return 'Invalid credentials. Please check your email and password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return 'An error occurred. Please try again.';
    }
}
