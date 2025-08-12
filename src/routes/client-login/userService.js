import { supabase } from '../../lib/supabaseClient';
import { getCurrentUser, canViewAllUsers, getClientIdForFiltering } from './userUtils';
import { PUBLIC_WEB_SERVER } from '$env/static/public';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {number} client_id
 * @property {string} nickname
 * @property {string} platform
 * @property {string} status
 * @property {string} [external_id]
 * @property {string} [name]
 * @property {string} [username]
 * @property {string} [chat_id]
 * @property {string} [role]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} CurrentUserInfo
 * @property {number} id
 * @property {string} name
 * @property {string} [email]
 * @property {'alara_admin'|'user_admin'|'client_admin'} role
 * @property {'panel_admins'|'clients'|'client_users'} table
 * @property {number|null} client_id
 * @property {boolean} canViewAllUsers
 */

/**
 * Get users with respect to the current user's role
 * @returns {Promise<User[]>} Array of users
 */
export async function getFilteredUsers() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    console.log('Current user:', currentUser);
    
    try {
        // Define client_id for filtering
        let clientId = null;
        
        if (!canViewAllUsers(currentUser)) {
            clientId = getClientIdForFiltering(currentUser);
            
            if (!clientId) {
                console.warn('No client_id found for filtering, returning empty array');
                return [];
            }
        }
        
        console.log(`Loading users via API for client_id: ${clientId}`);
        
        // Use new API endpoint instead of direct Supabase query
        // For general admins (clientId is null), use 'all' as the path parameter
        const apiPath = clientId ? `users/${clientId}` : 'users/all';
        const response = await fetch(`${PUBLIC_WEB_SERVER}/${apiPath}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        const users = result.users || [];
        
        console.log(`Fetched ${users.length} users from API with sorting:`, result.sorting);
        
        // API just return them
        return users;
        
    } catch (error) {
        console.error('Error in getFilteredUsers:', error);
        
        // Fallback to Supabase direct query if API is not available    
        console.log('API failed, falling back to Supabase direct query');
        try {
            return await getFilteredUsersFromSupabase();
        } catch (fallbackError) {
            console.error('Fallback to Supabase also failed:', fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Fallback функция для прямого запроса к Supabase
 * @returns {Promise<User[]>} Масив користувачів
 */
async function getFilteredUsersFromSupabase() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    
    try {
        let query = supabase.from('end_users').select('*');
        
        // Якщо користувач не alara_admin, фільтруємо по client_id
        if (!canViewAllUsers(currentUser)) {
            const clientId = getClientIdForFiltering(currentUser);
            
            if (clientId) {
                query = query.eq('client_id', clientId);
                console.log(`Filtering users by client_id: ${clientId}`);
            } else {
                console.warn('No client_id found for filtering, returning empty array');
                return [];
            }
        } else {
            console.log('Super admin access - showing all users');
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} users from Supabase fallback`);
        
        // For each user, get the time of the last message
        const usersWithLastMessage = await Promise.all(
            (data || []).map(async (user) => {
                try {
                    // Get the last message for the user directly from Supabase
                    const { data: messages, error: msgError } = await supabase
                        .from('messages')
                        .select('time')
                        .eq('end_user_id', user.id)
                        .order('time', { ascending: false })
                        .limit(1);
                    
                    if (msgError) {
                        console.error(`Error getting last message for user ${user.id}:`, msgError);
                        return {
                            ...user,
                            last_message_at: null
                        };
                    }
                    
                    const lastMessage = messages && messages.length > 0 ? messages[0] : null;
                    const lastMessageTime = lastMessage ? lastMessage.time : null;
                    
                    return {
                        ...user,
                        last_message_at: lastMessageTime
                    };
                } catch (error) {
                    console.error(`Error getting last message for user ${user.id}:`, error);
                    return {
                        ...user,
                        last_message_at: null
                    };
                }
            })
        );
        
        // Sort users according to the same logic as the API:
        // 1. Human Required users at the top, sorted by last message
        // 2. Others below, also sorted by last message
        const sortedUsers = usersWithLastMessage.sort((a, b) => {
            // Priority 1: Human Required status (highest priority)
            const aHumanRequired = a.human_required === true;
            const bHumanRequired = b.human_required === true;

            if (aHumanRequired && !bHumanRequired) return -1;
            if (!aHumanRequired && bHumanRequired) return 1;

            // Priority 2: Time of the last message (newest first)
            const aLastMessage = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const bLastMessage = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;

            if (aLastMessage !== bLastMessage) {
                return bLastMessage - aLastMessage; // Descending order (newest first)
            }

            // Priority 3: Fallback to creation time
            const aCreated = new Date(a.created_at).getTime();
            const bCreated = new Date(b.created_at).getTime();
            return bCreated - aCreated;
        });
        
        return sortedUsers;
        
    } catch (error) {
        console.error('Error in getFilteredUsersFromSupabase:', error);
        throw error;
    }
}

/**
 * Отримує інформацію про поточного користувача для відображення в UI
 * @returns {CurrentUserInfo|null}
 */
export function getCurrentUserInfo() {
    const user = getCurrentUser();
    if (!user) return null;
    
    return {
        id: user.id,
        name: user.name,
        email: user.email || undefined,
        role: user.role,
        table: user.table,
        client_id: user.client_id || null,
        canViewAllUsers: canViewAllUsers(user)
    };
}