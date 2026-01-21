export interface Attachment {
    id: string;
    uri: string;
    type: 'image' | 'video' | 'file';
    name?: string;
}

export interface MessageSource {
    title: string;
    url: string;
    favicon?: string;
    source_type?: string;
}

export interface MessageReaction {
    emoji: string;
    userId: string;
    timestamp: Date;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    sources?: MessageSource[];
    agentUsed?: string;
    intent?: string;
    verified?: boolean;
    confidence?: number;
    attachments?: Attachment[];
    thinking?: string;
    thinkingLevel?: 'basic' | 'detailed' | 'deep';
    isLoading?: boolean;
    reactions?: string[]; // Currently string emojis, but we could upgrade this later
}

export interface ChatSession {
    id: string;
    title: string;
    preview: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    folder_id?: string;
    message_count?: number;
}

export interface MemoryItem {
    id: string;
    content: string;
    timestamp: string;
    user_id: string;
    type?: string;
}
