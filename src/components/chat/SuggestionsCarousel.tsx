import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeInRight, FadeOut, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../config/spacing';

interface Suggestion {
    id: string;
    text: string;
    icon?: string;
}

interface SuggestionsCarouselProps {
    suggestions: Suggestion[];
    onSelect: (text: string) => void;
    visible: boolean;
}

export default function SuggestionsCarousel({ suggestions, onSelect, visible }: SuggestionsCarouselProps) {
    const { colors, isDark } = useTheme();

    if (!visible && suggestions.length === 0) return null;
    // We can rely on 'visible' prop to mount/unmount or just render if visible.
    // If we want exit animations when 'visible' becomes false, we need to keep rendering until exit finished.
    // For simplicity, we'll assume the parent controls visibility, but normally we'd render <Animated.View> that hides.
    // However, Reanimated Layout animations on mounting/unmounting items work best.

    // If visual toggle is needed, we can wrap in Animated.View.
    // But here 'visible' likely toggles the component in ChatInputBar. 
    // Let's wrap the ScrollView in an Animated View for overall fade, but use Reanimated for items.

    if (!visible) return null;

    const handleSelect = (text: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(text);
    };

    return (
        <Animated.View
            style={styles.container}
            entering={FadeInRight.duration(300)}
            exiting={FadeOut.duration(200)}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {suggestions.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        entering={FadeInRight.delay(index * 100).springify().damping(12)}
                        layout={Layout.springify()}
                    >
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isDark ? colors.card : '#F5F5F5',
                                    borderColor: colors.cardBorder,
                                    borderWidth: isDark ? 1 : 0,
                                }
                            ]}
                            onPress={() => handleSelect(item.text)}
                        >
                            <Text style={[styles.chipText, { color: colors.text }]}>
                                {item.text}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[2],
        height: 50, // Fixed height to prevent layout jumps
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        gap: spacing[2],
        alignItems: 'center', // Center vertically
    },
    chip: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
