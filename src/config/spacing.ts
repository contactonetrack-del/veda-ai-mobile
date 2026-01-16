/**
 * VEDA AI Design System - Spacing Tokens
 * Consistent spacing scale and layout utilities
 */

// =============================================================================
// BASE SPACING SCALE (4px base unit)
// =============================================================================
export const spacing = {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
    // Specific UI elements
    button: 14,
    input: 14,
    card: 16,
    modal: 20,
    avatar: 9999,
    chip: 20,
    bubble: 20,
} as const;

// =============================================================================
// TOUCH TARGETS (Accessibility compliant - min 48dp)
// =============================================================================
export const touchTarget = {
    min: 44, // Minimum accessible touch target
    sm: 40,
    md: 48,
    lg: 56,
    xl: 64,
} as const;

// =============================================================================
// ICON SIZES
// =============================================================================
export const iconSize = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
} as const;

// =============================================================================
// AVATAR SIZES
// =============================================================================
export const avatarSize = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    '2xl': 64,
    '3xl': 80,
    '4xl': 96,
} as const;

// =============================================================================
// Z-INDEX SCALE
// =============================================================================
export const zIndex = {
    hide: -1,
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
    max: 100,
} as const;

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================
export const layout = {
    // Screen margins
    screenPadding: spacing[4], // 16px
    screenPaddingLarge: spacing[6], // 24px

    // Content widths
    contentMaxWidth: 600,
    cardMaxWidth: 400,

    // Header heights
    headerHeight: 60,
    tabBarHeight: 65,

    // Input heights
    inputHeight: 48,
    inputHeightLarge: 56,

    // Button heights
    buttonHeight: 48,
    buttonHeightSmall: 40,
    buttonHeightLarge: 56,

    // Chat specific
    messageBubbleMaxWidth: '80%',
    sidebarWidth: 0.85, // 85% of screen width

    // Drawer widths
    drawerWidth: 280,
    drawerWidthLarge: 320,
} as const;

// =============================================================================
// GAP UTILITIES (for flexbox gaps)
// =============================================================================
export const gap = {
    xs: spacing[1],    // 4px
    sm: spacing[2],    // 8px
    md: spacing[3],    // 12px
    lg: spacing[4],    // 16px
    xl: spacing[6],    // 24px
    '2xl': spacing[8], // 32px
} as const;

export type SpacingScale = keyof typeof spacing;
export type BorderRadiusScale = keyof typeof borderRadius;
