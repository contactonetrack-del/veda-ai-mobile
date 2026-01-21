import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ... (skipping register function as it was fine mostly, wait, I can't skip intermediate lines in replace_file_content if I want to maintain file structure, but I can target specific blocks using multi_replace or multiple calls.
// Actually, I can just replace the Handler block and the Listener/Schedule blocks separately.
// Let's do that.


export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
            if (!projectId) {
                console.error('Project ID not found in Constants');
            }
            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log(token);
        } catch (e) {
            console.error(e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export function addNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onResponseReceived: (response: Notifications.NotificationResponse) => void
) {
    const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
    const responseListener = Notifications.addNotificationResponseReceivedListener(onResponseReceived);

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}

export async function scheduleNotification(title: string, body: string, seconds: number) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false,
        },
    });
}

export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
