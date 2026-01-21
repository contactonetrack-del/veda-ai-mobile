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
    Animated,
    Easing,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    brand,
    spacing,
    typography,
    borderRadius,
    duration,
    shadows,
    opacity as designOpacity
} from '../config';
import { AnimatedButton } from '../components/common';

const { width, height } = Dimensions.get('window');

type AuthMode = 'login' | 'signup';

export default function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
    const { login, signup, loginAsGuest, signInWithGoogle } = useAuth();
    const { colors, isDark, toggleTheme, isReducedMotion } = useTheme();
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Biometric State
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(20)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            if (compatible && enrolled) {
                setIsBiometricSupported(true);
                const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
                if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setBiometricType(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
                } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                    setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
                }
            }
        })();
    }, []);

    useEffect(() => {
        // Reset animations on mode switch
        fadeAnim.setValue(0);
        formAnim.setValue(20);

        if (isReducedMotion) {
            fadeAnim.setValue(1);
            formAnim.setValue(0);
            return;
        }

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(formAnim, {
                toValue: 0,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 42000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            )
        ]).start();
    }, [mode]);

    // Validation functions
    const validateEmail = (email: string): string => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Invalid email format';
        return '';
    };

    const validatePassword = (password: string): string => {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const validateName = (name: string): string => {
        if (!name) return 'Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters';
        return '';
    };

    const calculatePasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength; // 0-5
    };

    const getPasswordStrengthLabel = (strength: number): string => {
        if (strength === 0) return 'Very Weak';
        if (strength === 1) return 'Weak';
        if (strength === 2) return 'Fair';
        if (strength === 3) return 'Good';
        if (strength === 4) return 'Strong';
        return 'Very Strong';
    };

    const getPasswordStrengthColor = (strength: number): string => {
        if (strength <= 1) return '#EF4444';
        if (strength === 2) return '#F59E0B';
        if (strength === 3) return '#10B981';
        return '#059669';
    };

    // Handle email change with validation
    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (emailTouched) {
            setEmailError(validateEmail(text));
        }
    };

    // Handle password change with validation
    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (mode === 'signup') {
            setPasswordStrength(calculatePasswordStrength(text));
        }
        if (passwordTouched) {
            setPasswordError(validatePassword(text));
        }
    };

    // Handle name change with validation
    const handleNameChange = (text: string) => {
        setName(text);
        if (nameTouched) {
            setNameError(validateName(text));
        }
    };

    async function handleSubmit() {
        // Validate all fields
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        const nameErr = mode === 'signup' ? validateName(name) : '';

        setEmailError(emailErr);
        setPasswordError(passwordErr);
        setNameError(nameErr);
        setEmailTouched(true);
        setPasswordTouched(true);
        setNameTouched(true);

        if (emailErr || passwordErr || nameErr) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

    async function handleBiometricAuth() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access Veda AI',
                fallbackLabel: 'Use Passcode',
                disableDeviceFallback: false,
            });

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // In a real app, retrieve token here. For now, simulate guest/quick login
                loginAsGuest();
                onSuccess();
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Biometric authentication failed');
        }
    }

    function switchMode() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMode(mode === 'login' ? 'signup' : 'login');
        // Reset validation state
        setEmailError('');
        setPasswordError('');
        setNameError('');
        setEmailTouched(false);
        setPasswordTouched(false);
        setNameTouched(false);
        setPasswordStrength(0);
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <TouchableOpacity
                style={[styles.themeToggle, {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    top: insets.top + spacing[4],
                }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTheme();
                }}
            >
                <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
            </TouchableOpacity>

            {/* Ambient Background Orbs */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <LinearGradient
                    colors={[brand.emerald[500] + '30', 'transparent']}
                    style={[styles.orb, { top: -100, left: -60, width: 300, height: 300 }]}
                />
                <LinearGradient
                    colors={[brand.violet[500] + '30', 'transparent']}
                    style={[styles.orb, { bottom: 0, right: -60, width: 350, height: 350 }]}
                />
                <LinearGradient
                    colors={['#F59E0B20', 'transparent']}
                    style={[styles.orb, { top: height / 3, right: -100, width: 250, height: 250 }]}
                />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, {
                        paddingTop: insets.top + spacing[12],
                        paddingBottom: insets.bottom + spacing[8]
                    }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                        <View style={[styles.logoWrapper, shadows.md]}>
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
                        <Text style={[styles.title, { color: colors.subtext }]}>VEDA AI</Text>
                    </Animated.View>

                    <Animated.View style={[
                        styles.authCardContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: formAnim }],
                            shadowColor: '#000',
                        }
                    ]}>
                        <BlurView
                            intensity={Platform.OS === 'ios' ? 40 : 100}
                            tint={isDark ? 'dark' : 'light'}
                            style={[
                                styles.authCard,
                                { borderColor: colors.cardBorder }
                            ]}
                        >
                            <Text style={[styles.modeTitle, { color: colors.text }]}>
                                {mode === 'login' ? "Welcome Back" : 'Join Veda AI'}
                            </Text>
                            <Text style={[styles.modeSubtitle, { color: colors.subtext }]}>
                                {mode === 'login' ? 'Continue your wellness journey' : 'Start your personalized growth journey'}
                            </Text>

                            <View style={styles.form}>
                                {mode === 'signup' && (
                                    <>
                                        <View style={[styles.inputWrapper, {
                                            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                            borderColor: nameTouched && nameError ? '#EF4444' : colors.inputBorder,
                                            borderWidth: nameTouched && nameError ? 2 : 1
                                        }]}>
                                            <Ionicons name="person-outline" size={20} color={colors.subtext} style={styles.inputIcon} />
                                            <TextInput
                                                style={[styles.input, { color: colors.text }]}
                                                placeholder="Full Name"
                                                placeholderTextColor={colors.placeholder}
                                                value={name}
                                                onChangeText={handleNameChange}
                                                onBlur={() => {
                                                    setNameTouched(true);
                                                    setNameError(validateName(name));
                                                }}
                                                autoCapitalize="words"
                                            />
                                            {nameTouched && !nameError && name && (
                                                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                            )}
                                        </View>
                                        {nameTouched && nameError ? (
                                            <Text style={styles.errorText}>{nameError}</Text>
                                        ) : null}
                                    </>
                                )}

                                <View style={[styles.inputWrapper, {
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                    borderColor: emailTouched && emailError ? '#EF4444' : colors.inputBorder,
                                    borderWidth: emailTouched && emailError ? 2 : 1
                                }]}>
                                    <Ionicons name="mail-outline" size={20} color={colors.subtext} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Email Address"
                                        placeholderTextColor={colors.placeholder}
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        onBlur={() => {
                                            setEmailTouched(true);
                                            setEmailError(validateEmail(email));
                                        }}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    {emailTouched && !emailError && email && (
                                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    )}
                                </View>
                                {emailTouched && emailError ? (
                                    <Text style={styles.errorText}>{emailError}</Text>
                                ) : null}

                                <View style={[styles.inputWrapper, {
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                    borderColor: passwordTouched && passwordError ? '#EF4444' : colors.inputBorder,
                                    borderWidth: passwordTouched && passwordError ? 2 : 1
                                }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.subtext} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Password"
                                        placeholderTextColor={colors.placeholder}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        onBlur={() => {
                                            setPasswordTouched(true);
                                            setPasswordError(validatePassword(password));
                                        }}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setShowPassword(!showPassword);
                                        }}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye" : "eye-off"}
                                            size={20}
                                            color={colors.subtext}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {passwordTouched && passwordError ? (
                                    <Text style={styles.errorText}>{passwordError}</Text>
                                ) : null}

                                {/* Password Strength Indicator (Signup only) */}
                                {mode === 'signup' && password.length > 0 && (
                                    <View style={styles.passwordStrengthContainer}>
                                        <View style={styles.strengthBarContainer}>
                                            <View style={[styles.strengthBar, {
                                                width: `${(passwordStrength / 5) * 100}%`,
                                                backgroundColor: getPasswordStrengthColor(passwordStrength)
                                            }]} />
                                        </View>
                                        <Text style={[styles.strengthLabel, { color: getPasswordStrengthColor(passwordStrength) }]}>
                                            {getPasswordStrengthLabel(passwordStrength)}
                                        </Text>
                                    </View>
                                )}

                                <AnimatedButton
                                    title={mode === 'login' ? 'Sign In' : 'Create Account'}
                                    onPress={handleSubmit}
                                    loading={loading}
                                    variant="primary"
                                    size="lg"
                                    style={styles.submitButton}
                                />

                                <TouchableOpacity onPress={switchMode} style={styles.switchButton}>
                                    <Text style={[styles.switchText, { color: colors.subtext }]}>
                                        {mode === 'login' ? "New here? " : "Already have an account? "}
                                        <Text style={[styles.switchTextBold, { color: colors.primary }]}>
                                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                        </Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </BlurView>
                    </Animated.View>

                    <View style={styles.dividerContainer}>
                        <View style={[styles.line, { backgroundColor: colors.divider }]} />
                        <Text style={[styles.dividerText, { color: colors.subtext }]}>OR</Text>
                        <View style={[styles.line, { backgroundColor: colors.divider }]} />
                    </View>

                    <View style={styles.socialActions}>
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
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
                            <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
                        </TouchableOpacity>

                        {isBiometricSupported && (
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}
                                onPress={handleBiometricAuth}
                            >
                                <Ionicons
                                    name="finger-print"
                                    size={22}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                            onPress={handleGuest}
                        >
                            <Ionicons name="person-circle" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.subtext }]}>
                            By continuing, you agree to our{' '}
                            <Text style={[styles.link, { color: colors.primary }]}>Terms</Text> &{' '}
                            <Text style={[styles.link, { color: colors.primary }]}>Privacy</Text>
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
        right: spacing[6],
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        zIndex: 10,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing[8],
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing[8],
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing[4],
        backgroundColor: 'transparent',
    },
    title: {
        ...typography.overline,
        opacity: 0.6,
    },
    authCardContainer: {
        width: '100%',
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
    authCard: {
        borderRadius: borderRadius.xl,
        padding: spacing[6],
        borderWidth: 1,
        overflow: 'hidden',
    },
    modeTitle: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: spacing[2],
    },
    modeSubtitle: {
        ...typography.body,
        textAlign: 'center',
        marginBottom: spacing[8],
        opacity: 0.8,
    },
    form: {
        width: '100%',
        gap: spacing[4],
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing[4],
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: spacing[3],
    },
    input: {
        flex: 1,
        ...typography.body,
        height: '100%',
    },
    eyeIcon: {
        padding: spacing[2],
    },
    submitButton: {
        marginTop: spacing[4],
    },
    switchButton: {
        marginTop: spacing[4],
        alignItems: 'center',
    },
    switchText: {
        ...typography.bodySmall,
    },
    switchTextBold: {
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing[8],
    },
    line: {
        flex: 1,
        height: 1,
        opacity: 0.5,
    },
    dividerText: {
        ...typography.overline,
        marginHorizontal: spacing[4],
        opacity: 0.5,
    },
    socialActions: {
        flexDirection: 'row',
        gap: spacing[4],
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    socialButtonText: {
        ...typography.buttonSmall,
        marginLeft: spacing[2],
    },
    footer: {
        marginTop: spacing[8],
        alignItems: 'center',
    },
    footerText: {
        ...typography.caption,
        textAlign: 'center',
    },
    link: {
        fontWeight: '600',
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.6,
        transform: [{ scale: 1.2 }],
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: -spacing[2],
        marginLeft: spacing[1],
    },
    passwordStrengthContainer: {
        marginTop: -spacing[2],
    },
    strengthBarContainer: {
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: spacing[1],
    },
    strengthBar: {
        height: '100%',
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'right',
    },
});
