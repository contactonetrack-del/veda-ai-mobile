/**
 * TypingIndicator - Premium Animated AI Typing Feedback
 * Features: Three dots with wave pattern using Reanimated for 60FPS performance
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, avatarSize } from '../../config/spacing';

interface TypingIndicatorProps {
    showAvatar?: boolean;
    dotColor?: string;
    dotSize?: number;
}

const Dot = ({ index, color, size }: { index: number; color: string; size: number }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        const delay = index * 200;

        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-6, { duration: 400, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
                    withTiming(0, { duration: 400, easing: Easing.bezier(0.42, 0, 0.58, 1) })
                ),
                -1,
                true
            )
        );

        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: 400 }),
                    withTiming(0.4, { duration: 400 })
                ),
                -1,
                true
            )
        );
    }, [index, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.dot,
                { backgroundColor: color, width: size, height: size },
                animatedStyle,
            ]}
        />
    );
};

export default function TypingIndicator({
    showAvatar = true,
    dotColor,
    dotSize = 8,
}: TypingIndicatorProps) {
    const { colors, isDark } = useTheme();
    const finalDotColor = dotColor || colors.primary;

    return (
        <View style={styles.container}>
            {showAvatar && (
                <View style={[styles.avatarContainer, { borderColor: colors.cardBorder }]}>
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
                    borderBottomLeftRadius: 4,
                },
            ]}>
                <Dot index={0} color={finalDotColor} size={dotSize} />
                <Dot index={1} color={finalDotColor} size={dotSize} />
                <Dot index={2} color={finalDotColor} size={dotSize} />
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
        marginBottom: spacing[4],
    },
    avatarContainer: {
        width: avatarSize.sm,
        height: avatarSize.sm,
        borderRadius: avatarSize.sm / 2,
        overflow: 'hidden',
        marginRight: spacing[3],
        borderWidth: 1,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        borderRadius: borderRadius.bubble,
        gap: 6,
    },
    dot: {
        borderRadius: borderRadius.full,
    },
});
