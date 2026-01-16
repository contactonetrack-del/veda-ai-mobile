import React, { useState, useEffect, useRef } from 'react';
import {
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Animated,
} from 'react-native';
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
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [shouldRender, setShouldRender] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setShouldRender(false));
        }
    }, [visible]);

    if (!shouldRender) return null;

    const handleSelect = (text: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(text);
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {suggestions.map((item) => (
                    <TouchableOpacity
                        key={item.id}
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
                ))}
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[2],
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        gap: spacing[2],
    },
    chip: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3], // Increased padding for better touch target
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
