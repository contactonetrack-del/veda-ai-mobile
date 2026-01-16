/**
 * SkeletonLoader - Premium Loading Placeholder Component
 * Features: Shimmer animation, multiple variants, theme-aware
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    ViewStyle,
    Dimensions,
    DimensionValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../config/spacing';
import { duration } from '../../config/animations';

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'button' | 'card' | 'message' | 'listItem';

interface SkeletonLoaderProps {
    variant?: SkeletonVariant;
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
    shimmer?: boolean;
    count?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const variantStyles: Record<SkeletonVariant, { width: number | string; height: number; borderRadius: number }> = {
    text: { width: '80%', height: 14, borderRadius: borderRadius.sm },
    title: { width: '60%', height: 24, borderRadius: borderRadius.md },
    avatar: { width: 48, height: 48, borderRadius: borderRadius.full },
    button: { width: '100%', height: 48, borderRadius: borderRadius.button },
    card: { width: '100%', height: 120, borderRadius: borderRadius.card },
    message: { width: '70%', height: 60, borderRadius: borderRadius.bubble },
    listItem: { width: '100%', height: 72, borderRadius: borderRadius.md },
};

function SkeletonItem({
    variant = 'text',
    width,
    height,
    borderRadius: customBorderRadius,
    style,
    shimmer = true,
}: Omit<SkeletonLoaderProps, 'count'>) {
    const { colors, isDark } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(-1)).current;
    const variantStyle = variantStyles[variant];

    const finalWidth = width ?? variantStyle.width;
    const finalHeight = height ?? variantStyle.height;
    const finalBorderRadius = customBorderRadius ?? variantStyle.borderRadius;

    useEffect(() => {
        if (shimmer) {
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: duration.shimmer,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [shimmer]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    const backgroundColor = isDark ? '#2A2A2A' : '#E8E8E8';
    const shimmerColors: readonly [string, string, string] = isDark
        ? ['transparent', 'rgba(255,255,255,0.08)', 'transparent'] as const
        : ['transparent', 'rgba(255,255,255,0.5)', 'transparent'] as const;

    return (
        <View
            style={[
                styles.skeleton,
                {
                    width: finalWidth as DimensionValue,
                    height: finalHeight,
                    borderRadius: finalBorderRadius,
                    backgroundColor,
                },
                style,
            ]}
        >
            {shimmer && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        { transform: [{ translateX }] },
                    ]}
                >
                    <LinearGradient
                        colors={shimmerColors}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            )}
        </View>
    );
}

export default function SkeletonLoader({
    count = 1,
    ...props
}: SkeletonLoaderProps) {
    if (count === 1) {
        return <SkeletonItem {...props} />;
    }

    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} {...props} style={StyleSheet.flatten([props.style, { marginBottom: index < count - 1 ? 8 : 0 }])} />
            ))}
        </View>
    );
}

// Preset composite skeletons
export function MessageSkeleton() {
    const { colors, isDark } = useTheme();

    return (
        <View style={styles.messageContainer}>
            <SkeletonItem variant="avatar" width={32} height={32} />
            <View style={styles.messageContent}>
                <SkeletonItem variant="text" width="40%" height={12} />
                <SkeletonItem variant="text" width="90%" style={{ marginTop: 8 }} />
                <SkeletonItem variant="text" width="75%" style={{ marginTop: 4 }} />
            </View>
        </View>
    );
}

export function ListItemSkeleton() {
    return (
        <View style={styles.listItemContainer}>
            <SkeletonItem variant="avatar" width={40} height={40} />
            <View style={styles.listItemContent}>
                <SkeletonItem variant="text" width="60%" height={16} />
                <SkeletonItem variant="text" width="80%" height={12} style={{ marginTop: 6 }} />
            </View>
        </View>
    );
}

export function CardSkeleton() {
    return (
        <View style={styles.cardContainer}>
            <SkeletonItem variant="card" height={160} />
            <View style={styles.cardContent}>
                <SkeletonItem variant="title" width="70%" />
                <SkeletonItem variant="text" width="90%" style={{ marginTop: 8 }} />
                <SkeletonItem variant="text" width="60%" style={{ marginTop: 4 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    skeleton: {
        overflow: 'hidden',
    },
    messageContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageContent: {
        flex: 1,
        marginLeft: 12,
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    listItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    cardContainer: {
        width: '100%',
    },
    cardContent: {
        padding: 16,
    },
});
