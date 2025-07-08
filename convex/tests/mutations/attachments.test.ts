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
        order: vi.fn(() => ({
          collect: vi.fn(),
          take: vi.fn(),
        })),
        take: vi.fn(),
      })),
    })),
  })),
};

const mockStorage = {
  getUrl: vi.fn(),
  delete: vi.fn(),
};

const mockCtx = {
  db: mockDb,
  storage: mockStorage,
};

describe('Attachment Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadAttachment', () => {
    it('should upload attachment successfully', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser) // user lookup
        .mockResolvedValueOnce(mockChat); // chat lookup
      mockDb.insert.mockResolvedValue('attachment123');

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000, // 1MB
      };

      const result = await uploadAttachment(mockCtx as any, args);

      expect(result).toBe('attachment123');
      expect(mockDb.insert).toHaveBeenCalledWith('chat_attachments', {
        userId: 'user123',
        chatId: 'chat123',
        fileId: 'file123',
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
      });
    });

    it('should throw error if user not found', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'document.pdf',
        fileType: 'application/pdf',
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('User not found');
    });

    it('should throw error if chat not found', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      
      mockDb.get
        .mockResolvedValueOnce(mockUser) // user lookup
        .mockResolvedValueOnce(null); // chat lookup

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'document.pdf',
        fileType: 'application/pdf',
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user does not own chat', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('other_user');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser) // user lookup
        .mockResolvedValueOnce(mockChat); // chat lookup

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'document.pdf',
        fileType: 'application/pdf',
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });

    it('should throw error for empty file name', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockChat);

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: '   ', // Empty after trim
        fileType: 'application/pdf',
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('File name cannot be empty');
    });

    it('should throw error for empty file type', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockChat);

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'document.pdf',
        fileType: '   ', // Empty after trim
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('File type cannot be empty');
    });

    it('should throw error for disallowed file type', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockChat);

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'malware.exe',
        fileType: 'application/x-executable',
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('File type application/x-executable is not allowed');
    });

    it('should throw error for file size exceeding limit', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockChat);

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: 'large-file.pdf',
        fileType: 'application/pdf',
        fileSize: 15 * 1024 * 1024, // 15MB - exceeds 10MB limit
      };

      await expect(uploadAttachment(mockCtx as any, args)).rejects.toThrow('File size exceeds 10MB limit');
    });

    it('should sanitize file name and type', async () => {
      const { uploadAttachment } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockChat);
      mockDb.insert.mockResolvedValue('attachment123');

      const args = {
        userId: 'user123' as any,
        chatId: 'chat123' as any,
        fileId: 'file123' as any,
        fileName: '  My Document.pdf  ',
        fileType: '  APPLICATION/PDF  ',
      };

      await uploadAttachment(mockCtx as any, args);

      expect(mockDb.insert).toHaveBeenCalledWith('chat_attachments', expect.objectContaining({
        fileName: 'My Document.pdf',
        fileType: 'application/pdf',
      }));
    });
  });

  describe('getAttachmentUrl', () => {
    it('should get attachment URL successfully for owner', async () => {
      const { getAttachmentUrl } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'user123',
        chatId: 'chat123',
        fileId: 'file123',
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
      };
      
      mockDb.get.mockResolvedValue(mockAttachment);
      mockStorage.getUrl.mockResolvedValue('https://storage.example.com/file123');

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      const result = await getAttachmentUrl(mockCtx as any, args);

      expect(result).toEqual({
        url: 'https://storage.example.com/file123',
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
      });
    });

    it('should get attachment URL successfully for chat owner', async () => {
      const { getAttachmentUrl } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'other_user',
        chatId: 'chat123',
        fileId: 'file123',
        fileName: 'document.pdf',
        fileType: 'application/pdf',
      };
      
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockAttachment) // attachment lookup
        .mockResolvedValueOnce(mockChat); // chat lookup
      mockStorage.getUrl.mockResolvedValue('https://storage.example.com/file123');

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      const result = await getAttachmentUrl(mockCtx as any, args);

      expect(result.url).toBe('https://storage.example.com/file123');
    });

    it('should throw error if attachment not found', async () => {
      const { getAttachmentUrl } = await import('../../functions/mutations/attachments');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      await expect(getAttachmentUrl(mockCtx as any, args)).rejects.toThrow('Attachment not found');
    });

    it('should throw error if user unauthorized to access attachment', async () => {
      const { getAttachmentUrl } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'other_user',
        chatId: 'chat123',
        fileId: 'file123',
      };
      
      const mockChat = createMockChat('other_user');
      
      mockDb.get
        .mockResolvedValueOnce(mockAttachment) // attachment lookup
        .mockResolvedValueOnce(mockChat); // chat lookup

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      await expect(getAttachmentUrl(mockCtx as any, args)).rejects.toThrow('Unauthorized: Cannot access attachment');
    });

    it('should throw error if file not found in storage', async () => {
      const { getAttachmentUrl } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'user123',
        chatId: 'chat123',
        fileId: 'file123',
        fileName: 'document.pdf',
        fileType: 'application/pdf',
      };
      
      mockDb.get.mockResolvedValue(mockAttachment);
      mockStorage.getUrl.mockResolvedValue(null); // File not found

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      await expect(getAttachmentUrl(mockCtx as any, args)).rejects.toThrow('File not found in storage');
    });
  });

  describe('deleteAttachment', () => {
    it('should delete attachment successfully', async () => {
      const { deleteAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'user123',
        chatId: 'chat123',
        fileId: 'file123',
      };
      
      mockDb.get.mockResolvedValue(mockAttachment);
      mockStorage.delete.mockResolvedValue(undefined);
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      const result = await deleteAttachment(mockCtx as any, args);

      expect(result).toBe('attachment123');
      expect(mockStorage.delete).toHaveBeenCalledWith('file123');
      expect(mockDb.delete).toHaveBeenCalledWith('attachment123');
    });

    it('should delete attachment if user owns chat', async () => {
      const { deleteAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'other_user',
        chatId: 'chat123',
        fileId: 'file123',
      };
      
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockAttachment) // attachment lookup
        .mockResolvedValueOnce(mockChat); // chat lookup
      mockStorage.delete.mockResolvedValue(undefined);
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      const result = await deleteAttachment(mockCtx as any, args);

      expect(result).toBe('attachment123');
      expect(mockStorage.delete).toHaveBeenCalledWith('file123');
      expect(mockDb.delete).toHaveBeenCalledWith('attachment123');
    });

    it('should throw error if attachment not found', async () => {
      const { deleteAttachment } = await import('../../functions/mutations/attachments');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteAttachment(mockCtx as any, args)).rejects.toThrow('Attachment not found');
    });

    it('should throw error if user unauthorized to delete attachment', async () => {
      const { deleteAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'other_user',
        chatId: 'chat123',
        fileId: 'file123',
      };
      
      const mockChat = createMockChat('other_user');
      
      mockDb.get
        .mockResolvedValueOnce(mockAttachment) // attachment lookup
        .mockResolvedValueOnce(mockChat); // chat lookup

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
      };

      await expect(deleteAttachment(mockCtx as any, args)).rejects.toThrow('Unauthorized: Cannot delete attachment');
    });
  });

  describe('getChatAttachments', () => {
    it('should get chat attachments successfully', async () => {
      const { getChatAttachments } = await import('../../functions/mutations/attachments');
      
      const mockChat = createMockChat('user123');
      const mockAttachments = [
        { _id: 'att1', fileName: 'doc1.pdf' },
        { _id: 'att2', fileName: 'image1.jpg' },
      ];
      
      mockDb.get.mockResolvedValue(mockChat);
      mockDb.query().withIndex().eq().order().collect.mockResolvedValue(mockAttachments);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      const result = await getChatAttachments(mockCtx as any, args);

      expect(result).toEqual(mockAttachments);
    });

    it('should throw error if chat not found', async () => {
      const { getChatAttachments } = await import('../../functions/mutations/attachments');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(getChatAttachments(mockCtx as any, args)).rejects.toThrow('Chat not found');
    });

    it('should throw error if user does not own chat', async () => {
      const { getChatAttachments } = await import('../../functions/mutations/attachments');
      
      const mockChat = createMockChat('other_user');
      mockDb.get.mockResolvedValue(mockChat);

      const args = {
        chatId: 'chat123' as any,
        userId: 'user123' as any,
      };

      await expect(getChatAttachments(mockCtx as any, args)).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserAttachments', () => {
    it('should get user attachments successfully', async () => {
      const { getUserAttachments } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      const mockAttachments = [
        { _id: 'att1', fileName: 'doc1.pdf' },
        { _id: 'att2', fileName: 'image1.jpg' },
      ];
      
      mockDb.get.mockResolvedValue(mockUser);
      mockDb.query().withIndex().eq().order().take.mockResolvedValue(mockAttachments);

      const args = {
        userId: 'user123' as any,
        limit: 10,
      };

      const result = await getUserAttachments(mockCtx as any, args);

      expect(result).toEqual(mockAttachments);
    });

    it('should use default limit when not provided', async () => {
      const { getUserAttachments } = await import('../../functions/mutations/attachments');
      
      const mockUser = createMockUser();
      
      mockDb.get.mockResolvedValue(mockUser);
      mockDb.query().withIndex().eq().order().take.mockResolvedValue([]);

      const args = {
        userId: 'user123' as any,
      };

      await getUserAttachments(mockCtx as any, args);

      expect(mockDb.query().withIndex().eq().order().take).toHaveBeenCalledWith(50);
    });

    it('should throw error if user not found', async () => {
      const { getUserAttachments } = await import('../../functions/mutations/attachments');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        userId: 'user123' as any,
      };

      await expect(getUserAttachments(mockCtx as any, args)).rejects.toThrow('User not found');
    });
  });

  describe('updateAttachment', () => {
    it('should update attachment successfully', async () => {
      const { updateAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'user123',
        chatId: 'chat123',
        fileName: 'old-name.pdf',
      };
      
      mockDb.get.mockResolvedValue(mockAttachment);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
        fileName: 'new-name.pdf',
      };

      const result = await updateAttachment(mockCtx as any, args);

      expect(result).toBe('attachment123');
      expect(mockDb.patch).toHaveBeenCalledWith('attachment123', {
        fileName: 'new-name.pdf',
      });
    });

    it('should update attachment if user owns chat', async () => {
      const { updateAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'other_user',
        chatId: 'chat123',
        fileName: 'old-name.pdf',
      };
      
      const mockChat = createMockChat('user123');
      
      mockDb.get
        .mockResolvedValueOnce(mockAttachment) // attachment lookup
        .mockResolvedValueOnce(mockChat); // chat lookup
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
        fileName: 'new-name.pdf',
      };

      const result = await updateAttachment(mockCtx as any, args);

      expect(result).toBe('attachment123');
    });

    it('should throw error if attachment not found', async () => {
      const { updateAttachment } = await import('../../functions/mutations/attachments');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
        fileName: 'new-name.pdf',
      };

      await expect(updateAttachment(mockCtx as any, args)).rejects.toThrow('Attachment not found');
    });

    it('should throw error if user unauthorized to update attachment', async () => {
      const { updateAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'other_user',
        chatId: 'chat123',
        fileName: 'old-name.pdf',
      };
      
      const mockChat = createMockChat('other_user');
      
      mockDb.get
        .mockResolvedValueOnce(mockAttachment) // attachment lookup
        .mockResolvedValueOnce(mockChat); // chat lookup

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
        fileName: 'new-name.pdf',
      };

      await expect(updateAttachment(mockCtx as any, args)).rejects.toThrow('Unauthorized: Cannot update attachment');
    });

    it('should throw error for empty file name', async () => {
      const { updateAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'user123',
        chatId: 'chat123',
        fileName: 'old-name.pdf',
      };
      
      mockDb.get.mockResolvedValue(mockAttachment);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
        fileName: '   ', // Empty after trim
      };

      await expect(updateAttachment(mockCtx as any, args)).rejects.toThrow('File name cannot be empty');
    });

    it('should sanitize file name', async () => {
      const { updateAttachment } = await import('../../functions/mutations/attachments');
      
      const mockAttachment = {
        _id: 'attachment123',
        userId: 'user123',
        chatId: 'chat123',
        fileName: 'old-name.pdf',
      };
      
      mockDb.get.mockResolvedValue(mockAttachment);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        attachmentId: 'attachment123' as any,
        userId: 'user123' as any,
        fileName: '  new-name.pdf  ',
      };

      await updateAttachment(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('attachment123', {
        fileName: 'new-name.pdf',
      });
    });
  });

  describe('getAttachmentStats', () => {
    it('should get attachment statistics successfully', async () => {
      const { getAttachmentStats } = await import('../../functions/mutations/attachments');
      
      const mockAttachments = [
        {
          _id: 'att1',
          fileType: 'application/pdf',
          fileSize: 1000000,
          chatId: 'chat1',
        },
        {
          _id: 'att2',
          fileType: 'image/jpeg',
          fileSize: 500000,
          chatId: 'chat1',
        },
        {
          _id: 'att3',
          fileType: 'application/pdf',
          fileSize: 750000,
          chatId: 'chat2',
        },
      ];
      
      mockDb.query().withIndex().eq().collect.mockResolvedValue(mockAttachments);

      const args = {
        userId: 'user123' as any,
      };

      const result = await getAttachmentStats(mockCtx as any, args);

      expect(result).toEqual({
        totalAttachments: 3,
        totalSize: 2250000, // 1M + 500K + 750K
        byType: {
          'application/pdf': 2,
          'image/jpeg': 1,
        },
        byChatId: {
          'chat1': 2,
          'chat2': 1,
        },
      });
    });

    it('should handle empty attachments list', async () => {
      const { getAttachmentStats } = await import('../../functions/mutations/attachments');
      
      mockDb.query().withIndex().eq().collect.mockResolvedValue([]);

      const args = {
        userId: 'user123' as any,
      };

      const result = await getAttachmentStats(mockCtx as any, args);

      expect(result).toEqual({
        totalAttachments: 0,
        totalSize: 0,
        byType: {},
        byChatId: {},
      });
    });

    it('should handle attachments without file size', async () => {
      const { getAttachmentStats } = await import('../../functions/mutations/attachments');
      
      const mockAttachments = [
        {
          _id: 'att1',
          fileType: 'application/pdf',
          // fileSize is undefined
          chatId: 'chat1',
        },
      ];
      
      mockDb.query().withIndex().eq().collect.mockResolvedValue(mockAttachments);

      const args = {
        userId: 'user123' as any,
      };

      const result = await getAttachmentStats(mockCtx as any, args);

      expect(result.totalSize).toBe(0);
      expect(result.totalAttachments).toBe(1);
    });
  });
});