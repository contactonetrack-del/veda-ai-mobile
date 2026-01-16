import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../config';

const { width, height } = Dimensions.get('window');

interface ReactionMenuProps {
    visible: boolean;
    onClose: () => void;
    onReactionSelect: (reaction: string) => void;
    onActionSelect: (action: 'copy' | 'reply' | 'regenerate' | 'delete') => void;
    messageContent?: string; // Optional: show preview
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function ReactionMenu({
    visible,
    onClose,
    onReactionSelect,
    onActionSelect,
    messageContent,
}: ReactionMenuProps) {
    const { colors, isDark } = useTheme();
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 90,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    const handleAction = (action: 'copy' | 'reply' | 'regenerate' | 'delete') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onActionSelect(action);
        onClose();
    };

    const handleReaction = (emoji: string) => {
        Haptics.selectionAsync();
        onReactionSelect(emoji);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            accessibilityViewIsModal={true}
        >

            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                        <BlurView
                            intensity={Platform.OS === 'ios' ? 30 : 100}
                            tint={isDark ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.indicator} />

                    {/* Reaction Row */}
                    <View style={styles.reactionContainer}>
                        {REACTIONS.map((emoji) => (
                            <TouchableOpacity
                                key={emoji}
                                style={[styles.reactionButton, { backgroundColor: isDark ? '#2C2C2C' : '#F5F5F5' }]}
                                onPress={() => handleReaction(emoji)}
                                accessibilityLabel={`React with ${emoji}`}
                                accessibilityRole="button"
                            >

                                <Text style={styles.emoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]} />

                    {/* Actions List */}
                    <View style={styles.actionList}>
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => handleAction('reply')}
                            accessibilityLabel="Reply to message"
                            accessibilityRole="button"
                        >

                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2C2C2C' : '#F0F5FF' }]}>
                                <Ionicons name="arrow-undo" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.actionText, { color: colors.text }]}>Reply</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => handleAction('copy')}
                            accessibilityLabel="Copy message text"
                            accessibilityRole="button"
                        >

                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2C2C2C' : '#F0F5FF' }]}>
                                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.actionText, { color: colors.text }]}>Copy Text</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => handleAction('regenerate')}
                            accessibilityLabel="Regenerate response"
                            accessibilityRole="button"
                        >

                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2C2C2C' : '#F0F5FF' }]}>
                                <Ionicons name="refresh" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.actionText, { color: colors.text }]}>Regenerate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => handleAction('delete')}
                            accessibilityLabel="Delete message"
                            accessibilityRole="button"
                        >

                            <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </View>
                            <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    sheet: {
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing[6],
        paddingBottom: Platform.OS === 'ios' ? 40 : spacing[6],
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(150,150,150,0.3)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing[6],
    },
    reactionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing[6],
    },
    reactionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 24,
    },
    divider: {
        height: 1,
        marginBottom: spacing[6],
        borderRadius: 1,
    },
    actionList: {
        gap: spacing[4],
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing[2],
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[4],
    },
    actionText: {
        ...typography.button,
        fontSize: 16,
    },
});
