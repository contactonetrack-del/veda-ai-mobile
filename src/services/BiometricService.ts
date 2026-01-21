
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const LOCK_ENABLED_KEY = 'BIOMETRIC_LOCK_ENABLED';

class BiometricService {
    async hasHardwareAsync(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    }

    async getBiometricType(): Promise<LocalAuthentication.AuthenticationType[]> {
        return await LocalAuthentication.supportedAuthenticationTypesAsync();
    }

    async isLockEnabled(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(LOCK_ENABLED_KEY);
            return value === 'true';
        } catch (error) {
            console.error('Error checking lock status:', error);
            return false;
        }
    }

    async setLockEnabled(enabled: boolean): Promise<boolean> {
        try {
            if (enabled) {
                // Verify before enabling
                const result = await this.authenticate('Authenticate to enable App Lock');
                if (result.success) {
                    await AsyncStorage.setItem(LOCK_ENABLED_KEY, 'true');
                    return true;
                }
                return false;
            } else {
                // Verify before disabling
                const result = await this.authenticate('Authenticate to disable App Lock');
                if (result.success) {
                    await AsyncStorage.setItem(LOCK_ENABLED_KEY, 'false');
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.error('Error setting lock status:', error);
            return false;
        }
    }

    async authenticate(promptMessage: string = 'Unlock App'): Promise<LocalAuthentication.LocalAuthenticationResult> {
        try {
            const hasHardware = await this.hasHardwareAsync();
            if (!hasHardware) {
                // Fallback or error if no hardware
                return { success: false, error: 'not_enrolled' };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: promptMessage,
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            return result;
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, error: 'unknown' };
        }
    }
}

export default new BiometricService();
