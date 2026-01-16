/**
 * VEDA AI Design System - Animation Tokens
 * Centralized animation configurations for React Native Animated and Reanimated
 */

import { Easing } from 'react-native';

// =============================================================================
// DURATION CONSTANTS (in milliseconds)
// =============================================================================
export const duration = {
    instant: 0,
    fastest: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
    slowest: 700,
    // Specific use cases
    pageTransition: 300,
    modalOpen: 250,
    modalClose: 200,
    drawer: 300,
    shimmer: 1500,
    pulse: 1000,
    typing: 50, // Per character
} as const;

// =============================================================================
// EASING CURVES
// =============================================================================
export const easing = {
    // Standard curves
    linear: Easing.linear,
    ease: Easing.ease,
    easeIn: Easing.in(Easing.ease),
    easeOut: Easing.out(Easing.ease),
    easeInOut: Easing.inOut(Easing.ease),

    // Cubic curves (smooth)
    easeInCubic: Easing.bezier(0.55, 0.055, 0.675, 0.19),
    easeOutCubic: Easing.bezier(0.215, 0.61, 0.355, 1),
    easeInOutCubic: Easing.bezier(0.645, 0.045, 0.355, 1),

    // Expo curves (dramatic)
    easeInExpo: Easing.bezier(0.95, 0.05, 0.795, 0.035),
    easeOutExpo: Easing.bezier(0.19, 1, 0.22, 1),
    easeInOutExpo: Easing.bezier(1, 0, 0, 1),

    // Back curves (overshoot)
    easeOutBack: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    easeInBack: Easing.bezier(0.6, -0.28, 0.735, 0.045),

    // Elastic (bouncy)
    elastic: Easing.elastic(1),
    bounce: Easing.bounce,
} as const;

// =============================================================================
// SPRING CONFIGURATIONS (for Reanimated)
// =============================================================================
export const springConfig = {
    // Gentle (for subtle movements)
    gentle: {
        damping: 20,
        stiffness: 100,
        mass: 1,
    },
    // Default (balanced)
    default: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
    // Bouncy (playful animations)
    bouncy: {
        damping: 10,
        stiffness: 180,
        mass: 1,
    },
    // Stiff (quick, snappy)
    stiff: {
        damping: 20,
        stiffness: 300,
        mass: 1,
    },
    // Wobbly (more bounce)
    wobbly: {
        damping: 8,
        stiffness: 150,
        mass: 1,
    },
    // Slow (large elements)
    slow: {
        damping: 25,
        stiffness: 80,
        mass: 1,
    },
    // Drawer/sheet
    drawer: {
        damping: 18,
        stiffness: 200,
        mass: 1,
    },
    // Button press
    button: {
        damping: 15,
        stiffness: 250,
        mass: 0.8,
    },
} as const;

// =============================================================================
// TIMING CONFIGURATIONS (for Animated.timing)
// =============================================================================
export const timingConfig = {
    fadeIn: {
        duration: duration.normal,
        easing: easing.easeOut,
        useNativeDriver: true,
    },
    fadeOut: {
        duration: duration.fast,
        easing: easing.easeIn,
        useNativeDriver: true,
    },
    slideIn: {
        duration: duration.pageTransition,
        easing: easing.easeOutCubic,
        useNativeDriver: true,
    },
    slideOut: {
        duration: duration.fast,
        easing: easing.easeInCubic,
        useNativeDriver: true,
    },
    scale: {
        duration: duration.fast,
        easing: easing.easeOutBack,
        useNativeDriver: true,
    },
    modal: {
        duration: duration.modalOpen,
        easing: easing.easeOutCubic,
        useNativeDriver: true,
    },
} as const;

// =============================================================================
// TRANSFORM VALUES
// =============================================================================
export const transforms = {
    // Scale values
    pressedScale: 0.96,
    hoverScale: 1.02,
    activeScale: 0.98,

    // Translate values
    slideDistance: 20,
    sheetSlide: 100,

    // Rotation
    spinDuration: 1000,
    wobbleAngle: 3,
} as const;

// =============================================================================
// DELAY UTILITIES
// =============================================================================
export const delay = {
    none: 0,
    short: 50,
    medium: 100,
    long: 200,
    stagger: 50, // For staggered list animations
} as const;

// =============================================================================
// ANIMATION PRESETS
// =============================================================================
export const animationPresets = {
    // Fade animations
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
        config: timingConfig.fadeIn,
    },
    fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
        config: timingConfig.fadeOut,
    },

    // Slide animations
    slideInUp: {
        from: { translateY: 20, opacity: 0 },
        to: { translateY: 0, opacity: 1 },
        config: timingConfig.slideIn,
    },
    slideInDown: {
        from: { translateY: -20, opacity: 0 },
        to: { translateY: 0, opacity: 1 },
        config: timingConfig.slideIn,
    },
    slideInLeft: {
        from: { translateX: -20, opacity: 0 },
        to: { translateX: 0, opacity: 1 },
        config: timingConfig.slideIn,
    },
    slideInRight: {
        from: { translateX: 20, opacity: 0 },
        to: { translateX: 0, opacity: 1 },
        config: timingConfig.slideIn,
    },

    // Scale animations
    scaleIn: {
        from: { scale: 0.9, opacity: 0 },
        to: { scale: 1, opacity: 1 },
        config: timingConfig.scale,
    },
    popIn: {
        from: { scale: 0.5, opacity: 0 },
        to: { scale: 1, opacity: 1 },
        config: { ...timingConfig.scale, easing: easing.easeOutBack },
    },

    // Combined animations
    messageIn: {
        from: { translateY: 10, opacity: 0, scale: 0.95 },
        to: { translateY: 0, opacity: 1, scale: 1 },
        config: timingConfig.slideIn,
    },
} as const;

// =============================================================================
// SHIMMER ANIMATION CONFIG
// =============================================================================
export const shimmerConfig = {
    duration: duration.shimmer,
    colors: ['transparent', 'rgba(255,255,255,0.1)', 'transparent'],
    locations: [0, 0.5, 1] as const,
};

// =============================================================================
// PULSE ANIMATION CONFIG
// =============================================================================
export const pulseConfig = {
    duration: duration.pulse,
    minOpacity: 0.4,
    maxOpacity: 1,
};

export type SpringConfigName = keyof typeof springConfig;
export type TimingConfigName = keyof typeof timingConfig;
export type AnimationPresetName = keyof typeof animationPresets;
