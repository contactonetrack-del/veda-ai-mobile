import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ReactionPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (emoji: string) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '💡'];

export const ReactionPicker = ({ visible, onClose, onSelect }: ReactionPickerProps) => {
    const { isDark, colors } = useTheme();

    if (!visible) return null;

    const handleSelect = (emoji: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(emoji);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <View style={[
                        styles.container,
                        { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: colors.cardBorder }
                    ]}>
                        {EMOJIS.map((emoji) => (
                            <TouchableOpacity
                                key={emoji}
                                style={styles.emojiButton}
                                onPress={() => handleSelect(emoji)}
                            >
                                <Text style={styles.emojiText}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        gap: 12,
    },
    emojiButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    emojiText: {
        fontSize: 24,
    },
});
