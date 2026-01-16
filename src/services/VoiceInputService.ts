import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

class VoiceInputService {
    private static instance: VoiceInputService;
    private recording: Audio.Recording | null = null;
    private isRecordingActive: boolean = false;

    private constructor() { }

    public static getInstance(): VoiceInputService {
        if (!VoiceInputService.instance) {
            VoiceInputService.instance = new VoiceInputService();
        }
        return VoiceInputService.instance;
    }

    public async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting audio permissions:', error);
            return false;
        }
    }

    public async startRecording(): Promise<boolean> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.error('Audio recording permission not granted');
                return false;
            }

            // Configure audio mode for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Create and prepare the recording with metering enabled
            const options: any = {
                ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
                isMeteringEnabled: true,
            };

            const { recording } = await Audio.Recording.createAsync(options);

            this.recording = recording;
            this.isRecordingActive = true;

            // Set update interval for smooth visualization (50ms)
            await this.recording.setProgressUpdateInterval(50);

            console.log('Recording started');
            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            return false;
        }
    }

    public async stopRecording(): Promise<string | null> {
        if (!this.recording) {
            console.error('No active recording to stop');
            return null;
        }

        try {
            await this.recording.stopAndUnloadAsync();
            const uri = this.recording.getURI();
            this.recording = null;
            this.isRecordingActive = false;

            // Reset audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            console.log('Recording stopped, URI:', uri);
            return uri;
        } catch (error) {
            console.error('Error stopping recording:', error);
            return null;
        }
    }

    public async transcribeAudio(audioUri: string, language: string = 'en'): Promise<string> {
        try {
            // Read the audio file as base64
            const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
                encoding: 'base64',
            });

            // Send to backend for transcription using Gemini or Whisper
            // Send to backend for transcription
            const response = await fetch('https://veda-ai-backend-ql2b.onrender.com/api/v1/audio/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio_base64: base64Audio,
                    language: language,
                }),
            });

            if (!response.ok) {
                throw new Error(`Transcription failed: ${response.status}`);
            }

            const data = await response.json();
            return data.text || '';
        } catch (error) {
            console.error('Transcription error:', error);
            // Return empty string on error - user can retry
            return '';
        }
    }

    public isRecording(): boolean {
        return this.isRecordingActive;
    }

    public async cancelRecording(): Promise<void> {
        if (this.recording) {
            try {
                await this.recording.stopAndUnloadAsync();
            } catch (e) {
                // Ignore errors during cancellation
            }
            this.recording = null;
            this.isRecordingActive = false;
        }
    }

    public setStatusUpdateListener(callback: (status: Audio.RecordingStatus) => void): void {
        if (this.recording) {
            this.recording.setOnRecordingStatusUpdate(callback);
        }
    }
}

export default VoiceInputService.getInstance();
