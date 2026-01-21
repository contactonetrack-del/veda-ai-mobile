import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

interface SuggestionAction {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    prompt: string;
    color: string;
}

interface ChatEmptyStateProps {
    suggestions: SuggestionAction[];
    displayedSuggestions: SuggestionAction[];
    showAllSuggestions: boolean;
    setShowAllSuggestions: (show: boolean) => void;
    onSuggestionPress: (prompt: string) => void;
}

const ChatEmptyState = ({
    displayedSuggestions,
    showAllSuggestions,
    setShowAllSuggestions,
    onSuggestionPress
}: ChatEmptyStateProps) => {
    const { colors } = useTheme();

    return (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>What can I help with?</Text>

            <View style={styles.suggestionsGrid}>
                {displayedSuggestions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.suggestionItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                        onPress={() => onSuggestionPress(action.prompt)}
                    >
                        <Ionicons name={action.icon} size={20} color={action.color} />
                        <Text style={[styles.suggestionText, { color: colors.subtext }]}>{action.label}</Text>
                    </TouchableOpacity>
                ))}

                {!showAllSuggestions && (
                    <TouchableOpacity
                        style={[styles.suggestionItem, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setShowAllSuggestions(true);
                        }}
                    >
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.subtext} />
                        <Text style={[styles.suggestionText, { color: colors.subtext }]}>More</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

export default ChatEmptyState;

const styles = StyleSheet.create({
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 40,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    suggestionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
