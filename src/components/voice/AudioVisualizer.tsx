import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface AudioVisualizerProps {
    level: number; // 0 to 1
    isActive: boolean;
    color?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    level,
    isActive,
    color = '#4A90E2'
}) => {
    // We'll create a few bars or circles that react to the level
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    // Smooth out the level input
    useEffect(() => {
        if (isActive) {
            // Map 0-1 level to a scale range, e.g., 1.0 to 2.5
            const targetScale = 1 + (level * 1.5);
            scale.value = withSpring(targetScale, { damping: 10, stiffness: 100 });
            opacity.value = withTiming(0.8 + (level * 0.2), { duration: 100 });
        } else {
            scale.value = withTiming(1, { duration: 300 });
            opacity.value = withTiming(0.3, { duration: 300 });
        }
    }, [level, isActive]);

    // Breathing animation when active but low level (listening state idle)
    useEffect(() => {
        if (isActive && level < 0.1) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
        }
    }, [isActive, level]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    return (
        <View style={styles.container}>
            {/* Main Orb */}
            <Animated.View style={[styles.orb, animatedStyle, { backgroundColor: color }]} />

            {/* Outer Ripple (optional, could be added for more effect) */}
            {isActive && (
                <View style={[styles.orb, styles.ripple, { borderColor: color }]} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        width: 200,
    },
    orb: {
        width: 100,
        height: 100,
        borderRadius: 50,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.3,
        // shadowRadius: 10,
        // elevation: 8,
    },
    ripple: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        opacity: 0.2,
        transform: [{ scale: 1 }],
    }
});
