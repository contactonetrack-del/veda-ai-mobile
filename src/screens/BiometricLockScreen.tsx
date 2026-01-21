import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, AppState, AppStateStatus } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import BiometricService from '../services/BiometricService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BiometricLockScreen() {
    const { colors, isDark } = useTheme();
    const [isLocked, setIsLocked] = useState(false);
    const [biometryType, setBiometryType] = useState<string>('Fingerprint');
    const insets = useSafeAreaInsets();

    // Animations
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const rippleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        checkLockStatus();

        // Listen for app state changes to re-lock if needed (optional, for stricter security)
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, []);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
            checkLockStatus();
        }
    };

    const checkLockStatus = async () => {
        const enabled = await BiometricService.isLockEnabled();
        if (enabled) {
            setIsLocked(true);
            authenticate();

            // Get biometric type name
            const types = await BiometricService.getBiometricType();
            if (types.includes(2)) setBiometryType('Face ID');
            else if (types.includes(1)) setBiometryType('Touch ID');
        } else {
            setIsLocked(false);
        }
    };

    const authenticate = async () => {
        startPulseAnimation();

        const result = await BiometricService.authenticate();
        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            unlockApp();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            stopPulseAnimation();
        }
    };

    const unlockApp = () => {
        Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.ease // Corrected easing
        }).start(() => {
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => setIsLocked(false));
        });
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease) // Corrected easing usage
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease) // Corrected easing usage
                })
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(rippleAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease) // Corrected easing usage
                }),
                Animated.timing(rippleAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true
                })
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        pulseAnim.setValue(0);
        rippleAnim.setValue(0);
    };

    if (!isLocked) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Background Blur */}
            <BlurView
                intensity={95}
                tint={isDark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>Veda AI</Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>Locked for your security</Text>

                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => {
                            Haptics.selectionAsync();
                            authenticate();
                        }}
                        activeOpacity={0.8}
                    >
                        {/* Ripple Effect */}
                        <Animated.View style={[
                            styles.ripple,
                            {
                                borderColor: colors.primary,
                                opacity: rippleAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 0]
                                }),
                                transform: [{
                                    scale: rippleAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 2.5]
                                    })
                                }]
                            }
                        ]} />

                        {/* Fingerprint Icon */}
                        <Animated.View style={{
                            transform: [{ scale: scaleAnim }],
                            opacity: pulseAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.7, 1]
                            })
                        }}>
                            <Ionicons
                                name="finger-print"
                                size={80}
                                color={colors.primary}
                            />
                        </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={authenticate}>
                        <Text style={[styles.hint, { color: colors.primary }]}>
                            Tap to use {biometryType}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.subtext }]}>Privacy Protected</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 60,
        fontWeight: '500',
    },
    iconContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        position: 'relative',
    },
    ripple: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 60,
        borderWidth: 2,
    },
    hint: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
    },
    footerText: {
        fontSize: 12,
        opacity: 0.6,
    }
});
