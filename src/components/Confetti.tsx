import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
    runOnJS,
    withSequence
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 30;
const COLORS = ['#6366F1', '#10A37F', '#F59E0B', '#EF4444', '#EC4899'];

interface ParticleProps {
    color: string;
    onComplete: () => void;
}

const Particle = ({ color, onComplete }: ParticleProps) => {
    const x = useSharedValue(Math.random() * width);
    const y = useSharedValue(-20);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        const duration = 2000 + Math.random() * 2000;
        const targetX = x.value + (Math.random() - 0.5) * 200;

        y.value = withTiming(height + 20, {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, (finished) => {
            if (finished) runOnJS(onComplete)();
        });

        x.value = withTiming(targetX, { duration });
        rotate.value = withTiming(360 * 2, { duration });
        opacity.value = withDelay(duration * 0.8, withTiming(0, { duration: duration * 0.2 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value },
            { translateY: y.value },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value,
        backgroundColor: color,
    }));

    return <Animated.View style={[styles.particle, animatedStyle]} />;
};

export interface ConfettiRef {
    trigger: () => void;
}

const Confetti = forwardRef<ConfettiRef>((_, ref) => {
    const [key, setKey] = useState(0);
    const [active, setActive] = useState(false);

    useImperativeHandle(ref, () => ({
        trigger: () => {
            setKey(prev => prev + 1);
            setActive(true);
        }
    }));

    if (!active) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <Particle
                    key={`${key}-${i}`}
                    color={COLORS[i % COLORS.length]}
                    onComplete={() => {
                        if (i === PARTICLE_COUNT - 1) setActive(false);
                    }}
                />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
    }
});

export default Confetti;
