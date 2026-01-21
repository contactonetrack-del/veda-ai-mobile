/**
 * ThinkingBubble Component
 * Displays AI reasoning traces from Ollama Cloud Thinking mode
 * Collapsible panel with brain icon indicator
 */
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing } from '../../config/spacing';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ThinkingBubbleProps {
    thinking: string;
    thinkingLevel?: 'low' | 'medium' | 'high';
    defaultExpanded?: boolean;
}

const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({
    thinking,
    thinkingLevel = 'medium',
    defaultExpanded = false,
}) => {
    const { colors, isDark } = useTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);
    const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        Animated.timing(rotateAnim, {
            toValue: expanded ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        setExpanded(!expanded);
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const getLevelColor = () => {
        switch (thinkingLevel) {
            case 'high':
                return '#8B5CF6'; // Purple for deep thinking
            case 'medium':
                return colors.primary;
            case 'low':
                return '#6B7280'; // Gray for quick thinking
            default:
                return colors.primary;
        }
    };

    const getLevelLabel = () => {
        switch (thinkingLevel) {
            case 'high':
                return 'Deep Reasoning';
            case 'medium':
                return 'Reasoning';
            case 'low':
                return 'Quick Think';
            default:
                return 'Thinking';
        }
    };

    const levelColor = getLevelColor();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={toggleExpand}
                activeOpacity={0.7}
                style={[
                    styles.header,
                    {
                        backgroundColor: isDark
                            ? `${levelColor}15`
                            : `${levelColor}10`,
                        borderColor: isDark
                            ? `${levelColor}30`
                            : `${levelColor}20`,
                    },
                ]}
                accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} AI thinking process`}
                accessibilityRole="button"
            >
                <View style={styles.headerLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: `${levelColor}20` }]}>
                        <Ionicons
                            name="bulb"
                            size={14}
                            color={levelColor}
                        />
                    </View>
                    <Text style={[styles.headerText, { color: levelColor }]}>
                        {getLevelLabel()}
                    </Text>
                    <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
                        <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                            {thinkingLevel?.toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Ionicons
                        name="chevron-down"
                        size={16}
                        color={levelColor}
                    />
                </Animated.View>
            </TouchableOpacity>

            {expanded && (
                <LinearGradient
                    colors={isDark
                        ? [`${levelColor}08`, `${levelColor}03`]
                        : [`${levelColor}05`, `${levelColor}02`]
                    }
                    style={[
                        styles.content,
                        {
                            borderColor: isDark
                                ? `${levelColor}20`
                                : `${levelColor}15`,
                        },
                    ]}
                >
                    <Text style={[styles.thinkingText, { color: colors.subtext }]}>
                        {thinking}
                    </Text>
                </LinearGradient>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[3],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.md,
        borderWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[2],
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    levelBadge: {
        marginLeft: spacing[2],
        paddingHorizontal: spacing[2],
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    levelBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    content: {
        marginTop: spacing[2],
        padding: spacing[3],
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderTopWidth: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    thinkingText: {
        fontSize: 13,
        lineHeight: 20,
        fontStyle: 'italic',
    },
});

export default ThinkingBubble;
