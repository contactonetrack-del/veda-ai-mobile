
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, spacing, shadows } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SkeletonBubble() {
    const { colors, isDark } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.linear),
                useNativeDriver: true,
            })
        );
        shimmerAnimation.start();
        return () => shimmerAnimation.stop();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    return (
        <View style={styles.container}>
            {/* AI Avatar Skeleton */}
            <View style={[styles.avatar, { backgroundColor: colors.chatUserBubbleBorder }]} />

            <View style={styles.contentContainer}>
                {/* Bubble Skeleton */}
                <View style={[
                    styles.bubble,
                    {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                    },
                    shadows.sm
                ]}>
                    {/* Shimmer Layer */}
                    <View style={StyleSheet.absoluteFill}>
                        <Animated.View
                            style={{
                                flex: 1,
                                transform: [{ translateX }],
                                opacity: isDark ? 0.05 : 0.3,
                            }}
                        >
                            <LinearGradient
                                colors={['transparent', colors.subtext, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    </View>

                    {/* Text Lines */}
                    <View style={[styles.line, { width: '90%', backgroundColor: colors.chatUserBubbleBorder }]} />
                    <View style={[styles.line, { width: '75%', backgroundColor: colors.chatUserBubbleBorder }]} />
                    <View style={[styles.line, { width: '40%', backgroundColor: colors.chatUserBubbleBorder }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: spacing[4],
        marginVertical: spacing[2],
        marginBottom: spacing[4],
        alignItems: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        marginRight: spacing[2],
        marginTop: 2,
    },
    contentContainer: {
        flex: 1,
        maxWidth: '85%',
    },
    bubble: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderRadius: borderRadius.bubble,
        borderTopLeftRadius: borderRadius.sm,
        borderWidth: 1,
        overflow: 'hidden', // Mask the shimmer
    },
    line: {
        height: 12,
        borderRadius: 6,
        marginBottom: spacing[2],
        opacity: 0.5,
    },
});
