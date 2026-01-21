import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Animated,
    Platform,
    Dimensions,
    Switch
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SpeechService from '../services/SpeechService';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

export interface VoiceSettings {
    voiceId: string;
    voiceName: string;
    gender: 'male' | 'female';
    speed: number;
    pitch: number;
    language: string;
    autoSpeak: boolean;
}

// Premium voice presets inspired by top TTS platforms (OpenAI, ElevenLabs)
export const PREMIUM_VOICES = [
    {
        id: 'alloy',
        name: 'Alloy',
        description: 'Neutral & Versatile',
        gender: 'female' as const,
        icon: '🎭',
        color: '#6366F1',
        pitch: 1.0,
        speed: 0.95,
        testPhrase: 'Hello! I am Alloy, your versatile AI voice assistant.'
    },
    {
        id: 'echo',
        name: 'Echo',
        description: 'Deep & Smooth',
        gender: 'male' as const,
        icon: '🎵',
        color: '#3B82F6',
        pitch: 0.85,
        speed: 0.90,
        testPhrase: 'Hello! I am Echo, with a deep and smooth voice.'
    },
    {
        id: 'nova',
        name: 'Nova',
        description: 'Warm & Bright',
        gender: 'female' as const,
        icon: '✨',
        color: '#EC4899',
        pitch: 1.1,
        speed: 1.0,
        testPhrase: 'Hi there! I am Nova, bringing warmth to every word.'
    },
    {
        id: 'shimmer',
        name: 'Shimmer',
        description: 'Soft & Clear',
        gender: 'female' as const,
        icon: '💫',
        color: '#14B8A6',
        pitch: 1.05,
        speed: 0.95,
        testPhrase: 'Hello! I am Shimmer, with a soft and clear voice.'
    },
    {
        id: 'onyx',
        name: 'Onyx',
        description: 'Professional & Bold',
        gender: 'male' as const,
        icon: '🖤',
        color: '#374151',
        pitch: 0.80,
        speed: 0.92,
        testPhrase: 'Greetings! I am Onyx, professional and confident.'
    },
    {
        id: 'fable',
        name: 'Fable',
        description: 'Storytelling',
        gender: 'male' as const,
        icon: '📚',
        color: '#8B5CF6',
        pitch: 0.95,
        speed: 0.88,
        testPhrase: 'Welcome! I am Fable, here to narrate your journey.'
    }
];

const SPEED_OPTIONS = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: '1x', value: 1.0 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2.0 }
];

const PITCH_OPTIONS = [
    { label: 'Low', value: 0.7 },
    { label: 'Normal', value: 1.0 },
    { label: 'High', value: 1.3 }
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
    voiceId: 'alloy',
    voiceName: 'Alloy',
    gender: 'female',
    speed: 1.0,
    pitch: 1.0,
    language: 'en',
    autoSpeak: true
};

interface VoiceSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    currentSettings: VoiceSettings;
    onSave: (settings: VoiceSettings) => void;
}

