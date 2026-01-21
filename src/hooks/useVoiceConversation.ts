import { useState, useEffect, useCallback, useRef } from 'react';
import VoiceInputService from '../services/VoiceInputService';
import SpeechService, { SupportedLanguage, VoiceGender } from '../services/SpeechService';

export type VoiceModeState = 'idle' | 'listening' | 'speaking' | 'processing';

interface UseVoiceConversationProps {
    language: SupportedLanguage;
    voiceGender: VoiceGender;
    onInputComplete: (text: string) => Promise<void>;
    onError?: (error: Error) => void;
}

export const useVoiceConversation = ({
    language,
    voiceGender,
    onInputComplete,
    onError
}: UseVoiceConversationProps) => {
    const [mode, setMode] = useState<VoiceModeState>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [transcript, setTranscript] = useState('');

    // We use a ref to track if the session is active to prevent loops after cancellation
    const isSessionActive = useRef(false);

    const startSession = useCallback(async () => {
        isSessionActive.current = true;
        setMode('listening');
        await startListening();
    }, []);

    const endSession = useCallback(async () => {
        isSessionActive.current = false;
        setMode('idle');
        await VoiceInputService.stopRecording();
        await SpeechService.stop();
    }, []);

    const startListening = useCallback(async () => {
        if (!isSessionActive.current) return;

        setMode('listening');
        setTranscript(''); // Clear previous transcript

        const success = await VoiceInputService.startRecording();
        if (!success) {
            setMode('idle');
            onError?.(new Error('Failed to start recording'));
        }
    }, [onError]);

    // Handle VAD events
    useEffect(() => {
        VoiceInputService.setListeners({
            onSpeechStart: () => {
                // UI could show "Detected speech..." if needed
                // console.log('Speech started');
            },
            onSpeechEnd: async () => {
                if (!isSessionActive.current || mode !== 'listening') return;

                // Speech ended - transitions to processing
                setMode('processing');

                // Stop recording and get URI
                const uri = await VoiceInputService.stopRecording();
                if (uri) {
                    // Transcribe
                    const text = await VoiceInputService.transcribeAudio(uri, language);
                    if (text && text.trim()) {
                        setTranscript(text);
                        // Send to parent to handle (e.g. generate AI response)
                        // The parent is responsible for calling speakResponse
                        await onInputComplete(text);
                    } else {
                        // No text detected (noise?), resume listening? 
                        // For now, let's resume listening if no text
                        if (isSessionActive.current) {
                            await startListening();
                        }
                    }
                } else {
                    // Error getting URI
                    if (isSessionActive.current) {
                        await startListening(); // Retry
                    }
                }
            },
            onVolumeChange: (level) => {
                // Normalize level for UI (assuming -160 to 0 dB)
                // Maps -60dB (quiet) to 0, and 0dB (loud) to 1
                const normalized = Math.min(Math.max((level + 60) / 60, 0), 1);
                setAudioLevel(normalized);
            },
            onError: (err) => {
                console.error('Voice Service Error:', err);
                onError?.(err);
            }
        });

        return () => {
            // Cleanup listeners? VoiceInputService is singleton, maybe we should clear them?
            // For now, we leave them as setListeners overwrites.
        };
    }, [mode, language, onInputComplete, startListening, onError]);

    const speakResponse = useCallback(async (text: string) => {
        if (!isSessionActive.current) return;

        setMode('speaking');
        await SpeechService.speak(text, language, voiceGender, 0.95, 1.0, async () => {
            // When speaking finishes, resume listening (Loop)
            if (isSessionActive.current) {
                await startListening();
            }
        });
    }, [language, voiceGender, startListening]);

    return {
        mode,
        audioLevel,
        transcript,
        startSession,
        endSession,
        speakResponse
    };
};
