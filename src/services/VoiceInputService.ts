import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { EventEmitter } from 'expo-modules-core';

interface VoiceEvents {
    onSpeechStart: () => void;
    onSpeechEnd: () => void;
    onVolumeChange: (volume: number) => void;
    onError: (error: Error) => void;
}

class VoiceInputService {
    private static instance: VoiceInputService;
    private recording: Audio.Recording | null = null;
    private isListening = false;
    private listeners: Partial<VoiceEvents> = {};
    private meteringInterval: NodeJS.Timeout | null = null;

    // VAD Configuration
    private readonly SILENCE_THRESHOLD = -40; // dB
    private readonly SILENCE_DURATION = 1500; // ms
    private silenceTimer: NodeJS.Timeout | null = null;
    private isSpeaking = false;

    private constructor() { }

    public static getInstance(): VoiceInputService {
        if (!VoiceInputService.instance) {
            VoiceInputService.instance = new VoiceInputService();
        }
        return VoiceInputService.instance;
    }

    setListeners(events: Partial<VoiceEvents>) {
        this.listeners = events;
    }

    // Compatibility method for existing code
    setStatusUpdateListener(callback: (status: any) => void) {
        // This is a simplified wrapper to maintain compatibility with useChatFlow
        // In the future, useChatFlow should use setListeners directly
    }

    async startRecording(): Promise<boolean> {
        try {
            if (this.recording) {
                await this.stopRecording();
            }

            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                console.error('Microphone permission denied');
                return false;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            this.recording = recording;
            this.isListening = true;
            this.isSpeaking = false;

            // Start metering
            this.startMetering();

            console.log('VoiceInputService: Recording started');
            return true;

        } catch (error) {
            console.error('Error starting recording:', error);
            this.listeners.onError?.(error as Error);
            return false;
        }
    }

    async stopRecording(): Promise<string | null> {
        try {
            this.stopMetering();
            this.isListening = false;
            this.isSpeaking = false;

            if (!this.recording) return null;

            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null;

            // Reset audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            console.log('VoiceInputService: Recording stopped', uri);
            return uri;

        } catch (error) {
            console.error('Error stopping recording:', error);
            this.listeners.onError?.(error as Error);
            return null;
        }
    }

    private startMetering() {
        if (this.meteringInterval) clearInterval(this.meteringInterval);

        // Set explicit progress update interval on the recording object
        if (this.recording) {
            this.recording.setProgressUpdateInterval(50);
            this.recording.setOnRecordingStatusUpdate((status) => {
                if (status.isRecording && status.metering !== undefined) {
                    const level = status.metering; // dB value, typically -160 to 0
                    this.listeners.onVolumeChange?.(level);
                    this.processVad(level);
                }
            });
        }
    }

    private stopMetering() {
        if (this.recording) {
            this.recording.setOnRecordingStatusUpdate(null);
        }
        if (this.meteringInterval) {
            clearInterval(this.meteringInterval);
            this.meteringInterval = null;
        }
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    }

    private processVad(level: number) {
        if (level > this.SILENCE_THRESHOLD) {
            // Speech detected
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer);
                this.silenceTimer = null;
            }

            if (!this.isSpeaking) {
                this.isSpeaking = true;
                this.listeners.onSpeechStart?.();
                console.log('VoiceInputService: Speech detected');
            }
        } else {
            // Silence detected (potential end of speech)
            if (this.isSpeaking && !this.silenceTimer) {
                this.silenceTimer = setTimeout(() => {
                    this.isSpeaking = false;
                    this.listeners.onSpeechEnd?.();
                    console.log('VoiceInputService: Silence detected (Speech End)');
                }, this.SILENCE_DURATION);
            }
        }
    }

    public async transcribeAudio(audioUri: string, language: string = 'en'): Promise<string> {
        try {
            // Read the audio file as base64
            const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
                encoding: 'base64',
            });

            // Send to backend for transcription
            const response = await fetch('https://veda-ai-backend-ql2b.onrender.com/api/v1/audio/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audioData: base64Audio,
                    language: language,
                }),
            });

            if (!response.ok) {
                throw new Error(`Transcription failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Transcription error:', error);
            return '';
        }
    }
}

export default VoiceInputService.getInstance();
