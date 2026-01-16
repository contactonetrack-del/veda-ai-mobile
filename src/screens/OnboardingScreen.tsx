/**
 * OnboardingScreen - Premium Introduction Flow
 * Features: Swipable slides, animated illustrations, design system integration
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Easing,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { brand, spacing, typography, borderRadius, duration } from '../config';
import { AnimatedButton } from '../components/common';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
    id: string;
    title: string;
    description: string;
    image: any;
    icon?: string;
    accentColor?: string;
}

const SLIDES: OnboardingSlide[] = [
    {
        id: '1',
        title: 'Meet Your\nWellness AI',
        description: 'India\'s first premium wellness companion designed to help you find balance.',
        image: require('../../assets/onboarding-1.png'),
        icon: 'sparkles',
        accentColor: brand.emerald[500],
    },
    {
        id: '2',
        title: 'Personalized\nGrowth',
        description: 'Track your moods, analyze your thoughts, and grow with tailored AI insights.',
        image: require('../../assets/onboarding-2.png'),
        icon: 'trending-up',
        accentColor: brand.violet[500],
    },
    {
        id: '3',
        title: 'Secure &\nPrivate',
        description: 'Your data is encrypted and private. A safe space for your digital journey.',
        image: require('../../assets/onboarding-3.png'),
        icon: 'shield-checkmark',
        accentColor: brand.emerald[600],
    },
];

// Animated Illustration Component with Glow & Float Effects
function AnimatedIllustration({ item, isActive }: { item: OnboardingSlide; isActive: boolean }) {
    const { colors } = useTheme();
    const accentColor = item.accentColor || brand.emerald[500];

    // Animations
    const pulseScale = useRef(new Animated.Value(1)).current;
    const pulseOpacity = useRef(new Animated.Value(0.2)).current;
    const floatY = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(0.8)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const imageScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (isActive) {
            // Pulsing glow animation
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(pulseScale, {
                            toValue: 1.15,
                            duration: 2000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseOpacity, {
                            toValue: 0.4,
                            duration: 2000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(pulseScale, {
                            toValue: 1,
                            duration: 2000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseOpacity, {
                            toValue: 0.2,
                            duration: 2000,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );

            // Floating badge animation
            const floatAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(floatY, {
                        toValue: -8,
                        duration: 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(floatY, {
                        toValue: 0,
                        duration: 1500,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );

            // Icon entrance animation
            Animated.parallel([
                Animated.spring(iconScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(iconRotate, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.out(Easing.back(1.5)),
                    useNativeDriver: true,
                }),
                Animated.spring(imageScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            pulseAnimation.start();
            floatAnimation.start();

            return () => {
                pulseAnimation.stop();
                floatAnimation.stop();
            };
        } else {
            // Reset animations when not active
            pulseScale.setValue(1);
            pulseOpacity.setValue(0.2);
            floatY.setValue(0);
            iconScale.setValue(0.8);
            iconRotate.setValue(0);
            imageScale.setValue(0.9);
        }
    }, [isActive]);

    const iconRotateInterpolate = iconRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['-15deg', '0deg'],
    });

    return (
        <View style={styles.imageContainer}>
            {/* Animated Glow Circle */}
            <Animated.View
                style={[
                    styles.glowCircle,
                    {
                        backgroundColor: accentColor,
                        opacity: pulseOpacity,
                        transform: [{ scale: pulseScale }],
                    },
                ]}
            />

            {/* Secondary glow ring */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        borderColor: accentColor,
                        transform: [{ scale: pulseScale }],
                    },
                ]}
            />

            {/* Main Image with scale animation */}
            <Animated.View style={{ transform: [{ scale: imageScale }] }}>
                <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Floating Icon Badge */}
            <Animated.View
                style={[
                    styles.iconBadge,
                    {
                        backgroundColor: colors.card,
                        borderColor: accentColor,
                        shadowColor: accentColor,
                        transform: [
                            { translateY: floatY },
                            { scale: iconScale },
                            { rotate: iconRotateInterpolate },
                        ],
                    },
                ]}
            >
                <Ionicons name={item.icon as any} size={24} color={accentColor} />
            </Animated.View>
        </View>
    );
}

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
    const { colors, isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            onComplete();
        }
    };

    const renderItem = ({ item, index }: { item: OnboardingSlide; index: number }) => {
        return (
            <View style={styles.slide}>
                <AnimatedIllustration item={item} isActive={index === currentIndex} />
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.description, { color: colors.subtext }]}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
                    <Text style={[styles.skipText, { color: colors.subtext }]}>Skip</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />

            <View style={styles.bottomContainer}>
                <View style={styles.paginator}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 24, 10],
                            extrapolate: 'clamp',
                        });

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i.toString()}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                        backgroundColor: brand.emerald[500],
                                    },
                                ]}
                            />
                        );
                    })}
                </View>

                <AnimatedButton
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
                    onPress={scrollTo}
                    variant="primary"
                    size="lg"
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: spacing[6],
    },
    skipButton: {
        padding: spacing[2],
    },
    skipText: {
        ...typography.bodySmall,
        fontWeight: '600',
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: spacing[8],
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    glowCircle: {
        position: 'absolute',
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
    },
    glowRing: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        borderWidth: 2,
        opacity: 0.15,
    },
    image: {
        width: width * 0.6,
        height: width * 0.6,
    },
    iconBadge: {
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    textContainer: {
        flex: 0.4,
        alignItems: 'center',
    },
    title: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: spacing[4],
    },
    description: {
        ...typography.body,
        textAlign: 'center',
        paddingHorizontal: spacing[4],
        lineHeight: 24,
    },
    bottomContainer: {
        paddingHorizontal: spacing[8],
        paddingBottom: spacing[8],
        alignItems: 'center',
    },
    paginator: {
        flexDirection: 'row',
        height: 40,
        marginBottom: spacing[6],
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    button: {
        width: '100%',
    },
});
