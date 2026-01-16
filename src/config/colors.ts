/**
 * VEDA AI Design System - Color Tokens
 * Premium color palette with semantic tokens, gradients, and shadows
 */

// =============================================================================
// BRAND COLORS
// =============================================================================
export const brand = {
    emerald: {
        50: '#ECFDF5',
        100: '#D1FAE5',
        200: '#A7F3D0',
        300: '#6EE7B7',
        400: '#34D399',
        500: '#10B981',  // Primary
        600: '#059669',
        700: '#047857',
        800: '#065F46',
        900: '#064E3B',
    },
    violet: {
        50: '#F5F3FF',
        100: '#EDE9FE',
        200: '#DDD6FE',
        300: '#C4B5FD',
        400: '#A78BFA',
        500: '#8B5CF6',  // Accent
        600: '#7C3AED',
        700: '#6D28D9',
        800: '#5B21B6',
        900: '#4C1D95',
    },
};

// =============================================================================
// SEMANTIC COLORS
// =============================================================================
export const semantic = {
    success: {
        light: '#10B981',
        dark: '#34D399',
        bg: 'rgba(16, 185, 129, 0.1)',
    },
    error: {
        light: '#DC2626',
        dark: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.1)',
    },
    warning: {
        light: '#D97706',
        dark: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.1)',
    },
    info: {
        light: '#2563EB',
        dark: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.1)',
    },
};

// =============================================================================
// GRADIENT DEFINITIONS
// =============================================================================
export const gradients = {
    primary: ['#10B981', '#059669'] as const,
    primaryReverse: ['#059669', '#10B981'] as const,
    accent: ['#8B5CF6', '#6D28D9'] as const,
    premium: ['#10B981', '#8B5CF6'] as const,
    sunset: ['#F59E0B', '#EF4444'] as const,
    darkOverlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as const,
    lightOverlay: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'] as const,
    shimmer: ['transparent', 'rgba(255,255,255,0.1)', 'transparent'] as const,
};

// =============================================================================
// SHADOW DEFINITIONS (iOS & Android compatible)
// =============================================================================
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }),
};

// =============================================================================
// OPACITY SCALES
// =============================================================================
export const opacity = {
    disabled: 0.4,
    muted: 0.6,
    subtle: 0.8,
    overlay: 0.5,
    backdrop: 0.7,
};

// =============================================================================
// THEME COLORS
// =============================================================================
export const colors = {
    // Premium Dark Theme
    dark: {
        // Base
        background: '#121212',         // Deeper black for premium feel
        backgroundSecondary: '#1A1A1A',
        card: '#1E1E1E',
        cardHover: '#252525',
        cardBorder: '#2E2E2E',
        cardBorderHover: '#3E3E3E',

        // Text
        text: '#ECECEC',
        textSecondary: '#B4B4B4',
        subtext: '#8A8A8A',
        textMuted: '#6B6B6B',

        // Brand
        primary: '#10B981',
        primaryHover: '#059669',
        secondary: '#8B5CF6',
        accent: '#8B5CF6',

        // Semantic
        success: '#34D399',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Input
        inputBg: '#2A2A2A',
        inputBgFocused: '#333333',
        inputBorder: '#3E3E3E',
        inputBorderFocused: '#10B981',
        placeholder: '#6B6B6B',

        // Chat
        chatUserBubble: '#2A2D36',
        chatUserBubbleBorder: '#3A3D46',
        chatAiBubble: 'transparent',

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.7)',
        backdrop: 'rgba(0, 0, 0, 0.5)',

        // Dividers
        divider: '#2E2E2E',
        dividerLight: '#252525',

        // Status
        online: '#34D399',
        offline: '#6B6B6B',
        busy: '#F59E0B',

        // Glassmorphism
        glass: 'rgba(30, 30, 30, 0.6)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        glassActive: 'rgba(40, 40, 40, 0.8)',
    },

    // Premium Light Theme
    light: {
        // Base
        background: '#FAFAFA',
        backgroundSecondary: '#F5F5F5',
        card: '#FFFFFF',
        cardHover: '#F9F9F9',
        cardBorder: '#E8E8E8',
        cardBorderHover: '#D0D0D0',

        // Text
        text: '#1A1A1A',
        textSecondary: '#4A4A4A',
        subtext: '#6B6B6B',
        textMuted: '#9A9A9A',

        // Brand
        primary: '#10A37F',
        primaryHover: '#0D8A6A',
        secondary: '#8B5CF6',
        accent: '#8B5CF6',

        // Semantic
        success: '#059669',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',

        // Input
        inputBg: '#F0F0F0',
        inputBgFocused: '#E8E8E8',
        inputBorder: '#E0E0E0',
        inputBorderFocused: '#10A37F',
        placeholder: '#9A9A9A',

        // Chat
        chatUserBubble: '#E8F4F0',
        chatUserBubbleBorder: '#D0E8E0',
        chatAiBubble: 'transparent',

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.5)',
        backdrop: 'rgba(0, 0, 0, 0.3)',

        // Dividers
        divider: '#E8E8E8',
        dividerLight: '#F0F0F0',

        // Status
        online: '#059669',
        offline: '#9A9A9A',
        busy: '#D97706',

        // Glassmorphism
        glass: 'rgba(255, 255, 255, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.5)',
        glassActive: 'rgba(255, 255, 255, 0.9)',
    },

    // High Contrast Theme for Accessibility
    highContrast: {
        // Base
        background: '#000000',
        backgroundSecondary: '#0A0A0A',
        card: '#1A1A1A',
        cardHover: '#2A2A2A',
        cardBorder: '#FFFFFF',
        cardBorderHover: '#FFFFFF',

        // Text - Maximum contrast
        text: '#FFFFFF',
        textSecondary: '#FFFFFF',
        subtext: '#E0E0E0',
        textMuted: '#B0B0B0',

        // Brand - Brighter for visibility
        primary: '#00FF9C',
        primaryHover: '#00CC7A',
        secondary: '#A78BFA',
        accent: '#A78BFA',

        // Semantic - High saturation
        success: '#00FF00',
        error: '#FF0000',
        warning: '#FFFF00',
        info: '#00BFFF',

        // Input
        inputBg: '#1A1A1A',
        inputBgFocused: '#2A2A2A',
        inputBorder: '#FFFFFF',
        inputBorderFocused: '#00FF9C',
        placeholder: '#B0B0B0',

        // Chat
        chatUserBubble: '#1A1A1A',
        chatUserBubbleBorder: '#FFFFFF',
        chatAiBubble: 'transparent',

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.9)',
        backdrop: 'rgba(0, 0, 0, 0.8)',

        // Dividers
        divider: '#FFFFFF',
        dividerLight: '#808080',

        // Status
        online: '#00FF00',
        offline: '#808080',
        busy: '#FFFF00',

        // Glassmorphism - High visibility (less transparency)
        glass: 'rgba(0, 0, 0, 0.95)',
        glassBorder: '#FFFFFF',
        glassActive: '#000000',
    },
};

export type ThemeColors = typeof colors.dark | typeof colors.highContrast;

