/**
 * Notification Service
 * Handles push notification permissions and scheduling
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Configure how notifications should handle when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    } as any),
});

class NotificationService {

    /**
     * Register for push notifications
     */
    async registerForPushNotificationsAsync(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return null;
        }

        // Check if running in Expo Go
        const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
        if (isExpoGo) {
            console.log('Push Notifications are not supported in Expo Go (SDK 53+). using local notifications only.');
            return null; // Return null gracefully to avoid crash
        }

        let token = null;

        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return null;
        }

        try {
            // Get the token (for Expo Push)
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);

            // On Android, we need to specify a channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        } catch (error) {
            console.log('Error getting push token:', error);
        }

        return token;
    }

    /**
     * Schedule a local notification
     */
    async scheduleNotification(title: string, body: string, triggerSeconds: number = 0) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: triggerSeconds > 0 ? { seconds: triggerSeconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
        });
    }

    /**
     * Cancel all notifications
     */
    async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}

export default new NotificationService();
