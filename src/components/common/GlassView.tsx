import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, blurIntensity } from '../../context/ThemeContext';
import { borderRadius } from '../../config/spacing';

interface GlassViewProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemUltraThinMaterial' | 'systemThickMaterialDark' | 'systemChromeMaterialDark' | 'systemUltraThinMaterialDark';
    border?: boolean;
}

/**
 * GlassView: Premium Frosted Glass Container
 * Combines BlurView with a subtle gradient overlay and border.
 */
export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = blurIntensity.medium,
    tint,
    border = true,
}) => {
    const { isDark, colors } = useTheme();

    // Default tint based on theme
    const blurTint = tint || (isDark ? 'dark' : 'light');

    // Interactive subtle gradient overlay
    const gradientColors = isDark
        ? ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)'] as const
        : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)'] as const;

    return (
        <View
            style={[
                styles.container,
                border && {
                    borderWidth: 1,
                    borderColor: colors.glassBorder,
                },
                style,
            ]}
        >
            <BlurView
                intensity={Platform.OS === 'android' ? intensity * 0.7 : intensity} // Android blur is stronger
                tint={blurTint}
                style={StyleSheet.absoluteFill}
            />

            <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: borderRadius.xl,
        backgroundColor: Platform.select({
            android: 'rgba(20,20,20,0.8)', // Fallback for some Android versions requiring base color
            ios: 'transparent'
        }),
    },
});
