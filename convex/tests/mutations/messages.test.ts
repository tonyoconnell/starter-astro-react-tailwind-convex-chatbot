import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockUser, createMockChat, createMockMessage } from '../setup';

// Mock the mutations module - must be at the top level
vi.mock('../../_generated/server', () => ({
  mutation: (config: any) => config.handler,
}));

// Mock Convex server
const mockDb = {
  insert: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  query: vi.fn(() => ({
    withIndex: vi.fn(() => ({
      eq: vi.fn(() => ({
        collect: vi.fn(),
        first: vi.fn(),
      })),
    })),
  })),
};

const mockCtx = {
  db: mockDb,
};

describe('Message Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a new message successfully', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      const mockUser = createMockUser();
      mockDb.get
        .mockResolvedValueOnce(mockChat) // chat lookup
        .mockResolvedValueOnce(mockUser); // user lookup
      mockDb.insert.mockResolvedValue('message123');

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        role: 'user' as const,
        content: 'Hello, world!',
        parts: [{ type: 'text' as const, text: 'Hello, world!' }],
        metadata: { model: 'gpt-4', tokenCount: 10 },
      };

      const result = await sendMessage(mockCtx as any, args);

      expect(result).toBe('message123');
      expect(mockDb.insert).toHaveBeenCalledWith('messages', {
        chatId: 'chat123',
        userId: 'user123',
        role: 'user',
        content: 'Hello, world!',
        parts: [{ type: 'text', text: 'Hello, world!' }],
        metadata: expect.objectContaining({
          model: 'gpt-4',
          tokenCount: 10,
          timestamp: expect.any(Number),
        }),
      });
    });

    it('should throw error if chat not found', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        chatId: 'chat123' as any,
        role: 'user' as const,
        content: 'Hello, world!',
      };

      await expect(sendMessage(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user not found when userId provided', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      mockDb.get
        .mockResolvedValueOnce(mockChat) // chat lookup
        .mockResolvedValueOnce(null); // user lookup

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        role: 'user' as const,
        content: 'Hello, world!',
      };

      await expect(sendMessage(mockCtx as any, args)).rejects.toThrow('User not found');
    });

    it('should throw error if user tries to send to chat they do not own', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('other_user');
      const mockUser = createMockUser();
      mockDb.get
        .mockResolvedValueOnce(mockChat) // chat lookup
        .mockResolvedValueOnce(mockUser); // user lookup

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        role: 'user' as const,
        content: 'Hello, world!',
      };

      await expect(sendMessage(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });

    it('should throw error for empty content', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        role: 'user' as const,
        content: '   ', // Empty after trim
      };

      await expect(sendMessage(mockCtx as any, args)).rejects.toThrow('Message content cannot be empty');
    });

    it('should create default text parts when none provided', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.insert.mockResolvedValue('message123');

      const args = {
        chatId: 'chat123' as any,
        role: 'assistant' as const,
        content: 'Hello from assistant!',
        // No parts provided
      };

      await sendMessage(mockCtx as any, args);

      expect(mockDb.insert).toHaveBeenCalledWith('messages', expect.objectContaining({
        parts: [{ type: 'text', text: 'Hello from assistant!' }],
      }));
    });

    it('should validate parts for empty text', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        role: 'user' as const,
        content: 'Hello',
        parts: [{ type: 'text' as const, text: '   ' }], // Empty text part
      };

      await expect(sendMessage(mockCtx as any, args)).rejects.toThrow('Text parts cannot be empty');
    });

    it('should add timestamp to metadata automatically', async () => {
      const { sendMessage } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.insert.mockResolvedValue('message123');

      const args = {
        chatId: 'chat123' as any,
        role: 'system' as const,
        content: 'System message',
      };

      await sendMessage(mockCtx as any, args);

      expect(mockDb.insert).toHaveBeenCalledWith('messages', expect.objectContaining({
        metadata: expect.objectContaining({
          timestamp: expect.any(Number),
        }),
      }));
    });
  });

  describe('updateMessage', () => {
    it('should update message successfully', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockDb.get.mockResolvedValue(mockMessage);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        content: 'Updated content',
        parts: [{ type: 'text' as const, text: 'Updated content' }],
      };

      const result = await updateMessage(mockCtx as any, args);

      expect(result).toBe('message123');
      expect(mockDb.patch).toHaveBeenCalledWith('message123', {
        content: 'Updated content',
        parts: [{ type: 'text', text: 'Updated content' }],
      });
    });

    it('should throw error if message not found', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        messageId: 'message123' as any,
        content: 'Updated content',
      };

      await expect(updateMessage(mockCtx as any, args)).rejects.toThrow('Message not found');
    });

    it('should throw error if user tries to update message they do not own', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'other_user');
      mockDb.get.mockResolvedValue(mockMessage);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        content: 'Updated content',
      };

      await expect(updateMessage(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });

    it('should throw error for empty content', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockDb.get.mockResolvedValue(mockMessage);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        content: '   ', // Empty after trim
      };

      await expect(updateMessage(mockCtx as any, args)).rejects.toThrow('Message content cannot be empty');
    });

    it('should validate parts for empty text', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockDb.get.mockResolvedValue(mockMessage);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        parts: [{ type: 'text' as const, text: '   ' }], // Empty text part
      };

      await expect(updateMessage(mockCtx as any, args)).rejects.toThrow('Text parts cannot be empty');
    });

    it('should only update provided fields', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockMessage.metadata = { timestamp: 123456, model: 'gpt-4' };
      mockDb.get.mockResolvedValue(mockMessage);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        content: 'New content',
        // parts and metadata are undefined
      };

      await updateMessage(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('message123', {
        content: 'New content',
      });
    });

    it('should merge metadata when updating', async () => {
      const { updateMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockMessage.metadata = { timestamp: 123456, model: 'gpt-4' };
      mockDb.get.mockResolvedValue(mockMessage);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        metadata: { tokenCount: 15 }, // New field
      };

      await updateMessage(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('message123', {
        metadata: {
          timestamp: 123456,
          model: 'gpt-4',
          tokenCount: 15,
        },
      });
    });
  });

  describe('deleteMessage', () => {
    it('should delete user message successfully', async () => {
      const { deleteMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockDb.get.mockResolvedValue(mockMessage);
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
      };

      const result = await deleteMessage(mockCtx as any, args);

      expect(result).toBe('message123');
      expect(mockDb.delete).toHaveBeenCalledWith('message123');
    });

    it('should delete assistant message if user owns chat', async () => {
      const { deleteMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123');
      mockMessage.role = 'assistant';
      mockMessage.userId = undefined;
      
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockMessage) // message lookup
        .mockResolvedValueOnce(mockChat); // chat lookup
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
      };

      const result = await deleteMessage(mockCtx as any, args);

      expect(result).toBe('message123');
      expect(mockDb.delete).toHaveBeenCalledWith('message123');
    });

    it('should throw error if message not found', async () => {
      const { deleteMessage } = await import('../../functions/mutations/messages');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteMessage(mockCtx as any, args)).rejects.toThrow('Message not found');
    });

    it('should throw error if user tries to delete message they do not own', async () => {
      const { deleteMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'other_user');
      mockDb.get.mockResolvedValue(mockMessage);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteMessage(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });

    it('should throw error if user tries to delete assistant message from chat they do not own', async () => {
      const { deleteMessage } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123');
      mockMessage.role = 'assistant';
      mockMessage.userId = undefined;
      
      const mockChat = createMockChat('other_user');
      
      mockDb.get
        .mockResolvedValueOnce(mockMessage) // message lookup
        .mockResolvedValueOnce(mockChat); // chat lookup

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteMessage(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });
  });

  describe('addMessageReaction', () => {
    it('should add reaction to message successfully', async () => {
      const { addMessageReaction } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      const mockUser = createMockUser();
      
      mockDb.get
        .mockResolvedValueOnce(mockMessage) // message lookup
        .mockResolvedValueOnce(mockUser); // user lookup
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        reaction: 'like' as const,
      };

      const result = await addMessageReaction(mockCtx as any, args);

      expect(result).toBe('message123');
      expect(mockDb.patch).toHaveBeenCalledWith('message123', {
        metadata: expect.objectContaining({
          reactions: {
            user123: ['like'],
          },
        }),
      });
    });

    it('should replace existing reaction from same user', async () => {
      const { addMessageReaction } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      mockMessage.metadata = {
        reactions: {
          user123: ['dislike'],
        },
      };
      const mockUser = createMockUser();
      
      mockDb.get
        .mockResolvedValueOnce(mockMessage) // message lookup
        .mockResolvedValueOnce(mockUser); // user lookup
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        reaction: 'like' as const,
      };

      await addMessageReaction(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('message123', {
        metadata: expect.objectContaining({
          reactions: {
            user123: ['like'], // Replaced dislike with like
          },
        }),
      });
    });

    it('should throw error if message not found', async () => {
      const { addMessageReaction } = await import('../../functions/mutations/messages');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        reaction: 'like' as const,
      };

      await expect(addMessageReaction(mockCtx as any, args)).rejects.toThrow('Message not found');
    });

    it('should throw error if user not found', async () => {
      const { addMessageReaction } = await import('../../functions/mutations/messages');
      
      const mockMessage = createMockMessage('chat123', 'user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockMessage) // message lookup
        .mockResolvedValueOnce(null); // user lookup

      const args = {
        messageId: 'message123' as any,
        userId: 'user123' as any,
        reaction: 'like' as const,
      };

      await expect(addMessageReaction(mockCtx as any, args)).rejects.toThrow('User not found');
    });
  });

  describe('bulkDeleteMessages', () => {
    it('should delete all messages in chat successfully', async () => {
      const { bulkDeleteMessages } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      const mockMessages = [
        { _id: 'msg1', chatId: 'chat123' },
        { _id: 'msg2', chatId: 'chat123' },
        { _id: 'msg3', chatId: 'chat123' },
      ];
      
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.query().withIndex().eq().collect.mockResolvedValue(mockMessages);
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        deleteAll: true,
      };

      const result = await bulkDeleteMessages(mockCtx as any, args);

      expect(result).toEqual({
        deletedCount: 3,
        deletedIds: ['msg1', 'msg2', 'msg3'],
      });
      
      expect(mockDb.delete).toHaveBeenCalledWith('msg1');
      expect(mockDb.delete).toHaveBeenCalledWith('msg2');
      expect(mockDb.delete).toHaveBeenCalledWith('msg3');
    });

    it('should delete specific messages successfully', async () => {
      const { bulkDeleteMessages } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      const mockMessage1 = { _id: 'msg1', chatId: 'chat123' };
      const mockMessage2 = { _id: 'msg2', chatId: 'chat123' };
      
      mockDb.get
        .mockResolvedValueOnce(mockChat) // chat lookup
        .mockResolvedValueOnce(mockMessage1) // message1 lookup
        .mockResolvedValueOnce(mockMessage2); // message2 lookup
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        messageIds: ['msg1', 'msg2'] as any[],
      };

      const result = await bulkDeleteMessages(mockCtx as any, args);

      expect(result).toEqual({
        deletedCount: 2,
        deletedIds: ['msg1', 'msg2'],
      });
    });

    it('should throw error if chat not found', async () => {
      const { bulkDeleteMessages } = await import('../../functions/mutations/messages');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        deleteAll: true,
      };

      await expect(bulkDeleteMessages(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user does not own chat', async () => {
      const { bulkDeleteMessages } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('other_user');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        deleteAll: true,
      };

      await expect(bulkDeleteMessages(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });

    it('should throw error if neither messageIds nor deleteAll specified', async () => {
      const { bulkDeleteMessages } = await import('../../functions/mutations/messages');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        // Neither messageIds nor deleteAll provided
      };

      await expect(bulkDeleteMessages(mockCtx as any, args)).rejects.toThrow('Must specify either messageIds or deleteAll=true');
    });
  });
});