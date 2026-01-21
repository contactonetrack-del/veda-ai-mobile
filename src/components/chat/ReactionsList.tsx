import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../config';

interface ReactionsListProps {
    reactions: string[];
    onReactionPress?: (emoji: string) => void;
    isUser?: boolean;
}

export const ReactionsList = ({ reactions, onReactionPress, isUser }: ReactionsListProps) => {
    const { colors, isDark } = useTheme();

    if (!reactions || reactions.length === 0) return null;

    // Count identical reactions
    const reactionCounts = reactions.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <View style={[
            styles.container,
            isUser ? styles.userContainer : styles.aiContainer
        ]}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
                <TouchableOpacity
                    key={emoji}
                    style={[
                        styles.reactionItem,
                        {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                        }
                    ]}
                    onPress={() => onReactionPress?.(emoji)}
                >
                    <Text style={styles.emoji}>{emoji}</Text>
                    {count > 1 && (
                        <Text style={[styles.count, { color: colors.subtext }]}>{count}</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: 4,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    aiContainer: {
        justifyContent: 'flex-start',
    },
    reactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    emoji: {
        fontSize: 14,
    },
    count: {
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    },
});
