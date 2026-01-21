import * as SQLite from 'expo-sqlite';
import { Message, Attachment } from '../types/chat';

const DB_NAME = 'veda_ai.db';

export interface StoredConversation {
    id: string;
    title: string;
    updatedAt: number;
    unreadCount: number;
    lastMessage?: string;
}

class StorageService {
    private db: SQLite.SQLiteDatabase | null = null;

    constructor() {
        this.initDB();
    }

    private async initDB() {
        try {
            this.db = await SQLite.openDatabaseAsync(DB_NAME);
            await this.db.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY NOT NULL,
                    title TEXT,
                    updated_at INTEGER,
                    unread_count INTEGER DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY NOT NULL,
                    conversation_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT,
                    timestamp INTEGER NOT NULL,
                    attachments TEXT,
                    metadata TEXT,
                    agent_used TEXT,
                    is_loading INTEGER DEFAULT 0
                );
            `);
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }

    public async saveMessage(message: Message, conversationId: string = 'default'): Promise<void> {
        if (!this.db) await this.initDB();
        try {
            const statement = await this.db!.prepareAsync(
                `INSERT OR REPLACE INTO messages (id, conversation_id, role, content, timestamp, attachments, metadata, agent_used, is_loading)
                 VALUES ($id, $conversationId, $role, $content, $timestamp, $attachments, $metadata, $agentUsed, $isLoading)`
            );

            await statement.executeAsync({
                $id: message.id,
                $conversationId: conversationId,
                $role: message.role,
                $content: message.content,
                $timestamp: message.timestamp.getTime(),
                $attachments: JSON.stringify(message.attachments || []),
                $metadata: JSON.stringify(message.sources || {}), // Using sources as part of metadata
                $agentUsed: message.agentUsed || null,
                $isLoading: message.isLoading ? 1 : 0
            });
            await statement.finalizeAsync();

            // Update conversation timestamp
            await this.db!.runAsync(
                `INSERT OR REPLACE INTO conversations (id, title, updated_at) 
                 VALUES ($id, COALESCE((SELECT title FROM conversations WHERE id = $id), 'New Chat'), $updatedAt)`,
                { $id: conversationId, $updatedAt: Date.now() }
            );

        } catch (error) {
            console.error('Failed to save message:', error);
        }
    }

    public async loadMessages(conversationId: string = 'default', limit: number = 50, offset: number = 0): Promise<Message[]> {
        if (!this.db) await this.initDB();
        try {
            const result = await this.db!.getAllAsync(
                `SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
                [conversationId, limit, offset]
            );

            return (result as any[]).map(row => ({
                id: row.id,
                role: row.role as 'user' | 'assistant' | 'system',
                content: row.content,
                timestamp: new Date(row.timestamp),
                attachments: JSON.parse(row.attachments || '[]'),
                sources: JSON.parse(row.metadata || '{}'),
                agentUsed: row.agent_used,
                isLoading: Boolean(row.is_loading)
            })).reverse(); // Reverse to return in chronological order
        } catch (error) {
            console.error('Failed to load messages:', error);
            return [];
        }
    }

    public async getConversations(): Promise<StoredConversation[]> {
        if (!this.db) await this.initDB();
        try {
            const result = await this.db!.getAllAsync(
                `SELECT c.*, m.content as lastMessage 
                 FROM conversations c 
                 LEFT JOIN messages m ON m.conversation_id = c.id AND m.timestamp = (SELECT MAX(timestamp) FROM messages WHERE conversation_id = c.id)
                 ORDER BY c.updated_at DESC`
            );

            return (result as any[]).map(row => ({
                id: row.id,
                title: row.title,
                updatedAt: row.updated_at,
                unreadCount: row.unread_count,
                lastMessage: row.lastMessage
            }));
        } catch (error) {
            console.error('Failed to get conversations:', error);
            return [];
        }
    }

    public async clearConversation(conversationId: string): Promise<void> {
        if (!this.db) await this.initDB();
        try {
            await this.db!.runAsync('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
            await this.db!.runAsync('DELETE FROM conversations WHERE id = ?', [conversationId]);
        } catch (error) {
            console.error('Failed to clear conversation:', error);
        }
    }
}

export default new StorageService();
