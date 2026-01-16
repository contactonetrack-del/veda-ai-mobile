/**
 * TypingIndicator - Animated AI Typing Feedback Component
 * Features: Three animated dots with wave pattern, avatar integration
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, avatarSize } from '../../config/spacing';
import { duration } from '../../config/animations';

interface TypingIndicatorProps {
    showAvatar?: boolean;
    dotColor?: string;
    dotSize?: number;
}

export default function TypingIndicator({
    showAvatar = true,
    dotColor,
    dotSize = 8,
}: TypingIndicatorProps) {
    const { colors, isDark } = useTheme();

    // Animation values for each dot
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const finalDotColor = dotColor || colors.primary;

    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animation1 = animateDot(dot1, 0);
        const animation2 = animateDot(dot2, 150);
        const animation3 = animateDot(dot3, 300);

        animation1.start();
        animation2.start();
        animation3.start();

        return () => {
            animation1.stop();
            animation2.stop();
            animation3.stop();
        };
    }, []);

    const getAnimatedStyle = (dot: Animated.Value) => {
        return {
            transform: [
                {
                    translateY: dot.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                    }),
                },
            ],
            opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
            }),
        };
    };

    return (
        <View style={styles.container}>
            {showAvatar && (
                <View style={styles.avatarContainer}>
                    <Image
                        source={require('../../../assets/veda-avatar.png')}
                        style={styles.avatar}
                        resizeMode="contain"
                    />
                </View>
            )}

            <View style={[
                styles.bubble,
                {
                    backgroundColor: isDark ? colors.card : colors.inputBg,
                },
            ]}>
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: finalDotColor, width: dotSize, height: dotSize },
                        getAnimatedStyle(dot1),
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: finalDotColor, width: dotSize, height: dotSize },
                        getAnimatedStyle(dot2),
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: finalDotColor, width: dotSize, height: dotSize },
                        getAnimatedStyle(dot3),
                    ]}
                />
            </View>
        </View>
    );
}

// Alternative: Pulsing dots version
export function TypingIndicatorPulse({
    showAvatar = true,
    dotColor,
    dotSize = 8,
}: TypingIndicatorProps) {
    const { colors, isDark } = useTheme();

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.6)).current;

    const finalDotColor = dotColor || colors.primary;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: duration.pulse / 2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: duration.pulse / 2,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.parallel([
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: duration.pulse / 2,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 0.6,
                        duration: duration.pulse / 2,
                        useNativeDriver: true,
                    }),
                ]),
            ])
        );

        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <View style={styles.container}>
            {showAvatar && (
                <View style={styles.avatarContainer}>
                    <Image
                        source={require('../../../assets/veda-avatar.png')}
                        style={styles.avatar}
                        resizeMode="contain"
                    />
                </View>
            )}

            <View style={[
                styles.bubble,
                {
                    backgroundColor: isDark ? colors.card : colors.inputBg,
                },
            ]}>
                <Animated.View
                    style={[
                        styles.dot,
                        {
                            backgroundColor: finalDotColor,
                            width: dotSize,
                            height: dotSize,
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        {
                            backgroundColor: finalDotColor,
                            width: dotSize,
                            height: dotSize,
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        {
                            backgroundColor: finalDotColor,
                            width: dotSize,
                            height: dotSize,
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
    },
    avatarContainer: {
        width: avatarSize.sm,
        height: avatarSize.sm,
        borderRadius: avatarSize.sm / 2,
        overflow: 'hidden',
        marginRight: spacing[3],
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderRadius: borderRadius.bubble,
        gap: 4,
    },
    dot: {
        borderRadius: borderRadius.full,
    },
});
