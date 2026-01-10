/**
 * Error Logger Utility for VEDA AI Mobile
 * Zero-cost error tracking via structured console logging.
 * Visible in Expo logs and crash reports.
 */

interface ErrorContext {
    [key: string]: any;
}

/**
 * Log an error with structured data.
 * Format: [VEDA-ERROR] { timestamp, category, message, context }
 */
export function logError(category: string, error: Error | string, context: ErrorContext = {}): void {
    const errorLog = {
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        category,
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' ? error.stack : undefined,
        context,
    };

    console.error('[VEDA-ERROR]', JSON.stringify(errorLog, null, 2));
}

/**
 * Log an event for analytics/debugging.
 * Format: [VEDA-EVENT] { timestamp, category, action, data }
 */
export function logEvent(category: string, action: string, data: ErrorContext = {}): void {
    const eventLog = {
        level: 'INFO',
        timestamp: new Date().toISOString(),
        category,
        action,
        data,
    };

    console.log('[VEDA-EVENT]', JSON.stringify(eventLog));
}
