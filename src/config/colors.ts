/**
 * App Theme Colors
 */

export const colors = {
    // Premium Dark Theme (ChatGPT-inspired)
    dark: {
        background: '#212121',       // Main dark gray background
        card: '#2F2F2F',             // Secondary surface
        cardBorder: '#4E4E4E',
        text: '#ECECEC',             // Primary text
        subtext: '#B4B4B4',          // Secondary text
        primary: '#10A37F',          // ChatGPT Emerald
        secondary: '#10A37F',
        accent: '#10A37F',
        error: '#EF4444',
        inputBg: '#40414F',          // Input capsule background
        inputBorder: 'transparent',
        success: '#10A37F',
        // Specific UI elements
        chatUserBubble: '#2F2F2F',
        chatAiBubble: 'transparent',
    },
    // Premium Light Theme
    light: {
        background: '#FFFFFF',
        card: '#F7F7F8',
        cardBorder: '#E5E5E5',
        text: '#1A1A1A',
        subtext: '#6B6B6B',
        primary: '#10A37F',
        secondary: '#10A37F',
        accent: '#10A37F',
        error: '#DC2626',
        inputBg: '#F0F0F0', // Slightly darker than white
        inputBorder: 'transparent',
        success: '#059669',
        // Specific UI elements
        chatUserBubble: '#F0F0F0',
        chatAiBubble: 'transparent',
    },
};

export type ThemeColors = typeof colors.dark;
