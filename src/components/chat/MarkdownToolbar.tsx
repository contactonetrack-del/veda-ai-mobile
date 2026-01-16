import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface MarkdownToolbarProps {
    visible: boolean;
    onFormat: (prefix: string, suffix: string) => void;
    onInsert: (text: string) => void;
}

interface ToolbarButton {
    id: string;
    icon: string;
    iconSet: 'ionicons' | 'material';
    label: string;
    prefix: string;
    suffix: string;
    isInsert?: boolean;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
    { id: 'bold', icon: 'format-bold', iconSet: 'material', label: 'Bold', prefix: '**', suffix: '**' },
    { id: 'italic', icon: 'format-italic', iconSet: 'material', label: 'Italic', prefix: '_', suffix: '_' },
    { id: 'code', icon: 'code-tags', iconSet: 'material', label: 'Code', prefix: '`', suffix: '`' },
    { id: 'list', icon: 'format-list-bulleted', iconSet: 'material', label: 'List', prefix: '\n- ', suffix: '', isInsert: true },
    { id: 'quote', icon: 'format-quote-close', iconSet: 'material', label: 'Quote', prefix: '\n> ', suffix: '', isInsert: true },
];

export default function MarkdownToolbar({ visible, onFormat, onInsert }: MarkdownToolbarProps) {
    const { colors, isDark } = useTheme();

    if (!visible) return null;

    const handlePress = (button: ToolbarButton) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (button.isInsert) {
            onInsert(button.prefix);
        } else {
            onFormat(button.prefix, button.suffix);
        }
    };

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[
                styles.container,
                {
                    backgroundColor: isDark ? colors.card : '#F8F9FA',
                    borderColor: colors.cardBorder,
                }
            ]}
        >
            {TOOLBAR_BUTTONS.map((button) => (
                <TouchableOpacity
                    key={button.id}
                    style={[styles.button, { backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }]}
                    onPress={() => handlePress(button)}
                    accessibilityLabel={`Format as ${button.label}`}
                    accessibilityRole="button"
                >
                    <MaterialCommunityIcons
                        name={button.icon as any}
                        size={20}
                        color={colors.primary}
                    />
                </TouchableOpacity>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        borderTopWidth: 1,
        justifyContent: 'center',
    },
    button: {
        width: 40,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
});
