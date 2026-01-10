/**
 * Auth Screen - Premium Re-design
 * Features: Compact layout, glassmorphism-inspired card, native Google Sign-in
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

export default function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
    const { login, signup, loginAsGuest, signInWithGoogle } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit() {
        if (!email || !password || (mode === 'signup' && !name)) {
            Alert.alert('Required', 'Please fill in all fields');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await signup(email, password, name);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSuccess();
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    }

    function handleGuest() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        loginAsGuest();
        onSuccess();
    }

    function switchMode() {
        Haptics.selectionAsync();
        setMode(mode === 'login' ? 'signup' : 'login');
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={isDark ? ['#020617', '#0F172A', '#020617'] : [colors.background, colors.card, colors.background]}
                style={StyleSheet.absoluteFill}
            />
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

            {/* Theme Toggle Button */}
            <TouchableOpacity
                style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTheme();
                }}
            >
                <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Compact Header */}
                    <View style={styles.header}>
                        <View style={styles.logoWrapper}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.logoGradient}
                            >
                                <MaterialCommunityIcons name="meditation" size={36} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>VEDA AI</Text>
                        <Text style={[styles.tagline, { color: colors.subtext }]}>Premium Wellness Companion</Text>
                    </View>

                    {/* Main Auth Card */}
                    <View style={[styles.authCard, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.modeTitle, { color: colors.text }]}>
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </Text>
                        <Text style={[styles.modeSubtitle, { color: colors.subtext }]}>
                            {mode === 'login' ? 'Sign in to continue your journey' : 'Join our premium wellness community'}
                        </Text>

                        <View style={styles.form}>
                            {mode === 'signup' && (
                                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                    <Ionicons name="person-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Full Name"
                                        placeholderTextColor={colors.subtext}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>
                            )}

                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="mail-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Email Address"
                                    placeholderTextColor={colors.subtext}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="lock-closed-outline" size={18} color={colors.subtext} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Password"
                                    placeholderTextColor={colors.subtext}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={18}
                                        color={colors.subtext}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>
                                            {mode === 'login' ? 'Sign In' : 'Sign Up'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={switchMode} style={styles.switchButton}>
                                <Text style={[styles.switchText, { color: colors.subtext }]}>
                                    {mode === 'login' ? "New here? " : "Joined before? "}
                                    <Text style={[styles.switchTextBold, { color: colors.primary }]}>
                                        {mode === 'login' ? 'Create Account' : 'Sign In'}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Compact Social & Guest Section */}
                    <View style={styles.secondaryActions}>
                        <View style={styles.divider}>
                            <View style={[styles.line, { backgroundColor: colors.cardBorder }]} />
                            <Text style={[styles.dividerText, { color: colors.subtext }]}>OR QUICK CONNECT</Text>
                            <View style={[styles.line, { backgroundColor: colors.cardBorder }]} />
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.googleBtn]}
                                onPress={async () => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    try {
                                        await signInWithGoogle();
                                        onSuccess();
                                    } catch (err: any) {
                                        if (err.message !== 'Sign-in cancelled.') {
                                            Alert.alert('Google Sign-In', err.message);
                                        }
                                    }
                                }}
                            >
                                <Ionicons name="logo-google" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.guestBtn]}
                                onPress={handleGuest}
                            >
                                <Ionicons name="person-circle-outline" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Guest</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By signing in, you agree to our{' '}
                            <Text style={styles.link}>Terms</Text> &{' '}
                            <Text style={styles.link}>Privacy</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    themeToggle: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        zIndex: 100,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoWrapper: {
        width: 72,
        height: 72,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 10,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    logoGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#F8FAFC',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 4,
    },
    authCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(71, 85, 105, 0.3)',
        marginBottom: 24,
    },
    modeTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F8FAFC',
        marginBottom: 4,
    },
    modeSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        marginBottom: 24,
    },
    form: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderRadius: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#F8FAFC',
        fontSize: 15,
        paddingVertical: 14,
    },
    eyeIcon: {
        padding: 4,
    },
    primaryButton: {
        marginTop: 8,
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    switchButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    switchText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    switchTextBold: {
        color: '#10B981',
        fontWeight: '700',
    },
    secondaryActions: {
        width: '100%',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#1E293B',
    },
    dividerText: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '800',
        marginHorizontal: 12,
        letterSpacing: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    actionButtonText: {
        color: '#F8FAFC',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    googleBtn: {
        backgroundColor: '#1E293B',
    },
    guestBtn: {
        backgroundColor: '#1E293B',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        color: '#64748B',
        fontSize: 11,
    },
    link: {
        color: '#94A3B8',
        textDecorationLine: 'underline',
    },
});
