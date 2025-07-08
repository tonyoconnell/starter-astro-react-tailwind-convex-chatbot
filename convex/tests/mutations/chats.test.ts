import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockUser, createMockChat } from '../setup';

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

describe('Chat Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChat', () => {
    it('should create a new chat successfully', async () => {
      const { createChat } = await import('../../functions/mutations/chats');
      
      const mockUser = createMockUser();
      mockDb.get.mockResolvedValue(mockUser);
      mockDb.insert.mockResolvedValue('chat123');

      const args = {
        userId: 'user123' as any,
        title: 'Test Chat',
        model: 'gpt-4',
        systemPrompt: 'You are a helpful assistant.',
      };

      const result = await createChat(mockCtx as any, args);

      expect(result).toBe('chat123');
      expect(mockDb.insert).toHaveBeenCalledWith('chats', {
        userId: 'user123',
        title: 'Test Chat',
        model: 'gpt-4',
        systemPrompt: 'You are a helpful assistant.',
      });
    });

    it('should throw error if user not found', async () => {
      const { createChat } = await import('../../functions/mutations/chats');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        userId: 'user123' as any,
        title: 'Test Chat',
      };

      await expect(createChat(mockCtx as any, args)).rejects.toThrow('User not found');
    });

    it('should use default title when not provided', async () => {
      const { createChat } = await import('../../functions/mutations/chats');
      
      const mockUser = createMockUser();
      mockDb.get.mockResolvedValue(mockUser);
      mockDb.insert.mockResolvedValue('chat123');

      const args = {
        userId: 'user123' as any,
      };

      await createChat(mockCtx as any, args);

      expect(mockDb.insert).toHaveBeenCalledWith('chats', expect.objectContaining({
        userId: 'user123',
        title: expect.stringMatching(/^Chat \d/), // Should match "Chat " followed by date
      }));
    });

    it('should sanitize input fields', async () => {
      const { createChat } = await import('../../functions/mutations/chats');
      
      const mockUser = createMockUser();
      mockDb.get.mockResolvedValue(mockUser);
      mockDb.insert.mockResolvedValue('chat123');

      const args = {
        userId: 'user123' as any,
        title: '  Test Chat  ',
        model: '  gpt-4  ',
        systemPrompt: '  You are helpful.  ',
      };

      await createChat(mockCtx as any, args);

      expect(mockDb.insert).toHaveBeenCalledWith('chats', {
        userId: 'user123',
        title: 'Test Chat',
        model: 'gpt-4',
        systemPrompt: 'You are helpful.',
      });
    });
  });

  describe('updateChat', () => {
    it('should update chat successfully', async () => {
      const { updateChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        title: 'Updated Chat',
        model: 'gpt-3.5-turbo',
      };

      const result = await updateChat(mockCtx as any, args);

      expect(result).toBe('chat123');
      expect(mockDb.patch).toHaveBeenCalledWith('chat123', {
        title: 'Updated Chat',
        model: 'gpt-3.5-turbo',
      });
    });

    it('should throw error if chat not found', async () => {
      const { updateChat } = await import('../../functions/mutations/chats');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        title: 'Updated Chat',
      };

      await expect(updateChat(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user does not own chat', async () => {
      const { updateChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('other_user');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        title: 'Updated Chat',
      };

      await expect(updateChat(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });

    it('should throw error for empty title', async () => {
      const { updateChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        title: '   ', // Empty after trim
      };

      await expect(updateChat(mockCtx as any, args)).rejects.toThrow('Title cannot be empty');
    });

    it('should only update provided fields', async () => {
      const { updateChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
        title: 'New Title',
        // model and systemPrompt are undefined
      };

      await updateChat(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('chat123', {
        title: 'New Title',
      });
    });
  });

  describe('deleteChat', () => {
    it('should delete chat and all related data successfully', async () => {
      const { deleteChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      const mockMessages = [
        { _id: 'msg1', chatId: 'chat123' },
        { _id: 'msg2', chatId: 'chat123' },
      ];
      const mockAttachments = [
        { _id: 'att1', chatId: 'chat123', fileId: 'file1' },
      ];
      const mockShares = [
        { _id: 'share1', chatId: 'chat123' },
      ];

      mockDb.get.mockResolvedValue(mockChat);
      mockDb.query().withIndex().eq().collect
        .mockResolvedValueOnce(mockMessages) // messages query
        .mockResolvedValueOnce(mockAttachments) // attachments query
        .mockResolvedValueOnce(mockShares); // shares query
      
      mockDb.delete.mockResolvedValue(undefined);

      // Mock storage for file deletion
      const mockStorage = { delete: vi.fn() };
      const contextWithStorage = { ...mockCtx, storage: mockStorage };

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      const result = await deleteChat(contextWithStorage as any, args);

      expect(result).toBe('chat123');
      
      // Verify messages were deleted
      expect(mockDb.delete).toHaveBeenCalledWith('msg1');
      expect(mockDb.delete).toHaveBeenCalledWith('msg2');
      
      // Verify attachments were deleted
      expect(mockStorage.delete).toHaveBeenCalledWith('file1');
      expect(mockDb.delete).toHaveBeenCalledWith('att1');
      
      // Verify shares were deleted
      expect(mockDb.delete).toHaveBeenCalledWith('share1');
      
      // Verify chat was deleted
      expect(mockDb.delete).toHaveBeenCalledWith('chat123');
    });

    it('should throw error if chat not found', async () => {
      const { deleteChat } = await import('../../functions/mutations/chats');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteChat(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user does not own chat', async () => {
      const { deleteChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('other_user');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteChat(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });
  });

  describe('archiveChat', () => {
    it('should archive chat by updating title', async () => {
      const { archiveChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      mockChat.title = 'My Chat';
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      const result = await archiveChat(mockCtx as any, args);

      expect(result).toBe('chat123');
      expect(mockDb.patch).toHaveBeenCalledWith('chat123', {
        title: '[ARCHIVED] My Chat',
      });
    });

    it('should not double-archive already archived chat', async () => {
      const { archiveChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      mockChat.title = '[ARCHIVED] My Chat';
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await archiveChat(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('chat123', {
        title: '[ARCHIVED] My Chat', // Should remain the same
      });
    });

    it('should throw error if user does not own chat', async () => {
      const { archiveChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('other_user');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(archiveChat(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });
  });

  describe('duplicateChat', () => {
    it('should duplicate chat with modified title', async () => {
      const { duplicateChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('user123');
      mockChat.title = 'Original Chat';
      mockChat.model = 'gpt-4';
      mockChat.systemPrompt = 'You are helpful.';
      
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.insert.mockResolvedValue('new_chat456');

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      const result = await duplicateChat(mockCtx as any, args);

      expect(result).toBe('new_chat456');
      expect(mockDb.insert).toHaveBeenCalledWith('chats', {
        userId: 'user123',
        title: 'Copy of Original Chat',
        model: 'gpt-4',
        systemPrompt: 'You are helpful.',
      });
    });

    it('should throw error if original chat not found', async () => {
      const { duplicateChat } = await import('../../functions/mutations/chats');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(duplicateChat(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user does not own original chat', async () => {
      const { duplicateChat } = await import('../../functions/mutations/chats');
      
      const mockChat = createMockChat('other_user');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(duplicateChat(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });
  });
});