/**
 * Utility functions for handling timezone conversions with global caching
 */

// Global cache that persists until page reload
const globalTimestampCache = new Map<string, { timeString: string; dateString: string; localTimestamp: Date }>();

/**
 * Get the user's timezone
 */
export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get the user's timezone offset in minutes
 */
export function getUserTimezoneOffset(): number {
    return -new Date().getTimezoneOffset();
}

/**
 * Convert database time (assuming UTC) to user's local timezone
 */
export function convertDatabaseTimeToLocal(dbTime: string | Date): Date {
    // Parse database time as UTC
    const utcDate = typeof dbTime === 'string' ? new Date(dbTime + 'Z') : new Date(dbTime);

    // Get user's timezone
    const userTimezone = getUserTimezone();

    // Create a new date in user's timezone
    const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone: userTimezone }));

    return localDate;
}

/**
 * Format date to local time string using user's timezone
 */
export function formatLocalTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const userTimezone = getUserTimezone();

    const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTimezone,
        ...options
    };

    return date.toLocaleTimeString(undefined, defaultOptions);
}

/**
 * Format date to local date string using user's timezone
 */
export function formatLocalDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const userTimezone = getUserTimezone();

    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: userTimezone,
        ...options
    };

    return date.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Get cached timestamp or convert and cache it
 * This cache persists until page reload
 */
export function getCachedLocalTime(
    dbTimestamp: Date | string,
    messageId: string,
    isNewMessage: boolean = false
): { timeString: string; dateString: string; localTimestamp: Date } {
    // For new messages, always use current time (don't cache)
    if (isNewMessage) {
        const currentTime = new Date();
        const userTimezone = getUserTimezone();

        return {
            timeString: formatLocalTime(currentTime),
            dateString: formatLocalDate(currentTime),
            localTimestamp: currentTime
        };
    }

    // Check global cache first
    if (globalTimestampCache.has(messageId)) {
        return globalTimestampCache.get(messageId)!;
    }

    // Convert database time to user's local timezone
    const dbTime = typeof dbTimestamp === 'string' ? dbTimestamp : dbTimestamp.toISOString();

    // Parse as UTC and convert to user's timezone
    const utcDate = new Date(dbTime.endsWith('Z') ? dbTime : dbTime + 'Z');
    const userTimezone = getUserTimezone();

    // Create date in user's timezone
    const localTimestamp = new Date(utcDate.toLocaleString('en-US', { timeZone: userTimezone }));

    // Format using user's timezone
    const timeString = utcDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: userTimezone
    });

    const dateString = utcDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: userTimezone
    });

    const result = {
        timeString,
        dateString,
        localTimestamp
    };

    // Cache the result globally
    globalTimestampCache.set(messageId, result);

    console.log(`🕐 Cached timestamp for ${messageId}:`, {
        dbTime: dbTime,
        userTimezone: userTimezone,
        utcDate: utcDate.toISOString(),
        localFormatted: `${dateString} ${timeString}`,
        cacheSize: globalTimestampCache.size
    });

    return result;
}

/**
 * Clear cache for specific user (optional, if needed)
 */
export function clearUserTimestampCache(userId: string): void {
    const keysToDelete: string[] = [];

    for (const key of globalTimestampCache.keys()) {
        if (key.includes(`-${userId}-`) || key.startsWith(`${userId}-`)) {
            keysToDelete.push(key);
        }
    }

    keysToDelete.forEach(key => globalTimestampCache.delete(key));
    console.log(`🗑️ Cleared ${keysToDelete.length} cached timestamps for user ${userId}`);
}

/**
 * Get cache statistics
 */
export function getTimestampCacheStats(): { size: number; keys: string[] } {
    return {
        size: globalTimestampCache.size,
        keys: Array.from(globalTimestampCache.keys())
    };
}

/**
 * Debug function to show timezone conversion details
 */
export function debugTimezone(dbTime: string | Date): void {
    const dbTimeString = typeof dbTime === 'string' ? dbTime : dbTime.toISOString();
    const utcDate = new Date(dbTimeString.endsWith('Z') ? dbTimeString : dbTimeString + 'Z');
    const userTimezone = getUserTimezone();

    console.log('🕐 Timezone Debug:', {
        dbTime: dbTimeString,
        userTimezone: userTimezone,
        utcDate: utcDate.toISOString(),
        localTime: utcDate.toLocaleString('en-US', { timeZone: userTimezone }),
        offsetMinutes: getUserTimezoneOffset(),
        offsetHours: getUserTimezoneOffset() / 60,
        formattedTime: utcDate.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: userTimezone
        }),
        formattedDate: utcDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: userTimezone
        }),
        cacheStats: getTimestampCacheStats()
    });
}
