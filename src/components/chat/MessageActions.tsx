import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated as RNAnimated, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../config';

interface ActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
    backgroundColor?: string;
    size?: number;
}

const ActionButton = ({ icon, onPress, color, backgroundColor, size = 14 }: ActionButtonProps) => (
    <TouchableOpacity
        style={[styles.actionButton, backgroundColor ? { backgroundColor } : {}]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
);

interface SwipeActionProps {
    dragX: RNAnimated.AnimatedInterpolation<number>;
    onAction: () => void;
}

export const LeftSwipeAction = ({ dragX, onAction }: SwipeActionProps) => {
    const { colors } = useTheme();
    const scale = dragX.interpolate({
        inputRange: [0, 50],
        outputRange: [0.5, 1.2],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.swipeLeftContainer}>
            <RNAnimated.View style={{ transform: [{ scale }] }}>
                <Ionicons name="arrow-undo-circle" size={28} color={colors.primary} />
            </RNAnimated.View>
        </View>
    );
};

interface RightSwipeActionsProps {
    onReply?: () => void;
    onCopy?: () => void;
    onDelete?: () => void;
    closeSwipe: () => void;
    content: string;
}

export const RightSwipeActions = ({ onReply, onCopy, onDelete, closeSwipe, content }: RightSwipeActionsProps) => {
    const { colors } = useTheme();
    const accent = colors.accent;

    return (
        <View style={styles.rightActionsContainer}>
            {onReply && (
                <TouchableOpacity
                    style={[styles.actionButtonSwipe, { backgroundColor: colors.primary + '20' }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onReply();
                        closeSwipe();
                    }}
                >
                    <Ionicons name="arrow-undo-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            )}
            {onCopy && (
                <TouchableOpacity
                    style={[styles.actionButtonSwipe, { backgroundColor: accent + '20' }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        Clipboard.setString(content);
                        onCopy();
                        closeSwipe();
                    }}
                >
                    <Ionicons name="copy-outline" size={24} color={accent} />
                </TouchableOpacity>
            )}
            {onDelete && (
                <TouchableOpacity
                    style={[styles.actionButtonSwipe, { backgroundColor: colors.error + '10' }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onDelete();
                        closeSwipe();
                    }}
                >
                    <Ionicons name="trash-outline" size={24} color={colors.error} />
                </TouchableOpacity>
            )}
        </View>
    );
};

interface MessageFooterActionsProps {
    isLatest: boolean;
    onCopy: () => void;
    onRegenerate?: () => void;
    isDark: boolean;
}

export const MessageFooterActions = ({ isLatest, onCopy, onRegenerate, isDark }: MessageFooterActionsProps) => {
    const { colors } = useTheme();
    if (!isLatest) return null;

    return (
        <View style={styles.actionRow}>
            <ActionButton
                icon="copy-outline"
                onPress={onCopy}
                color={colors.subtext}
                backgroundColor={isDark ? colors.inputBg : colors.backgroundSecondary}
            />
            {onRegenerate && (
                <ActionButton
                    icon="refresh-outline"
                    onPress={onRegenerate}
                    color={colors.subtext}
                    backgroundColor={isDark ? colors.inputBg : colors.backgroundSecondary}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    actionButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    swipeLeftContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        marginRight: 8,
    },
    rightActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing[4],
        gap: spacing[2],
    },
    actionButtonSwipe: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
