/**
 * @typedef {Object} AuthUser
 * @property {number} id
 * @property {string} name
 * @property {string} [email]
 * @property {'alara_admin'|'user_admin'|'client_admin'} role
 * @property {'panel_admins'|'clients'|'client_users'} table
 * @property {number} [client_id]
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
 * Отримує дані поточного користувача з localStorage
 * @returns {AuthUser|null} Дані користувача або null
 */
export function getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
        return JSON.parse(userData);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Перевіряє чи має користувач доступ до всіх користувачів
 * @param {AuthUser|null} user - Дані користувача
 * @returns {boolean}
 */
export function canViewAllUsers(user) {
    if (!user) return false;
    
    // Адміни панелі (alara_admin) можуть бачити всіх
    return user.role === 'alara_admin';
}

/**
 * Отримує client_id для фільтрації користувачів
 * @param {AuthUser|null} user - Дані користувача
 * @returns {number|null}
 */
export function getClientIdForFiltering(user) {
    if (!user) return null;
    
    // Якщо це адмін панелі - не фільтруємо
    if (user.role === 'alara_admin') return null;
    
    // Якщо це клієнт - використовуємо його id
    if (user.role === 'user_admin') return user.id;
    
    // Якщо це менеджер клієнта - використовуємо client_id
    if (user.role === 'client_admin') return user.client_id || null;
    
    return null;
}
