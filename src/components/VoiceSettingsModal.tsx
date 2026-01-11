import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SpeechService from '../services/SpeechService';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

export interface VoiceSettings {
    gender: 'male' | 'female';
    persona: string;
    rate: number;
    pitch: number;
}

export const VOICE_PERSONAS = [
    { id: 'default', name: 'VEDA', description: 'Calm & Balanced', color: '#10B981', pitch: 1.0, rate: 0.95, testMsg: 'Namaste! I am VEDA, your wellness guide.' },
    { id: 'enthusiast', name: 'Ananya', description: 'Energetic & Motivating', color: '#F59E0B', pitch: 1.15, rate: 1.05, testMsg: 'Hey there! I am Ananya, ready to energize your day!' },
    { id: 'expert', name: 'Dr. Sharma', description: 'Professional & Precise', color: '#3B82F6', pitch: 0.85, rate: 0.9, testMsg: 'Good day. I am Dr. Sharma, here to assist you professionally.' },
    { id: 'friendly', name: 'Priya', description: 'Warm & Supportive', color: '#EC4899', pitch: 1.1, rate: 0.95, testMsg: 'Hello friend! I am Priya, always here for you.' },
    { id: 'guru', name: 'Guruji', description: 'Wise & Traditional', color: '#8B5CF6', pitch: 0.75, rate: 0.85, testMsg: 'Om Shanti. I am Guruji, your guide to wisdom.' }
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
    gender: 'female',
    persona: 'default',
    rate: 0.95,
    pitch: 1.0
};

interface VoiceSettingsModalProps {
    visible: boolean;
    onClose: () => void;
    currentSettings: VoiceSettings;
    onSave: (settings: VoiceSettings) => void;
}

export default function VoiceSettingsModal({ visible, onClose, currentSettings, onSave }: VoiceSettingsModalProps) {
    const { colors, isDark } = useTheme();
    const [gender, setGender] = useState<'male' | 'female'>(currentSettings.gender);
    const [selectedPersona, setSelectedPersona] = useState<string>(currentSettings.persona);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        if (visible) {
            setGender(currentSettings.gender);
            setSelectedPersona(currentSettings.persona);
        }
    }, [visible, currentSettings]);

    const handleSave = () => {
        const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
        const newSettings: VoiceSettings = {
            gender,
            persona: selectedPersona,
            rate: persona.rate,
            pitch: persona.pitch
        };
        onSave(newSettings);
        onClose();
    };

    const handleTestVoice = async () => {
        if (isTesting) {
            await SpeechService.stop();
            setIsTesting(false);
            return;
        }

        const persona = VOICE_PERSONAS.find(p => p.id === selectedPersona) || VOICE_PERSONAS[0];
        setIsTesting(true);

        // We use the persona's test message and pitch/rate
        // Note: SpeechService handles gender internally for voice selection
        await SpeechService.speak(
            persona.testMsg,
            'en', // Test in English
            gender,
            persona.rate,
            persona.pitch,
            () => setIsTesting(false)
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                        <View style={styles.titleContainer}>
                            <MaterialCommunityIcons name="account-voice" size={24} color={colors.primary} />
                            <Text style={[styles.title, { color: colors.text }]}>Voice Settings</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.subtext} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Gender Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Voice Gender</Text>
                            <View style={styles.genderContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.genderButton,
                                        { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                        gender === 'female' && { borderColor: '#EC4899', backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : '#FDF2F8' }
                                    ]}
                                    onPress={() => { Haptics.selectionAsync(); setGender('female'); }}
                                >
                                    <Ionicons name="woman" size={24} color={gender === 'female' ? '#EC4899' : colors.subtext} />
                                    <Text style={[styles.genderText, { color: gender === 'female' ? '#EC4899' : colors.subtext }]}>Female</Text>
                                    {gender === 'female' && <View style={styles.checkBadge}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.genderButton,
                                        { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                                        gender === 'male' && { borderColor: '#3B82F6', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }
                                    ]}
                                    onPress={() => { Haptics.selectionAsync(); setGender('male'); }}
                                >
                                    <Ionicons name="man" size={24} color={gender === 'male' ? '#3B82F6' : colors.subtext} />
                                    <Text style={[styles.genderText, { color: gender === 'male' ? '#3B82F6' : colors.subtext }]}>Male</Text>
                                    {gender === 'male' && <View style={[styles.checkBadge, { backgroundColor: '#3B82F6' }]}><Ionicons name="checkmark" size={12} color="#fff" /></View>}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Persona Section */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                <Ionicons name="sparkles" size={16} color={colors.primary} /> Voice Persona
                            </Text>
                            <View style={styles.personaGrid}>
                                {VOICE_PERSONAS.map((persona) => {
                                    const isSelected = selectedPersona === persona.id;
                                    return (
                                        <TouchableOpacity
                                            key={persona.id}
                                            style={[
                                                styles.personaCard,
                                                { backgroundColor: colors.inputBg, borderColor: isSelected ? persona.color : colors.inputBorder },
                                                isSelected && { backgroundColor: isDark ? `${persona.color}15` : `${persona.color}10` }
                                            ]}
                                            onPress={() => { Haptics.selectionAsync(); setSelectedPersona(persona.id); }}
                                        >
                                            <View style={[styles.personaIcon, { backgroundColor: `${persona.color}20` }]}>
                                                <Text style={[styles.personaInitial, { color: persona.color }]}>{persona.name.charAt(0)}</Text>
                                            </View>
                                            <View style={styles.personaInfo}>
                                                <Text style={[styles.personaName, { color: colors.text }]}>{persona.name}</Text>
                                                <Text style={[styles.personaDesc, { color: colors.subtext }]}>{persona.description}</Text>
                                            </View>
                                            {isSelected && (
                                                <View style={[styles.personaCheck, { backgroundColor: persona.color }]}>
                                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Test Voice Button */}
                        <TouchableOpacity
                            style={[
                                styles.testButton,
                                isTesting && styles.testButtonActive,
                                { borderColor: colors.inputBorder }
                            ]}
                            onPress={handleTestVoice}
                        >
                            {isTesting ? (
                                <>
                                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.testButtonTextActive}>Playing...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="volume-high" size={20} color={colors.text} />
                                    <Text style={[styles.testButtonText, { color: colors.text }]}>Test Voice</Text>
                                </>
                            )}
                        </TouchableOpacity>

                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
                        <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn]} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.footerBtn, styles.saveBtn]} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Save Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        width: '100%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        gap: 8,
        position: 'relative',
    },
    genderText: {
        fontWeight: '600',
        fontSize: 16,
    },
    checkBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#EC4899',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    personaGrid: {
        gap: 12,
    },
    personaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
        position: 'relative',
    },
    personaIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    personaInitial: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    personaInfo: {
        flex: 1,
    },
    personaName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    personaDesc: {
        fontSize: 12,
    },
    personaCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'transparent',
        marginBottom: 12,
    },
    testButtonActive: {
        backgroundColor: '#10B981',
        borderWidth: 0,
    },
    testButtonText: {
        fontWeight: '600',
        marginLeft: 8,
    },
    testButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    footerBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
    },
    saveBtn: {
        backgroundColor: '#10B981',
    },
    cancelBtnText: {
        color: '#94A3B8',
        fontWeight: '600',
        fontSize: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
