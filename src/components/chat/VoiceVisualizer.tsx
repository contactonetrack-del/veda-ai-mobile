import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { colors } from '../../config/colors';

interface VoiceVisualizerProps {
    visible: boolean;
    level?: number; // Normalized level 0-1
}

const BAR_COUNT = 5;

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ visible, level = 0 }) => {
    // We create an array of shared values for the bars
    const barHeights = Array(BAR_COUNT).fill(0).map(() => useSharedValue(10));

    useEffect(() => {
        if (visible) {
            // Animate bars based on level
            barHeights.forEach((height, index) => {
                // Randomness factor to make it look organic
                const randomFactor = 0.5 + Math.random();
                const targetHeight = 10 + (level * 40 * randomFactor);

                height.value = withTiming(targetHeight, { duration: 100 });
            });
        } else {
            // Reset to small dots
            barHeights.forEach(height => {
                height.value = withTiming(4, { duration: 200 });
            });
        }
    }, [level, visible]);

    // Idle animation when visible but no level input (optional pulsing)
    useEffect(() => {
        if (visible && level === 0) {
            barHeights.forEach((height, index) => {
                height.value = withRepeat(
                    withSequence(
                        withTiming(15 + Math.random() * 10, { duration: 400 + index * 100, easing: Easing.inOut(Easing.quad) }),
                        withTiming(8, { duration: 400 + index * 100, easing: Easing.inOut(Easing.quad) })
                    ),
                    -1,
                    true
                );
            });
        }
    }, [visible, level === 0]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            {barHeights.map((height, index) => {
                const animatedStyle = useAnimatedStyle(() => ({
                    height: height.value,
                    backgroundColor: colors.light.primary, // Using direct color or theme
                    opacity: 0.8,
                }));

                return (
                    <Animated.View
                        key={index}
                        style={[styles.bar, animatedStyle]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        gap: 4,
    },
    bar: {
        width: 4,
        borderRadius: 2,
        backgroundColor: '#6C63FF',
    },
});
