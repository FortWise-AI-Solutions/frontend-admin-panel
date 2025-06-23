const { Server } = require('socket.io');

/**
 * @param {import('http').Server} server 
 */
function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // Ваш frontend URL
            methods: ["GET", "POST"]
        }
    });

    // Зберігаємо активні з'єднання
    const activeConnections = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Користувач приєднується до чату
        socket.on('join-chat', (data) => {
            const { userId, chatId } = data;
            const roomId = `chat-${chatId}`;

            socket.join(roomId);
            activeConnections.set(socket.id, { userId, chatId, roomId });

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

            try {
                // Зберігаємо повідомлення в базу даних
                const savedMessage = await saveMessageToDatabase({
                    chatId,
                    text: message,
                    sender,
                    timestamp: new Date().toISOString()
                });

                // Відправляємо повідомлення всім учасникам чату
                io.to(roomId).emit('new-message', savedMessage);

                // Якщо це повідомлення користувача і Alara увімкнена
                if (sender === 'user' && await isAlaraEnabled(chatId)) {
                    // Генеруємо відповідь від Alara
                    const botResponse = await generateAlaraResponse(message);

                    const botMessage = await saveMessageToDatabase({
                        chatId,
                        text: botResponse,
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    });

                    // Відправляємо відповідь бота з невеликою затримкою
                    setTimeout(() => {
                        io.to(roomId).emit('new-message', botMessage);
                    }, 1000);
                }
            } catch (error) {
                // @ts-ignore
                socket.emit('message-error', { error: error.message });
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
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}

// Допоміжні функції
/**
 * @param {Object} messageData
 * @param {string} messageData.chatId
 * @param {string} messageData.text
 * @param {string} messageData.sender
 * @param {string} messageData.timestamp
 */
async function saveMessageToDatabase(messageData) {
    // Ваша логіка збереження в базу даних
    // Повертає збережене повідомлення з ID
    return {
        id: Date.now(),
        ...messageData
    };
}

/**
 * @param {string} chatId
 */
async function isAlaraEnabled(chatId) {
    // Перевіряємо чи увімкнена Alara для цього чату
    return true; // або логіка з бази даних
}

/**
 * @param {string} userMessage
 */
async function generateAlaraResponse(userMessage) {
    // Ваша логіка генерації відповіді від AI
    return `Alara response to: ${userMessage}`;
}

module.exports = { setupWebSocket };
