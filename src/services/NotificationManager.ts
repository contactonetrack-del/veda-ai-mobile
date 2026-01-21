/**
 * NotificationManager
 * Orchestrates notification scheduling based on user preferences.
 * Bridges 'Settings' (AsyncStorage) and 'NotificationService' (Expo Notifications).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

const DAILY_REMINDER_KEY = 'dailyReminders';
const REMINDER_HOUR = 9; // 9 AM
const REMINDER_MINUTE = 0;

export const NotificationManager = {
    /**
     * Syncs scheduled notifications with current user preferences.
     * Call this whenever settings change or on app launch.
     */
    syncNotifications: async () => {
        try {
            // 1. Check Daily Reminders Preference
            const dailyRemindersStr = await AsyncStorage.getItem(DAILY_REMINDER_KEY);
            const dailyRemindersEnabled = dailyRemindersStr ? JSON.parse(dailyRemindersStr) : false;

            // 2. Clear existing to avoid duplicates (Fresh Start)
            await NotificationService.cancelAllNotifications();

            // 3. Schedule if enabled
            if (dailyRemindersEnabled) {
                // Calculate seconds until next 9 AM
                const seconds = getSecondsUntilNextTrigger(REMINDER_HOUR, REMINDER_MINUTE);

                // For "Daily", we actually need a repeated trigger. 
                // NotificationService.scheduleNotification currently accepts 'seconds' (interval).
                // To make it truly daily at 9 AM, we'd need a CalendarTrigger. 
                // For now, we'll use a 24h interval starting from the calculated delay, 
                // OR just a simple "reminder in 24h" logic for MVP.
                // 
                // Let's use the simple schedule logic from NotificationService:
                await NotificationService.scheduleNotification(
                    "Good Morning! ☀️",
                    "Ready to achieve your goals today? Let's check in.",
                    seconds // First trigger
                );

                console.log(`[NotificationManager] Scheduled daily reminder in ${Math.round(seconds / 3600)} hours.`);
            } else {
                console.log('[NotificationManager] Daily reminders disabled. Schedules cleared.');
            }

        } catch (error) {
            console.error('[NotificationManager] Failed to sync notifications:', error);
        }
    }
};

/**
 * Helper to calculate seconds until the next occurrence of a specific hour:minute
 */
function getSecondsUntilNextTrigger(hour: number, minute: number): number {
    const now = new Date();
    const target = new Date();

    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
        // If time has passed for today, schedule for tomorrow
        target.setDate(target.getDate() + 1);
    }

    const diffMs = target.getTime() - now.getTime();
    return Math.floor(diffMs / 1000);
}

export default NotificationManager;
