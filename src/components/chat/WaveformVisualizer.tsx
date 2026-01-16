import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const BAR_COUNT = 32;
const BAR_WIDTH = 3;
const BAR_GAP = 2;
const MAX_HEIGHT = 45;

interface WaveformVisualizerProps {
    isActive: boolean;
}

export default function WaveformVisualizer({ isActive }: WaveformVisualizerProps) {
    const { colors } = useTheme();
    const barAnims = useRef<Animated.Value[]>(
        Array.from({ length: BAR_COUNT }, () => new Animated.Value(10))
    ).current;

    useEffect(() => {
        let animations: Animated.CompositeAnimation[] = [];

        if (isActive) {
            barAnims.forEach((anim, index) => {
                const randomLoop = Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: Math.random() * MAX_HEIGHT + 8,
                            duration: 150 + Math.random() * 200,
                            useNativeDriver: false,
                        }),
                        Animated.timing(anim, {
                            toValue: Math.random() * 12 + 5,
                            duration: 150 + Math.random() * 200,
                            useNativeDriver: false,
                        }),
                    ])
                );
                animations.push(randomLoop);
                randomLoop.start();
            });
        } else {
            barAnims.forEach((anim) => {
                Animated.timing(anim, {
                    toValue: 10,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            });
        }

        return () => {
            animations.forEach(a => a.stop());
        };
    }, [isActive]);

    return (
        <View style={styles.container}>
            {barAnims.map((anim, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bar,
                        {
                            height: anim,
                            backgroundColor: colors.primary,
                            opacity: 0.6 + (index / BAR_COUNT) * 0.4,
                        },
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: MAX_HEIGHT + 10,
        gap: BAR_GAP,
    },
    bar: {
        width: BAR_WIDTH,
        borderRadius: BAR_WIDTH / 2,
    },
});
