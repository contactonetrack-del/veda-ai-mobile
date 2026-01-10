/**
 * App Theme Colors
 */

export const colors = {
    // Dark Theme (Default)
    dark: {
        background: '#020617',
        card: '#0F172A',
        cardBorder: '#1E293B',
        text: '#F8FAFC',
        subtext: '#94A3B8',
        primary: '#10B981',
        secondary: '#3B82F6',
        accent: '#F59E0B',
        error: '#EF4444',
        inputBg: '#1E293B',
        inputBorder: '#334155',
        success: '#10B981',
    },
    // Light Theme
    light: {
        background: '#F0F9FF',
        card: '#FFFFFF',
        cardBorder: '#E2E8F0',
        text: '#1E293B',
        subtext: '#64748B',
        primary: '#059669', // Darker green for contrast
        secondary: '#2563EB',
        accent: '#D97706',
        error: '#DC2626',
        inputBg: '#F1F5F9',
        inputBorder: '#CBD5E1',
        success: '#059669',
    },
};

export type ThemeColors = typeof colors.dark;
