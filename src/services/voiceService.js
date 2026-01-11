/**
 * VoiceService for React Native - Handles WebSocket voice communication with VEDA AI
 */
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const WS_URL = API_URL.replace('http', 'ws') + '/api/v1/voice/ws';

class VoiceService {
    constructor() {
        this.ws = null;
        this.recording = null;
        this.sound = null;
        this.callbacks = {
            onTranscript: null,
            onResponse: null,
            onAudioStart: null,
            onAudioEnd: null,
            onError: null,
            onConnectionChange: null,
        };
        this.isConnected = false;
        this.audioBuffer = [];
    }

    // Set callback functions
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    // Connect to WebSocket
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        try {
            this.ws = new WebSocket(WS_URL);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.callbacks.onConnectionChange?.(true);
                console.log('Voice WebSocket connected');
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                this.callbacks.onConnectionChange?.(false);
                console.log('Voice WebSocket disconnected');
                // Auto-reconnect after 3 seconds
                setTimeout(() => this.connect(), 3000);
            };

            this.ws.onerror = (error) => {
                console.error('Voice WebSocket error:', error);
                this.callbacks.onError?.('Connection error');
            };

            this.ws.onmessage = async (event) => {
                // Handle binary data (audio chunks)
                if (typeof event.data !== 'string') {
                    const buffer = await this.blobToArrayBuffer(event.data);
                    this.audioBuffer.push(new Uint8Array(buffer));
                } else {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'transcript':
                            this.callbacks.onTranscript?.(data.text, data.language, data.confidence);
                            break;
                        case 'response':
                            this.callbacks.onResponse?.(data.text, data.language);
                            break;
                        case 'audio_start':
                            this.audioBuffer = [];
                            this.callbacks.onAudioStart?.();
                            break;
                        case 'audio_end':
                            this.playAudio();
                            this.callbacks.onAudioEnd?.();
                            break;
                        case 'error':
                            this.callbacks.onError?.(data.message);
                            break;
                    }
                }
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.callbacks.onError?.('Failed to connect');
        }
    }

    // Helper to convert blob to array buffer
    async blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    // Disconnect from WebSocket
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    // Start recording audio
    async startRecording() {
        if (!this.isConnected) {
            this.callbacks.onError?.('Not connected to voice server');
            return false;
        }

        try {
            // Request permissions
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                this.callbacks.onError?.('Microphone permission denied');
                return false;
            }

            // Set audio mode for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
            });

            // Start recording
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            this.recording = recording;
            console.log('Recording started');
            return true;
        } catch (err) {
            console.error('Failed to start recording:', err);
            this.callbacks.onError?.('Recording failed');
            return false;
        }
    }

    // Stop recording and send audio
    async stopRecording() {
        if (!this.recording) return;

        try {
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            console.log('Recording stopped, URI:', uri);

            // Read the audio file as base64
            const audioData = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to ArrayBuffer and send
            const binaryString = atob(audioData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Send audio to server
            this.ws.send(bytes.buffer);
            this.ws.send(JSON.stringify({ type: 'end_stream' }));

            // Cleanup
            this.recording = null;

            // Reset audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });
        } catch (err) {
            console.error('Failed to stop recording:', err);
            this.callbacks.onError?.('Failed to process recording');
        }
    }

    // Play received audio
    async playAudio() {
        if (this.audioBuffer.length === 0) return;

        try {
            // Combine audio chunks
            const totalLength = this.audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);
            const combined = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of this.audioBuffer) {
                combined.set(chunk, offset);
                offset += chunk.length;
            }

            // Save to temp file
            const uri = FileSystem.cacheDirectory + 'response_audio.wav';
            const base64 = btoa(String.fromCharCode(...combined));
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Play audio
            const { sound } = await Audio.Sound.createAsync({ uri });
            this.sound = sound;
            await sound.playAsync();
        } catch (err) {
            console.error('Audio playback error:', err);
        }
    }
}

// Singleton instance
export const voiceService = new VoiceService();
export default voiceService;
