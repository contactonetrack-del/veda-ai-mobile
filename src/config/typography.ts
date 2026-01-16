/**
 * VEDA AI Design System - Typography Tokens
 * Premium typography scale with Inter font family
 */

import { Platform, TextStyle } from 'react-native';

// =============================================================================
// FONT FAMILIES
// =============================================================================
export const fontFamily = {
    // Primary font for body text
    regular: Platform.select({
        ios: 'Inter-Regular',
        android: 'Inter-Regular',
        default: 'System',
    }),
    medium: Platform.select({
        ios: 'Inter-Medium',
        android: 'Inter-Medium',
        default: 'System',
    }),
    semibold: Platform.select({
        ios: 'Inter-SemiBold',
        android: 'Inter-SemiBold',
        default: 'System',
    }),
    bold: Platform.select({
        ios: 'Inter-Bold',
        android: 'Inter-Bold',
        default: 'System',
    }),
    // Fallback to system fonts
    system: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
    }),
    // Monospace for code
    mono: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace',
    }),
};

// =============================================================================
// FONT SIZES
// =============================================================================
export const fontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    display: 56,
};

// =============================================================================
// LINE HEIGHTS
// =============================================================================
export const lineHeight = {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
};

// =============================================================================
// LETTER SPACING
// =============================================================================
export const letterSpacing = {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1.5,
};

// =============================================================================
// FONT WEIGHTS
// =============================================================================
export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

// =============================================================================
// TYPOGRAPHY PRESETS
// =============================================================================
export const typography = {
    // Display - Hero text
    display: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.display,
        lineHeight: fontSize.display * lineHeight.tight,
        letterSpacing: letterSpacing.tighter,
        fontWeight: fontWeight.bold,
    } as TextStyle,

    // Headings
    h1: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['4xl'],
        lineHeight: fontSize['4xl'] * lineHeight.tight,
        letterSpacing: letterSpacing.tight,
        fontWeight: fontWeight.bold,
    } as TextStyle,

    h2: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize['3xl'],
        lineHeight: fontSize['3xl'] * lineHeight.snug,
        letterSpacing: letterSpacing.tight,
        fontWeight: fontWeight.bold,
    } as TextStyle,

    h3: {
        fontFamily: fontFamily.semibold,
        fontSize: fontSize['2xl'],
        lineHeight: fontSize['2xl'] * lineHeight.snug,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    h4: {
        fontFamily: fontFamily.semibold,
        fontSize: fontSize.xl,
        lineHeight: fontSize.xl * lineHeight.snug,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    h5: {
        fontFamily: fontFamily.semibold,
        fontSize: fontSize.lg,
        lineHeight: fontSize.lg * lineHeight.snug,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    h6: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.base,
        lineHeight: fontSize.base * lineHeight.snug,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.medium,
    } as TextStyle,

    // Body text
    bodyLarge: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.lg,
        lineHeight: fontSize.lg * lineHeight.relaxed,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    body: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.base,
        lineHeight: fontSize.base * lineHeight.relaxed,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    bodySmall: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.md,
        lineHeight: fontSize.md * lineHeight.normal,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    // Caption and labels
    caption: {
        fontFamily: fontFamily.regular,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * lineHeight.normal,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    captionBold: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * lineHeight.normal,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.medium,
    } as TextStyle,

    // Overline
    overline: {
        fontFamily: fontFamily.bold,
        fontSize: fontSize.xs,
        lineHeight: fontSize.xs * lineHeight.normal,
        letterSpacing: letterSpacing.widest,
        fontWeight: fontWeight.bold,
        textTransform: 'uppercase',
    } as TextStyle,

    // Labels
    label: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.md,
        lineHeight: fontSize.md * lineHeight.snug,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.medium,
    } as TextStyle,

    labelSmall: {
        fontFamily: fontFamily.medium,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * lineHeight.snug,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.medium,
    } as TextStyle,

    // Button text
    button: {
        fontFamily: fontFamily.semibold,
        fontSize: fontSize.base,
        lineHeight: fontSize.base * lineHeight.snug,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    buttonSmall: {
        fontFamily: fontFamily.semibold,
        fontSize: fontSize.md,
        lineHeight: fontSize.md * lineHeight.snug,
        letterSpacing: letterSpacing.wide,
        fontWeight: fontWeight.semibold,
    } as TextStyle,

    // Code
    code: {
        fontFamily: fontFamily.mono,
        fontSize: fontSize.md,
        lineHeight: fontSize.md * lineHeight.relaxed,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.regular,
    } as TextStyle,

    codeSmall: {
        fontFamily: fontFamily.mono,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * lineHeight.relaxed,
        letterSpacing: letterSpacing.normal,
        fontWeight: fontWeight.regular,
    } as TextStyle,
};

export type TypographyVariant = keyof typeof typography;