export default function VoiceSettingsModal({ visible, onClose, currentSettings, onSave }: VoiceSettingsModalProps) {
    const { colors, isDark } = useTheme();
    const [selectedVoice, setSelectedVoice] = useState<string>(currentSettings.voiceId || 'alloy');
    const [speed, setSpeed] = useState<number>(currentSettings.speed || 1.0);
    const [pitch, setPitch] = useState<number>(currentSettings.pitch || 1.0);
    const [autoSpeak, setAutoSpeak] = useState<boolean>(currentSettings.autoSpeak ?? true);
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const slideAnim = React.useRef(new Animated.Value(300)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setSelectedVoice(currentSettings.voiceId || 'alloy');
            setSpeed(currentSettings.speed || 1.0);
            setPitch(currentSettings.pitch || 1.0);
            setAutoSpeak(currentSettings.autoSpeak ?? true);

            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 90
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [visible, currentSettings]);

    const handleSave = () => {
        const voice = PREMIUM_VOICES.find(v => v.id === selectedVoice) || PREMIUM_VOICES[0];
        const newSettings: VoiceSettings = {
            voiceId: voice.id,
            voiceName: voice.name,
            gender: voice.gender,
            speed,
            pitch,
            language: 'en',
            autoSpeak
        };
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSave(newSettings);
        onClose();
    };

    const handleTestVoice = async (voiceId: string) => {
        if (isTesting === voiceId) {
            await SpeechService.stop();
            setIsTesting(null);
            return;
        }

        const voice = PREMIUM_VOICES.find(v => v.id === voiceId);
        if (!voice) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsTesting(voiceId);

        await SpeechService.speak(
            voice.testPhrase,
            'en',
            voice.gender,
            speed,
            voice.pitch,
            () => setIsTesting(null)
        );
    };

    const selectedVoiceData = PREMIUM_VOICES.find(v => v.id === selectedVoice) || PREMIUM_VOICES[0];

    // Helper to add opacity to hex color safely
    const getTransparentColor = (hex: string, opacity: string = '20') => {
        return hex + opacity;
    };

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <Animated.View
                    style={[
                        styles.content,
                        {
                            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    {Platform.OS === 'ios' && (
                        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    )}

                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <MaterialCommunityIcons name="microphone-settings" size={24} color={colors.primary} />
                            <Text style={[styles.title, { color: colors.text }]}>Voice Settings</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={22} color={colors.subtext} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Voice Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>SELECT VOICE</Text>
                            <View style={styles.voiceGrid}>
                                {PREMIUM_VOICES.map((voice) => {
                                    const isSelected = selectedVoice === voice.id;
                                    const isPlaying = isTesting === voice.id;

                                    return (
                                        <TouchableOpacity
                                            key={voice.id}
                                            style={[
                                                styles.voiceCard,
                                                {
                                                    backgroundColor: isDark ? colors.card : '#F8FAFC',
                                                    borderColor: isSelected ? voice.color : 'transparent'
                                                }
                                            ]}
                                            onPress={() => {
                                                Haptics.selectionAsync();
                                                setSelectedVoice(voice.id);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.voiceIcon, { backgroundColor: getTransparentColor(voice.color) }]}>
                                                <Text style={styles.voiceEmoji}>{voice.icon}</Text>
                                            </View>
                                            <View style={styles.voiceInfo}>
                                                <Text style={[styles.voiceName, { color: colors.text }]}>{voice.name}</Text>
                                                <Text style={[styles.voiceDesc, { color: colors.subtext }]}>{voice.description}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.playButton, { backgroundColor: isPlaying ? voice.color : getTransparentColor(voice.color) }]}
                                                onPress={() => handleTestVoice(voice.id)}
                                            >
                                                {isPlaying ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <Ionicons name="play" size={14} color={voice.color} />
                                                )}
                                            </TouchableOpacity>
                                            {isSelected && (
                                                <View style={[styles.selectedBadge, { backgroundColor: voice.color }]}>
                                                    <Ionicons name="checkmark" size={10} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Speed Control */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>SPEED</Text>
                            <View style={styles.optionRow}>
                                {SPEED_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.label}
                                        style={[
                                            styles.optionChip,
                                            {
                                                backgroundColor: speed === option.value
                                                    ? selectedVoiceData.color
                                                    : isDark ? colors.card : '#F1F5F9',
                                                borderColor: speed === option.value ? selectedVoiceData.color : 'transparent'
                                            }
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSpeed(option.value);
                                        }}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            { color: speed === option.value ? '#fff' : colors.text }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Pitch Control */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>PITCH</Text>
                            <View style={styles.optionRow}>
                                {PITCH_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.label}
                                        style={[
                                            styles.optionChip,
                                            styles.pitchChip,
                                            {
                                                backgroundColor: pitch === option.value
                                                    ? selectedVoiceData.color
                                                    : isDark ? colors.card : '#F1F5F9',
                                                borderColor: pitch === option.value ? selectedVoiceData.color : 'transparent'
                                            }
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setPitch(option.value);
                                        }}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            { color: pitch === option.value ? '#fff' : colors.text }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Auto Speak Toggle */}
                        <View style={styles.section}>
                            <View style={styles.toggleRow}>
                                <View style={styles.toggleInfo}>
                                    <Text style={[styles.toggleLabel, { color: colors.text }]}>Auto Speak</Text>
                                    <Text style={[styles.toggleDesc, { color: colors.subtext }]}>Automatically speak AI responses</Text>
                                </View>
                                <Switch
                                    value={autoSpeak}
                                    onValueChange={(value) => {
                                        Haptics.selectionAsync();
                                        setAutoSpeak(value);
                                    }}
                                    trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: selectedVoiceData.color }}
                                    thumbColor={autoSpeak ? '#fff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        {/* Preview Button */}
                        <TouchableOpacity
                            style={[styles.previewButton, { borderColor: colors.cardBorder }]}
                            onPress={() => handleTestVoice(selectedVoice)}
                        >
                            {isTesting === selectedVoice ? (
                                <>
                                    <ActivityIndicator size="small" color={selectedVoiceData.color} style={{ marginRight: 10 }} />
                                    <Text style={[styles.previewText, { color: selectedVoiceData.color }]}>Playing...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="volume-high" size={20} color={colors.text} />
                                    <Text style={[styles.previewText, { color: colors.text }]}>Preview Voice</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
                        <TouchableOpacity
                            style={[styles.footerBtn, styles.cancelBtn, { backgroundColor: isDark ? colors.card : '#F1F5F9' }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelText, { color: colors.subtext }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.footerBtn, styles.saveBtn, { backgroundColor: selectedVoiceData.color }]}
                            onPress={handleSave}
                        >
                            <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '90%',
        overflow: 'hidden',
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 12,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    voiceGrid: {
        gap: 10,
    },
    voiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 2,
        position: 'relative',
    },
    voiceIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceEmoji: {
        fontSize: 22,
    },
    voiceInfo: {
        flex: 1,
        marginLeft: 14,
    },
    voiceName: {
        fontSize: 16,
        fontWeight: '700',
    },
    voiceDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    pitchChip: {
        flex: 1,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    toggleInfo: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    toggleDesc: {
        fontSize: 14,
    },
    previewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
    },
    previewText: {
        fontWeight: '600',
        marginLeft: 10,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    footerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
    },
    cancelBtn: {},
    saveBtn: {},
    cancelText: {
        fontWeight: '600',
        fontSize: 16,
    },
    saveText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});
