/**
 * AttachmentModal - Premium Glassmorphic Attachment Action Sheet
 * A beautiful bottom sheet for selecting attachment types
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Pressable,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius } from '../../config/spacing';
import { brand } from '../../config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AttachmentOption {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle: string;
    color: string;
}

const ATTACHMENT_OPTIONS: AttachmentOption[] = [
    {
        id: 'photo',
        icon: 'images-outline',
        label: 'Photo Library',
        subtitle: 'Select from gallery',
        color: brand.emerald[500],
    },
    {
        id: 'camera',
        icon: 'camera-outline',
        label: 'Take Photo',
        subtitle: 'Use camera',
        color: brand.violet[500],
    },
    {
        id: 'document',
        icon: 'document-text-outline',
        label: 'Document',
        subtitle: 'PDF, Word, etc.',
        color: '#F59E0B',
    },
    {
        id: 'audio',
        icon: 'musical-notes-outline',
        label: 'Audio File',
        subtitle: 'MP3, WAV, etc.',
        color: '#EC4899',
    },
];

interface AttachmentModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (type: string) => void;
}

export default function AttachmentModal({
    visible,
    onClose,
    onSelect,
}: AttachmentModalProps) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 10,
                    tension: 65,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleSelect = (type: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(type);
        onClose();
    };

    const handleClose = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            {/* Backdrop */}
            <Animated.View
                style={[
                    styles.backdrop,
                    { opacity: backdropAnim }
                ]}
            >
                <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
            </Animated.View>

            {/* Content */}
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{ translateY: slideAnim }],
                        paddingBottom: insets.bottom + 16,
                    },
                ]}
            >
                <BlurView
                    intensity={Platform.OS === 'ios' ? 80 : 100} // Increased intensity
                    tint={isDark ? 'dark' : 'light'}
                    style={styles.blurContainer}
                >
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Add Attachment
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.subtext }]}>
                            Select a file type to attach
                        </Text>
                    </View>

                    {/* Options Grid */}
                    <View style={styles.optionsGrid}>
                        {ATTACHMENT_OPTIONS.map((option, index) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.option,
                                    {
                                        backgroundColor: isDark
                                            ? `${option.color}25` // Increased from 15
                                            : `${option.color}20`, // Increased from 10
                                        borderColor: `${option.color}40`, // Increased from 30
                                    },
                                ]}
                                onPress={() => handleSelect(option.id)}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: `${option.color}20` },
                                    ]}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={28}
                                        color={option.color}
                                    />
                                </View>
                                <Text style={[styles.optionLabel, { color: colors.text }]}>
                                    {option.label}
                                </Text>
                                <Text style={[styles.optionSubtitle, { color: colors.subtext }]}>
                                    {option.subtitle}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={[
                            styles.cancelButton,
                            {
                                backgroundColor: isDark ? colors.card : colors.inputBg,
                                borderColor: colors.cardBorder,
                            },
                        ]}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.cancelText, { color: colors.text }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </BlurView>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Increased opacity from 0.5 to 0.85
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    blurContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[4],
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: spacing[3],
        paddingBottom: spacing[2],
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing[4],
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing[3],
        marginBottom: spacing[4],
    },
    option: {
        width: '48%',
        padding: spacing[4],
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing[3],
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 12,
    },
    cancelButton: {
        paddingVertical: spacing[4],
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
