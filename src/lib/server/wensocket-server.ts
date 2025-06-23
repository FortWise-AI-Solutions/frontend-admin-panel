import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

interface Message {
    id: number;
    chatId: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: string;
}

export function setupWebSocket(server: HTTPServer) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:4173"],
            methods: ["GET", "POST"],
            credentials: true
        },
        path: '/socket.io/'
    });

    // Зберігаємо активні з'єднання
    const activeConnections = new Map();

    io.on('connection', (socket) => {
        console.log('👤 User connected:', socket.id);

        // Користувач приєднується до чату
        socket.on('join-chat', (data) => {
            const { userId, chatId } = data;
            const roomId = `chat-${chatId}`;
            socket.join(roomId);
            activeConnections.set(socket.id, { userId, chatId, roomId });

            console.log(`📥 User ${userId} joined chat ${chatId}`);

            // Повідомляємо інших учасників про підключення
            socket.to(roomId).emit('user-joined', {
                userId,
                timestamp: new Date().toISOString()
            });
        });

        // Обробка нового повідомлення
        socket.on('send-message', async (data) => {
            const { chatId, message, sender } = data;
            const roomId = `chat-${chatId}`;

            console.log('📨 Received message:', { chatId, message, sender });

            try {
                // Створюємо повідомлення
                const savedMessage: Message = {
                    id: Date.now(),
                    chatId,
                    text: message,
                    sender,
                    timestamp: new Date().toISOString()
                };

                // Відправляємо повідомлення всім учасникам чату
                io.to(roomId).emit('new-message', savedMessage);
                console.log('📤 Message sent to room:', roomId);

                // Якщо це повідомлення користувача, генеруємо відповідь бота
                if (sender === 'user') {
                    setTimeout(() => {
                        const botMessage: Message = {
                            id: Date.now() + 1,
                            chatId,
                            text: `Alara response to: "${message}"`,
                            sender: 'bot',
                            timestamp: new Date().toISOString()
                        };

                        io.to(roomId).emit('new-message', botMessage);
                        console.log('🤖 Bot response sent');
                    }, 1000);
                }
            } catch (error) {
                console.error('❌ Message error:', error);
                socket.emit('message-error', { error: (error as Error).message });
            }
        });

        // Індикатор набору тексту
        socket.on('typing-start', (data) => {
            const { chatId, userId } = data;
            const roomId = `chat-${chatId}`;
            socket.to(roomId).emit('user-typing', { userId, isTyping: true });
        });

        socket.on('typing-stop', (data) => {
            const { chatId, userId } = data;
            const roomId = `chat-${chatId}`;
            socket.to(roomId).emit('user-typing', { userId, isTyping: false });
        });

        // Відключення
        socket.on('disconnect', () => {
            const connection = activeConnections.get(socket.id);
            if (connection) {
                socket.to(connection.roomId).emit('user-left', {
                    userId: connection.userId
                });
                activeConnections.delete(socket.id);
            }
            console.log('👋 User disconnected:', socket.id);
        });
    });

    return io;
}