/**
 * AnimatedButton - Premium Reusable Button Component
 * Features: Press animation, gradient support, loading state, haptic feedback
 */

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
    Animated,
    ViewStyle,
    TextStyle,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { gradients, shadows } from '../../config/colors';
import { borderRadius, touchTarget } from '../../config/spacing';
import { typography } from '../../config/typography';
import { duration, easing, transforms } from '../../config/animations';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    hapticFeedback?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
}

const sizeStyles = {
    sm: {
        height: 40,
        paddingHorizontal: 16,
        fontSize: 14,
        iconSize: 16,
    },
    md: {
        height: 48,
        paddingHorizontal: 20,
        fontSize: 16,
        iconSize: 18,
    },
    lg: {
        height: 56,
        paddingHorizontal: 24,
        fontSize: 18,
        iconSize: 20,
    },
};

export default function AnimatedButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    textStyle,
    hapticFeedback = true,
    gradientColors,
}: AnimatedButtonProps) {
    const { colors, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const sizeConfig = sizeStyles[size];

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: transforms.pressedScale,
            duration: duration.fast,
            easing: easing.easeOut,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: duration.fast,
            easing: easing.easeOutBack,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress();
    };

    const getVariantStyles = (): { container: ViewStyle; text: TextStyle; useGradient: boolean } => {
        switch (variant) {
            case 'primary':
                return {
                    container: {},
                    text: { color: '#FFFFFF' },
                    useGradient: true,
                };
            case 'secondary':
                return {
                    container: {
                        backgroundColor: isDark ? colors.card : colors.inputBg,
                    },
                    text: { color: colors.text },
                    useGradient: false,
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: colors.primary,
                    },
                    text: { color: colors.primary },
                    useGradient: false,
                };
            case 'ghost':
                return {
                    container: {
                        backgroundColor: 'transparent',
                    },
                    text: { color: colors.primary },
                    useGradient: false,
                };
            case 'danger':
                return {
                    container: {
                        backgroundColor: colors.error,
                    },
                    text: { color: '#FFFFFF' },
                    useGradient: false,
                };
            default:
                return {
                    container: {},
                    text: { color: '#FFFFFF' },
                    useGradient: true,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const isDisabled = disabled || loading;
    const finalGradientColors = gradientColors || gradients.primary;

    const buttonContent = (
        <View style={styles.content}>
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variantStyles.text.color as string}
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={sizeConfig.iconSize}
                            color={variantStyles.text.color as string}
                            style={styles.iconLeft}
                        />
                    )}
                    <Text
                        style={[
                            styles.text,
                            { fontSize: sizeConfig.fontSize },
                            variantStyles.text,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={sizeConfig.iconSize}
                            color={variantStyles.text.color as string}
                            style={styles.iconRight}
                        />
                    )}
                </>
            )}
        </View>
    );

    return (
        <Animated.View
            style={[
                { transform: [{ scale: scaleAnim }] },
                fullWidth && styles.fullWidth,
            ]}
        >
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
                style={[
                    styles.button,
                    {
                        height: sizeConfig.height,
                        paddingHorizontal: sizeConfig.paddingHorizontal,
                        opacity: isDisabled ? 0.5 : 1,
                    },
                    variantStyles.container,
                    !variantStyles.useGradient && shadows.sm,
                    style,
                ]}
            >
                {variantStyles.useGradient ? (
                    <LinearGradient
                        colors={finalGradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[StyleSheet.absoluteFill, styles.gradient]}
                    />
                ) : null}
                {buttonContent}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.button,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    gradient: {
        borderRadius: borderRadius.button,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    fullWidth: {
        width: '100%',
    },
});
