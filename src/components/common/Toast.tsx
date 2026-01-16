/**
 * Toast - Premium Notification Component
 * Features: Animated entrance/exit, variants, auto-dismiss, action button
 */

import React, { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, semantic } from '../../config/colors';
import { borderRadius, spacing } from '../../config/spacing';
import { duration, easing } from '../../config/animations';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top' | 'bottom';

interface ToastConfig {
    id: string;
    message: string;
    variant?: ToastVariant;
    duration?: number;
    action?: {
        label: string;
        onPress: () => void;
    };
}

interface ToastContextType {
    show: (config: Omit<ToastConfig, 'id'>) => void;
    hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Icons for each variant
const variantIcons: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
    success: 'checkmark-circle',
    error: 'close-circle',
    warning: 'warning',
    info: 'information-circle',
};

// Individual Toast Component
function ToastItem({
    config,
    onHide,
    position,
}: {
    config: ToastConfig;
    onHide: () => void;
    position: ToastPosition;
}) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const [isVisible, setIsVisible] = useState(true);

    const variant = config.variant || 'info';
    const autoDismiss = config.duration !== 0;
    const dismissDuration = config.duration || 4000;

    const variantColors = {
        success: { bg: semantic.success.bg, icon: isDark ? semantic.success.dark : semantic.success.light },
        error: { bg: semantic.error.bg, icon: isDark ? semantic.error.dark : semantic.error.light },
        warning: { bg: semantic.warning.bg, icon: isDark ? semantic.warning.dark : semantic.warning.light },
        info: { bg: semantic.info.bg, icon: isDark ? semantic.info.dark : semantic.info.light },
    };

    const currentVariant = variantColors[variant];

    useEffect(() => {
        // Haptic feedback on show
        if (variant === 'error') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else if (variant === 'success') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Animate in
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: duration.normal,
                easing: easing.easeOutCubic,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: duration.normal,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        if (autoDismiss) {
            const timer = setTimeout(() => {
                handleHide();
            }, dismissDuration);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleHide = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: position === 'top' ? -100 : 100,
                duration: duration.fast,
                easing: easing.easeInCubic,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: duration.fast,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            onHide();
        });
    };

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.toast,
                shadows.lg,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    transform: [{ translateY }],
                    opacity,
                    [position === 'top' ? 'top' : 'bottom']:
                        position === 'top' ? insets.top + 16 : insets.bottom + 16,
                },
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: currentVariant.bg }]}>
                <Ionicons
                    name={variantIcons[variant]}
                    size={20}
                    color={currentVariant.icon}
                />
            </View>

            <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
                {config.message}
            </Text>

            {config.action && (
                <TouchableOpacity
                    onPress={() => {
                        config.action?.onPress();
                        handleHide();
                    }}
                    style={styles.actionButton}
                >
                    <Text style={[styles.actionText, { color: colors.primary }]}>
                        {config.action.label}
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleHide} style={styles.closeButton}>
                <Ionicons name="close" size={18} color={colors.subtext} />
            </TouchableOpacity>
        </Animated.View>
    );
}

// Toast Provider
export function ToastProvider({
    children,
    position = 'top',
}: {
    children: React.ReactNode;
    position?: ToastPosition;
}) {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const show = useCallback((config: Omit<ToastConfig, 'id'>) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { ...config, id }]);
    }, []);

    const hide = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ show, hide }}>
            {children}
            <View style={[styles.container, position === 'bottom' && styles.containerBottom]} pointerEvents="box-none">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        config={toast}
                        onHide={() => hide(toast.id)}
                        position={position}
                    />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    containerBottom: {
        top: undefined,
        bottom: 0,
    },
    toast: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    actionButton: {
        marginLeft: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
});

export default ToastProvider;
