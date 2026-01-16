import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.subtext }]}>{title}</Text>
            <View style={[styles.content, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    content: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
});
