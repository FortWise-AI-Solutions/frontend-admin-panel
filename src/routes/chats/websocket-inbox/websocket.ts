export interface WebSocketMessage {
    type: 'new_message' | 'messages_read' | 'bulk_messages' | 'mark_as_read';
    userId?: string;
    messageTime?: string;
    timestamp?: string;
    messages?: Array<{
        userId: string;
        count: number;
        lastMessageTime?: string;
    }>;
}

export interface UnreadMessageData {
    userId: string;
    count: number;
    lastMessageTime?: Date;
}
