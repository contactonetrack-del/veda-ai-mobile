import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceModeState } from '../../hooks/useVoiceConversation';

interface VoiceModeModalProps {
    visible: boolean;
    onClose: () => void;
    mode: VoiceModeState;
    audioLevel: number;
    transcript: string;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
    visible,
    onClose,
    mode,
    audioLevel,
    transcript
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <BlurView intensity={90} tint="dark" style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="chevron-down" size={32} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.statusContainer}>
                            <Text style={styles.statusText}>
                                {mode === 'listening' ? 'Listening...' :
                                    mode === 'speaking' ? 'Speaking...' :
                                        mode === 'processing' ? 'Thinking...' : 'Ready'}
                            </Text>
                        </View>

                        <View style={styles.visualizerContainer}>
                            <AudioVisualizer
                                level={audioLevel}
                                isActive={mode === 'listening' || mode === 'speaking'}
                                color={mode === 'listening' ? '#4A90E2' : mode === 'speaking' ? '#50E3C2' : '#FFFFFF'}
                            />
                        </View>

                        <View style={styles.transcriptContainer}>
                            <Text style={styles.transcriptText} numberOfLines={3}>
                                {transcript || "Say something..."}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.controls}>
                        {/* Placeholder for future controls like mic toggle */}
                        <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'flex-start',
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    statusContainer: {
        marginBottom: 40,
    },
    statusText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '600',
        opacity: 0.9,
    },
    visualizerContainer: {
        marginBottom: 60,
    },
    transcriptContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    transcriptText: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 26,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
