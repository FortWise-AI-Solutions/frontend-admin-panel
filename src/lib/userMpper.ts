import type { EndUser } from './supabase'

export type User = {
  id: string
  nickname: string
  status: "on-going" | "offline" | "human-required" | "no-info"
  platform: "WhatsApp" | "Telegram" | "Instagram"
}

// Функція для визначення статусу на основі даних користувача
function mapStatus(user: EndUser): User['status'] {
  // Якщо у вас є додаткові поля для визначення статусу, використовуйте їх тут
  // Наприклад, якщо є поле last_activity_at:
  
  if (user.role === 'human_required') {
    return 'human-required'
  }
  
  // Якщо є поле для визначення онлайн статусу
  // const lastActivity = user.last_activity_at ? new Date(user.last_activity_at) : null
  // const now = new Date()
  // const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  
  // if (lastActivity && lastActivity > fiveMinutesAgo) {
  //   return 'on-going'
  // } else if (lastActivity) {
  //   return 'offline'
  // }
  
  return "no-info" // За замовчуванням
}

// Функція для маппінгу платформи
function mapPlatform(platform: string | null): User['platform'] {
  if (!platform) return 'WhatsApp' // За замовчуванням
  
  const normalizedPlatform = platform.toLowerCase().trim()
  
  switch (normalizedPlatform) {
    case 'whatsapp':
    case 'whats_app':
    case 'wa':
      return 'WhatsApp'
    case 'telegram':
    case 'tg':
      return 'Telegram'
    case 'instagram':
    case 'ig':
    case 'insta':
      return 'Instagram'
    default:
      return 'WhatsApp' // За замовчуванням
  }
}

export function mapEndUserToUser(endUser: EndUser): User {
  return {
    id: endUser.id.toString(),
    nickname: endUser.name || endUser.username || `User ${endUser.id}`,
    status: mapStatus(endUser),
    platform: mapPlatform(endUser.platform)
  }
}

export function mapEndUsersToUsers(endUsers: EndUser[]): User[] {
  return endUsers.map(mapEndUserToUser)
}

// Функція для фільтрації користувачів
export function filterUsers(
  users: User[], 
  platformFilter: string | null, 
  statusFilter: string | null
): User[] {
  return users.filter(user => {
    const platformMatch = !platformFilter || user.platform === platformFilter
    
    let statusMatch = true
    if (statusFilter) {
      switch (statusFilter) {
        case 'Online':
          statusMatch = user.status === 'on-going'
          break
        case 'Offline':
          statusMatch = user.status === 'offline'
          break
        case 'Human Required':
          statusMatch = user.status === 'human-required'
          break
        default:
          statusMatch = true
      }
    }
    
    return platformMatch && statusMatch
  })
}
