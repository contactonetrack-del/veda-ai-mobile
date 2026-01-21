jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve({
        execAsync: jest.fn(() => Promise.resolve()),
        runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
        getAllAsync: jest.fn(() => Promise.resolve([])),
        getFirstAsync: jest.fn(() => Promise.resolve(null)),
        prepareAsync: jest.fn(() => Promise.resolve({
            executeAsync: jest.fn(() => Promise.resolve()),
            finalizeAsync: jest.fn(() => Promise.resolve()),
        })),
    })),
}));

import StorageService from '../services/StorageService';
import * as SQLite from 'expo-sqlite';

const mockDb = {
    execAsync: jest.fn(() => Promise.resolve()),
    runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1, changes: 1 })),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    getFirstAsync: jest.fn(() => Promise.resolve(null)),
    prepareAsync: jest.fn(() => Promise.resolve({
        executeAsync: jest.fn(() => Promise.resolve()),
        finalizeAsync: jest.fn(() => Promise.resolve()),
    })),
};

(SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);

describe('StorageService', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        // Reset singleton internal state if possible, or just re-init
        await StorageService.initDB();
    });

    it('should initialize database with correct tables', async () => {
        expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('veda_ai.db');
        expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS messages'));
        expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS conversations'));
    });

    it('should save a message correctly', async () => {
        const testMsg = {
            id: '123',
            role: 'user' as const,
            content: 'Hello context',
            timestamp: new Date(),
        };

        await StorageService.saveMessage(testMsg, 'conv-1');

        expect(mockDb.prepareAsync).toHaveBeenCalledWith(
            expect.stringContaining('INSERT OR REPLACE INTO messages')
        );
        expect(mockDb.runAsync).toHaveBeenCalledWith(
            expect.stringContaining('INSERT OR REPLACE INTO conversations'),
            expect.any(Object)
        );
    });

    it('should load messages for a conversation', async () => {
        const mockRows = [
            { id: '1', role: 'user', content: 'Hi', timestamp: new Date().toISOString() }
        ];
        mockDb.getAllAsync.mockResolvedValue(mockRows);

        const messages = await StorageService.loadMessages('conv-1');

        expect(mockDb.getAllAsync).toHaveBeenCalled();
        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe('Hi');
    });
});
