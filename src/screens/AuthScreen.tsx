/**
 * Auth Screen - Premium Re-design
 * Features: Compact layout, glassmorphism-inspired card, native Google Sign-in
 */

import React, { useState, useEffect, useRef } from 'react';
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
    Animated, // Added Animated
    Easing,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 60000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

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
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Theme Toggle Button */}
            <TouchableOpacity
                style={[styles.themeToggle, {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    top: insets.top + 20 // Dynamic top calculation
                }]}
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
                    contentContainerStyle={[styles.scrollContent, {
                        paddingTop: insets.top + 60, // Space for toggle
                        paddingBottom: insets.bottom + 20
                    }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={[styles.logoWrapper, {
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: 'transparent',
                            marginBottom: 24,
                            shadowColor: '#00BFFF',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.4,
                            shadowRadius: 20,
                            elevation: 12
                        }]}>
                            <Animated.Image
                                source={require('../../assets/veda-avatar.png')}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transform: [{
                                        rotate: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>VEDA AI</Text>
                    </View>

                    {/* Main Auth Form */}
                    <View style={styles.authCard}>
                        <Text style={[
                            styles.modeTitle,
                            { color: mode === 'login' ? colors.primary : colors.text }
                        ]}>
                            {mode === 'login' ? "India's First AI" : 'Create Account'}
                        </Text>
                        <Text style={[styles.modeSubtitle, { color: colors.subtext }]}>
                            {mode === 'login' ? 'Your Premium Wellness Companion' : 'Join our premium wellness community'}
                        </Text>

                        <View style={styles.form}>
                            {mode === 'signup' && (
                                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                    <Ionicons name="person-outline" size={20} color={colors.subtext} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Full Name"
                                        placeholderTextColor={colors.subtext}
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </View>
                            )}

                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="mail-outline" size={20} color={colors.subtext} style={styles.inputIcon} />
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
                                <Ionicons name="lock-closed-outline" size={20} color={colors.subtext} style={styles.inputIcon} />
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
                                        size={20}
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
                        <View style={[styles.line, { backgroundColor: colors.text }]} />
                        <Text style={[styles.dividerText, { color: colors.subtext }]}>OR CONTINUE WITH</Text>
                        <View style={[styles.line, { backgroundColor: colors.text }]} />
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: 'transparent', borderColor: colors.cardBorder }
                            ]}
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
                            <Ionicons name="logo-google" size={20} color={colors.text} />
                            <Text style={[styles.actionButtonText, { color: colors.text }]}>Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: 'transparent', borderColor: colors.cardBorder }
                            ]}
                            onPress={handleGuest}
                        >
                            <Ionicons name="person-circle-outline" size={22} color={colors.text} />
                            <Text style={[styles.actionButtonText, { color: colors.text }]}>Guest</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer - fixed nesting */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.subtext }]}>
                            By signing in, you agree to our{' '}
                            <Text style={[styles.link, { color: colors.primary }]}>Terms</Text> &{' '}
                            <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>
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
    },
    themeToggle: {
        position: 'absolute',
        right: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        // Minimalist toggle
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 40, // Increased to make inputs shorter/less wide
    },
    header: {
        alignItems: 'center',
        marginBottom: 16, // Reduced from 32
    },
    logoWrapper: {
        width: 64,
        height: 64,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 0,
        shadowOpacity: 0,
    },
    logoGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: 0.5,
        marginBottom: 0,
    },
    authCard: {
        backgroundColor: 'transparent',
        padding: 0,
        marginBottom: 12,
    },
    modeTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
        textAlign: 'center',
    },
    modeSubtitle: {
        fontSize: 15,
        opacity: 0.7,
        marginBottom: 16, // Reduced from 32
        textAlign: 'center',
    },
    form: {
        width: '100%',
        gap: 12, // Reduced from 16
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 14,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    primaryButton: {
        marginTop: 8,
        borderRadius: 14,
        overflow: 'hidden',
        height: 50,
        elevation: 0,
    },
    buttonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    switchButton: {
        marginTop: 16, // Reduced from 24
        alignItems: 'center',
    },
    switchText: {
        fontSize: 15,
    },
    switchTextBold: {
        fontWeight: '700',
    },
    secondaryActions: {
        width: '100%',
        marginTop: 16, // Reduced from 24
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16, // Reduced from 24
    },
    // divider style is likely unused now, can be removed or ignored.
    line: {
        flex: 1,
        height: 1,
        opacity: 0.1,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '700',
        marginHorizontal: 16,
        letterSpacing: 1.5,
        opacity: 0.5,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 10,
    },
    footer: {
        marginTop: 16, // Reduced from 32
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 18,
    },
    link: {
        textDecorationLine: 'none',
        fontWeight: '600',
    },
});
