import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import voiceService from '../services/voiceService';

/**
 * VoiceButton - Push-to-talk voice input component for React Native
 * 
 * Props:
 * - onTranscript: (text, language) => void - Called when speech is transcribed
 * - onResponse: (text, language) => void - Called when AI responds
 * - size: number - Button size (default: 56)
 * - style: object - Additional styles
 */
export default function VoiceButton({ onTranscript, onResponse, size = 56, style }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);

    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    // Pulse animation for recording
    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording, pulseAnim]);

    // Connect to voice service on mount
    useEffect(() => {
        voiceService.setCallbacks({
            onConnectionChange: setIsConnected,
            onTranscript: (text, language, confidence) => {
                onTranscript?.(text, language);
                setIsProcessing(true);
            },
            onResponse: (text, language) => {
                onResponse?.(text, language);
                setIsProcessing(false);
            },
            onAudioStart: () => setIsPlaying(true),
            onAudioEnd: () => setIsPlaying(false),
            onError: (msg) => {
                setError(msg);
                setIsProcessing(false);
                setIsRecording(false);
                setTimeout(() => setError(null), 3000);
            },
        });

        voiceService.connect();

        return () => {
            voiceService.disconnect();
        };
    }, [onTranscript, onResponse]);

    // Handle press in (start recording)
    const handlePressIn = useCallback(async () => {
        if (!isConnected) {
            setError('Connecting...');
            return;
        }

        const success = await voiceService.startRecording();
        if (success) {
            setIsRecording(true);
            setError(null);
        }
    }, [isConnected]);

    // Handle press out (stop recording)
    const handlePressOut = useCallback(async () => {
        if (isRecording) {
            await voiceService.stopRecording();
            setIsRecording(false);
        }
    }, [isRecording]);

    // Determine button state
    const getButtonStyle = () => {
        if (isPlaying) return styles.playing;
        if (isProcessing) return styles.processing;
        if (isRecording) return styles.recording;
        if (!isConnected) return styles.disconnected;
        return styles.idle;
    };

    // Determine icon
    const getIcon = () => {
        if (isPlaying) return 'volume-high';
        if (isProcessing) return 'hourglass';
        if (isRecording) return 'mic';
        if (!isConnected) return 'mic-off';
        return 'mic-outline';
    };

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                    style={[styles.button, { width: size, height: size, borderRadius: size / 2 }, getButtonStyle()]}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isProcessing || isPlaying}
                    activeOpacity={0.8}
                >
                    <Ionicons name={getIcon()} size={size * 0.45} color="white" />
                </TouchableOpacity>
            </Animated.View>

            {error && (
                <View style={styles.errorBadge}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {isRecording && (
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>🎙️ Listening...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    idle: {
        backgroundColor: '#7c3aed',
    },
    recording: {
        backgroundColor: '#ef4444',
    },
    processing: {
        backgroundColor: '#3b82f6',
    },
    playing: {
        backgroundColor: '#10b981',
    },
    disconnected: {
        backgroundColor: '#9ca3af',
    },
    errorBadge: {
        position: 'absolute',
        bottom: '110%',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    errorText: {
        color: 'white',
        fontSize: 12,
    },
    statusBadge: {
        position: 'absolute',
        bottom: '110%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
    },
});
