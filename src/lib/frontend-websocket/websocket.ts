import { io, type Socket } from 'socket.io-client';
import { writable, type Writable } from 'svelte/store';

export interface WSMessage {
    id: number;
    chatId: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

interface TypingUser {
    userId: string;
    isTyping: boolean;
}

interface MessageError {
    error: string;
}

class WebSocketService {
    private socket: Socket | null = null;
    public isConnected: Writable<boolean> = writable(false);
    public messages: Writable<WSMessage[]> = writable([]);
    public typingUsers: Writable<TypingUser[]> = writable([]);

    connect(): void {
        if (this.socket?.connected) {
            console.log('Socket.IO already connected');
            return;
        }

        console.log('🔌 Connecting to Socket.IO...');
        
        // Підключаємось до того ж сервера, де працює SvelteKit
        this.socket = io(window.location.origin, {
            path: '/socket.io/',
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 5000
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO');
            this.isConnected.set(true);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from Socket.IO:', reason);
            this.isConnected.set(false);
        });

        this.socket.on('new-message', (message: WSMessage) => {
            console.log('📨 New message received:', message);
            this.messages.update(messages => [...messages, message]);
        });

        this.socket.on('user-typing', (data: TypingUser) => {
            this.typingUsers.update(users => {
                const filtered = users.filter(u => u.userId !== data.userId);
                if (data.isTyping) {
                    return [...filtered, data];
                }
                return filtered;
            });
        });

        this.socket.on('message-error', (error: MessageError) => {
            console.error('❌ Message error:', error);
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Connection error:', error);
            this.isConnected.set(false);
        });

        this.socket.on('user-joined', (data) => {
            console.log('👤 User joined:', data);
        });

        this.socket.on('user-left', (data) => {
            console.log('👋 User left:', data);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected.set(false);
        }
    }

    joinChat(userId: string, chatId: string): void {
        if (this.socket?.connected) {
            console.log(`📥 Joining chat: ${chatId} as user: ${userId}`);
            this.socket.emit('join-chat', { userId, chatId });
        } else {
            console.warn('⚠️ Cannot join chat: Socket.IO not connected');
        }
    }

    sendMessage(chatId: string, message: string, sender: 'user' | 'bot'): void {
        if (this.socket?.connected) {
            console.log('📤 Sending message:', { chatId, message, sender });
            this.socket.emit('send-message', { chatId, message, sender });
        } else {
            console.warn('⚠️ Cannot send message: Socket.IO not connected');
            throw new Error('Socket.IO not connected');
        }
    }

    startTyping(chatId: string, userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('typing-start', { chatId, userId });
        }
    }

    stopTyping(chatId: string, userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('typing-stop', { chatId, userId });
        }
    }

    clearMessages(): void {
        this.messages.set([]);
        this.typingUsers.set([]);
    }
}

export const wsService = new WebSocketService();
export type { TypingUser };
