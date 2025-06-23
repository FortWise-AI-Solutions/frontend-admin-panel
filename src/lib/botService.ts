import { supabase } from './supabaseClient';

export interface Bot {
    id: number;
    platform: string;
    name: string;
    token: string;
    is_active: boolean;
    client_id: number;
}

export class BotService {
    // Отримання активного бота для клієнта та платформи
    static async getBotByClientAndPlatform(clientId: number, platform: string): Promise<Bot | null> {
        try {
            const { data, error } = await supabase
                .from('bots')
                .select('*')
                .eq('client_id', clientId)
                .eq('platform', platform)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Error fetching bot:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getBotByClientAndPlatform:', error);
            return null;
        }
    }

    // Надсилання повідомлення через Telegram бота
    static async sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Telegram API error:', result);
                return false;
            }

            return result.ok;
        } catch (error) {
            console.error('Error sending Telegram message:', error);
            return false;
        }
    }

    // Надсилання повідомлення через WhatsApp
    static async sendWhatsAppMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
        try {
            // Тут буде ваша логіка для WhatsApp API
            console.log('Sending WhatsApp message with token from DB:', botToken.substring(0, 10) + '...');
            // Поки що повертаємо true для тестування
            return true;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return false;
        }
    }

    // Надсилання повідомлення через Instagram
    static async sendInstagramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
        try {
            // Тут буде ваша логіка для Instagram API
            console.log('Sending Instagram message with token from DB:', botToken.substring(0, 10) + '...');
            // Поки що повертаємо true для тестування
            return true;
        } catch (error) {
            console.error('Error sending Instagram message:', error);
            return false;
        }
    }

    // Універсальний метод для надсилання повідомлень
    static async sendMessage(platform: string, botToken: string, chatId: string, message: string): Promise<boolean> {
        switch (platform.toLowerCase()) {
            case 'telegram':
                return await this.sendTelegramMessage(botToken, chatId, message);
            case 'whatsapp':
                return await this.sendWhatsAppMessage(botToken, chatId, message);
            case 'instagram':
                return await this.sendInstagramMessage(botToken, chatId, message);
            default:
                console.error('Unsupported platform:', platform);
                return false;
        }
    }
}
