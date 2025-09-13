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
            console.log('Sending WhatsApp message to:', chatId);
            
            const response = await fetch('https://aa472d19669c.ngrok-free.app/webhooks/whatsapp/4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    token: botToken,
                    chat_id: chatId,
                    message: message,
                    type: 'text'
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('WhatsApp API error:', response.status, errorText);
                return false;
            }

            const result = await response.json();
            console.log('WhatsApp message sent successfully:', result);
            return true;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return false;
        }
    }

    // Надсилання повідомлення через Instagram
    static async sendInstagramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
        try {
            console.log('Sending Instagram message to:', chatId);
            
            const response = await fetch('https://4645c032e822.ngrok-free.app/webhooks/instagram/5', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    token: botToken,
                    chat_id: chatId,
                    message: message,
                    type: 'text'
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Instagram API error:', response.status, errorText);
                return false;
            }

            const result = await response.json();
            console.log('Instagram message sent successfully:', result);
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
