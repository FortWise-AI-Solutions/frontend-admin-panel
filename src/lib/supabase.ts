import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://znufwwsxufgyjwzglfli.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpudWZ3d3N4dWZneWp3emdsZmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzcxMzYsImV4cCI6MjA2NDYxMzEzNn0.wuHiLZt_9pFrd3yKTfRB6nsyIXnRXQ6YFwUNlnW9Z-A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типи для бази даних
export interface EndUser {
    id: number
    client_id: number
    bot_id: number | null
    external_id: string | null
    name: string | null
    username: string | null
    platform: string | null
    created_at: string | null
    role: string | null
}

// Функція для отримання користувачів
export async function getEndUsers(clientId?: number) {
    let query = supabase
        .from('end_users')
        .select('*')
        .order('created_at', { ascending: false })

    if (clientId) {
        query = query.eq('client_id', clientId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching users:', error)
        throw error
    }

    return data || []
}
