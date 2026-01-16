import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SettingsRowProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    value?: string;
    isToggle?: boolean;
    isEnabled?: boolean;
    onToggle?: (val: boolean) => void;
    onPress?: () => void;
    isLast?: boolean;
    color?: string; // For destructive actions or specific icon colors
}

export default function SettingsRow({
    label,
    icon,
    value,
    isToggle,
    isEnabled,
    onToggle,
    onPress,
    isLast,
    color
}: SettingsRowProps) {
    const { colors } = useTheme();

    const renderRightElement = () => {
        if (isToggle) {
            return (
                <Switch
                    value={isEnabled}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.inputBorder, true: colors.primary }}
                    thumbColor={'#fff'}
                />
            );
        }

        return (
            <View style={styles.rightContainer}>
                {value && (
                    <Text style={[styles.value, { color: colors.subtext }]}>{value}</Text>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
            </View>
        );
    };

    const Wrapper = isToggle ? View : TouchableOpacity;

    return (
        <Wrapper
            style={[
                styles.container,
                !isLast && { borderBottomWidth: 1, borderBottomColor: colors.inputBorder }
            ]}
            onPress={isToggle ? undefined : onPress}
            activeOpacity={isToggle ? 1 : 0.7}
        >
            <View style={styles.leftContainer}>
                {icon && (
                    <View style={[styles.iconBox, { backgroundColor: color ? `${color}15` : colors.card }]}>
                        <Ionicons name={icon} size={20} color={color || colors.text} />
                    </View>
                )}
                <Text style={[styles.label, { color: color || colors.text }]}>{label}</Text>
            </View>
            {renderRightElement()}
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        minHeight: 56,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    value: {
        fontSize: 15,
        fontWeight: '400',
    },
});
