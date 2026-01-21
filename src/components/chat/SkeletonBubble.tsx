
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
            {/* AI Avatar Skeleton with subtle shimmer */}
            <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

            <View style={styles.contentContainer}>
                {/* Bubble Skeleton */}
                <View style={[
                    styles.bubble,
                    {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                    },
                    shadows.md
                ]}>
                    {/* Shimmer Layer */}
                    <View style={StyleSheet.absoluteFill}>
                        <Animated.View
                            style={{
                                flex: 1,
                                transform: [{ translateX }],
                                opacity: isDark ? 0.05 : 0.15,
                            }}
                        >
                            <LinearGradient
                                colors={['transparent', isDark ? '#FFFFFF' : colors.primary, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    </View>

                    {/* Text Lines */}
                    <View style={[styles.line, { width: '95%', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
                    <View style={[styles.line, { width: '85%', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
                    <View style={[styles.line, { width: '60%', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: spacing[4],
        marginVertical: spacing[3],
        alignItems: 'flex-start',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: spacing[3],
        marginTop: 2,
    },
    contentContainer: {
        flex: 1,
        maxWidth: '85%',
    },
    bubble: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
        borderRadius: borderRadius.bubble,
        borderTopLeftRadius: borderRadius.sm,
        borderWidth: 1,
        overflow: 'hidden',
    },
    line: {
        height: 10,
        borderRadius: 5,
        marginBottom: spacing[3],
    },
});
