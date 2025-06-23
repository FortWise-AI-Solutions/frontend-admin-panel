// @ts-nocheck
// Зберігаємо клієнтів для кожного чату
const chatClients = {};

/**
 * @param {import('express').Application} app 
 */
function setupSSE(app) {
    app.get('/api/chat/:chatId/stream', (req, res) => {
        const { chatId } = req.params;
        
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        const clientId = Date.now();
        
        // Додаємо клієнта до списку
        if (!chatClients[chatId]) {
            chatClients[chatId] = [];
        }
        chatClients[chatId].push({ id: clientId, res });

        // Heartbeat
        const heartbeat = setInterval(() => {
            res.write('data: {"type": "heartbeat"}\n\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(heartbeat);
            if (chatClients[chatId]) {
                chatClients[chatId] = chatClients[chatId].filter(client => client.id !== clientId);
            }
        });
    });
}

/**
 * @param {string} chatId
 * @param {Object} message
 */
function broadcastToChat(chatId, message) {
    if (chatClients[chatId]) {
        chatClients[chatId].forEach(client => {
            try {
                client.res.write(`data: ${JSON.stringify(message)}\n\n`);
            } catch (error) {
                console.error('Error broadcasting to client:', error);
            }
        });
    }
}

module.exports = { setupSSE, broadcastToChat };
