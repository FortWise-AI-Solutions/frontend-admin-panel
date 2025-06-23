interface SSEMessage {
    type: string;
    data?: any;
}

export function createSSEConnection(
    chatId: string,
    onMessage: (data: SSEMessage) => void
): EventSource {
    const eventSource = new EventSource(`/api/chat/${chatId}/stream`);

    eventSource.onmessage = (event: MessageEvent) => {
        try {
            const data: SSEMessage = JSON.parse(event.data);
            if (data.type !== 'heartbeat') {
                onMessage(data);
            }
        } catch (error) {
            console.error('Error parsing SSE message:', error);
        }
    };

    eventSource.onerror = (error: Event) => {
        console.error('SSE error:', error);
    };

    return eventSource;
}
