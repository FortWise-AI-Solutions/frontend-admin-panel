import type { User } from "../types/type";

interface UserWithSortData extends User {
    unreadCount?: number;
    alara_status?: boolean;
    human_required?: boolean;
    lastMessageTime?: Date | null;
}

/**
 * Determines user status based on human_required and alara_status flags
 */
export function getUserStatus(user: UserWithSortData): string {
    // Human required status takes highest priority
    if (user.human_required === true) {
        return "human-required";
    }
    
    // Then check alara_status
    if (user.alara_status === true) {
        return "online";
    } else if (user.alara_status === false) {
        return "offline";
    }
    
    // Default if no status information available
    return "no-info";
}

/**
 * Centralized sorting function for users
 * Prioritizes:
 * 1. Human Required users first
 * 2. Users with unread messages next (sorted by count)
 * 3. Users with recent messages
 * 4. Alphabetically by name as fallback
 */
export function sortUsers(users: UserWithSortData[], lastMessageTimes?: Record<string, Date>): UserWithSortData[] {
    return [...users].sort((a, b) => {
        const aUnread = a.unreadCount || 0;
        const bUnread = b.unreadCount || 0;
        const aStatus = getUserStatus(a);
        const bStatus = getUserStatus(b);

        // HIGHEST PRIORITY: Users with human_required status always first
        const aHumanRequired = aStatus === "human-required";
        const bHumanRequired = bStatus === "human-required";

        if (aHumanRequired && !bHumanRequired) return -1;
        if (!aHumanRequired && bHumanRequired) return 1;

        // Inside each group (Human Required / regular):
        // 1. Users with unread messages at the top
        if (aUnread > 0 && bUnread === 0) return -1;
        if (bUnread > 0 && aUnread === 0) return 1;

        // 2. Among users with unread messages - by count (more = higher)
        if (aUnread > 0 && bUnread > 0) {
            return bUnread - aUnread;
        }

        // 3. Then by last message time (newer at the top)
        // Priority given to the updated time from lastMessageTimes, if provided
        const aTime = lastMessageTimes?.[a.id] || a.lastMessageTime;
        const bTime = lastMessageTimes?.[b.id] || b.lastMessageTime;

        if (aTime && bTime) {
            return bTime.getTime() - aTime.getTime();
        }
        if (aTime && !bTime) return -1;
        if (!aTime && bTime) return 1;

        // 4. If everything else is equal, sort by name
        const aName = a.nickname || a.name || a.username || "";
        const bName = b.nickname || b.name || b.username || "";
        return aName.localeCompare(bName);
    });
}

/**
 * Backend-specific sorting function that doesn't rely on unread counts
 * Used in userService.js
 */
export function sortUsersBackend(users: UserWithSortData[]): UserWithSortData[] {
    return [...users].sort((a, b) => {
        const aHumanRequired = a.human_required === true;
        const bHumanRequired = b.human_required === true;
        
        // Human Required users always at the top
        if (aHumanRequired && !bHumanRequired) return -1;
        if (!aHumanRequired && bHumanRequired) return 1;
        
        // Sort users in the group by last message time (newer first)
        if (a.lastMessageTime && b.lastMessageTime) {
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        }
        
        // Users with messages have priority over those without
        if (a.lastMessageTime && !b.lastMessageTime) return -1;
        if (!a.lastMessageTime && b.lastMessageTime) return 1;
        
        // If there are no messages in both, sort by creation date
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
    });
}
