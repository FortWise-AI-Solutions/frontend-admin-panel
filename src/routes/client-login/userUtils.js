/** * @typedef {Object} AuthUser * @property {number} id * @property {string} name * @property {string} [email] * @property {'alara_admin'|'user_admin'|'client_admin'} role * @property {'panel_admins'|'clients'|'client_users'} table * @property {number} [client_id] * @property {string} [created_at] */

/** * @typedef {Object} CurrentUserInfo * @property {number} id * @property {string} name * @property {string} [email] * @property {'alara_admin'|'user_admin'|'client_admin'} role * @property {'panel_admins'|'clients'|'client_users'} table * @property {number|null} client_id * @property {boolean} canViewAllUsers */

/** * Отримує дані поточного користувача з localStorage * @returns {AuthUser|null} Дані користувача або null */
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

/** * Перевіряє чи має користувач доступ до всіх користувачів * @param {AuthUser|null} user - Дані користувача * @returns {boolean} */
export function canViewAllUsers(user) {
    if (!user) return false;
    
    // Адміни панелі (alara_admin) можуть бачити всіх
    return user.role === 'alara_admin';
}

/** * Отримує client_id для фільтрації користувачів * @param {AuthUser|null} user - Дані користувача * @returns {number|null} */
export function getClientIdForFiltering(user) {
    if (!user) return null;
    
    // Якщо це адмін панелі - не фільтруємо (повертаємо null для показу всіх даних)
    if (user.role === 'alara_admin') return null;
    
    // Якщо це клієнт (user_admin з таблиці clients) - використовуємо його id
    if (user.role === 'user_admin' && user.table === 'clients') {
        return user.id;
    }
    
    // Якщо це менеджер клієнта (client_admin з таблиці client_users) - використовуємо client_id
    if (user.role === 'client_admin' && user.table === 'client_users') {
        return user.client_id || null;
    }
    
    return null;
}

/** * Отримує інформацію про поточного користувача для відображення * @returns {CurrentUserInfo|null} */
export function getCurrentUserInfo() {
    const user = getCurrentUser();
    if (!user) return null;
    
    return {
        id: user.id,
        name: user.name,
        email: user.email || undefined,
        role: user.role,
        table: user.table,
        client_id: getClientIdForFiltering(user),
        canViewAllUsers: canViewAllUsers(user)
    };
}

/** * Перевіряє чи користувач аутентифікований * @returns {boolean} */
export function isAuthenticated() {
    return getCurrentUser() !== null;
}

/** * Очищає дані користувача (logout) */
export function clearUserData() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
    }
}
