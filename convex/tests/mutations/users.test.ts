import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockUser } from '../setup';

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
        first: vi.fn(),
      })),
    })),
  })),
};

const mockCtx = {
  db: mockDb,
};

describe('User Mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const { createUser } = await import('../../functions/mutations/users');
      
      // Mock database responses
      mockDb.query().withIndex().eq().first.mockResolvedValue(null); // No existing user
      mockDb.insert.mockResolvedValue('user123');

      const args = {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        tokenIdentifier: 'token123',
      };

      const result = await createUser(mockCtx as any, args);

      expect(result).toBe('user123');
      expect(mockDb.insert).toHaveBeenCalledWith('users', {
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
        tokenIdentifier: 'token123',
      });
    });

    it('should throw error if user already exists', async () => {
      const { createUser } = await import('../../functions/mutations/users');
      
      const existingUser = createMockUser();
      mockDb.query().withIndex().eq().first.mockResolvedValue(existingUser);

      const args = {
        name: 'John Doe',
        email: 'john@example.com',
        tokenIdentifier: 'token123',
      };

      await expect(createUser(mockCtx as any, args)).rejects.toThrow('User already exists');
    });

    it('should throw error for empty name', async () => {
      const { createUser } = await import('../../functions/mutations/users');
      
      mockDb.query().withIndex().eq().first.mockResolvedValue(null);

      const args = {
        name: '   ', // Empty name after trim
        tokenIdentifier: 'token123',
      };

      await expect(createUser(mockCtx as any, args)).rejects.toThrow('Name is required');
    });

    it('should sanitize email', async () => {
      const { createUser } = await import('../../functions/mutations/users');
      
      mockDb.query().withIndex().eq().first.mockResolvedValue(null);
      mockDb.insert.mockResolvedValue('user123');

      const args = {
        name: 'John Doe',
        email: '  JOHN@EXAMPLE.COM  ',
        tokenIdentifier: 'token123',
      };

      await createUser(mockCtx as any, args);

      expect(mockDb.insert).toHaveBeenCalledWith('users', {
        name: 'John Doe',
        email: 'john@example.com',
        image: undefined,
        tokenIdentifier: 'token123',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const { updateUser } = await import('../../functions/mutations/users');
      
      const existingUser = createMockUser();
      mockDb.get.mockResolvedValue(existingUser);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        userId: 'user123' as any,
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const result = await updateUser(mockCtx as any, args);

      expect(result).toBe('user123');
      expect(mockDb.patch).toHaveBeenCalledWith('user123', {
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
    });

    it('should throw error if user not found', async () => {
      const { updateUser } = await import('../../functions/mutations/users');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        userId: 'user123' as any,
        name: 'Jane Doe',
      };

      await expect(updateUser(mockCtx as any, args)).rejects.toThrow('User not found');
    });

    it('should validate email format', async () => {
      const { updateUser } = await import('../../functions/mutations/users');
      
      const existingUser = createMockUser();
      mockDb.get.mockResolvedValue(existingUser);

      const args = {
        userId: 'user123' as any,
        email: 'invalid-email',
      };

      await expect(updateUser(mockCtx as any, args)).rejects.toThrow('Invalid email format');
    });

    it('should not update fields that are undefined', async () => {
      const { updateUser } = await import('../../functions/mutations/users');
      
      const existingUser = createMockUser();
      mockDb.get.mockResolvedValue(existingUser);
      mockDb.patch.mockResolvedValue(undefined);

      const args = {
        userId: 'user123' as any,
        name: 'Jane Doe',
        // email and image are undefined
      };

      await updateUser(mockCtx as any, args);

      expect(mockDb.patch).toHaveBeenCalledWith('user123', {
        name: 'Jane Doe',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const { deleteUser } = await import('../../functions/mutations/users');
      
      const existingUser = createMockUser();
      mockDb.get.mockResolvedValue(existingUser);
      mockDb.delete.mockResolvedValue(undefined);

      const args = {
        userId: 'user123' as any,
      };

      const result = await deleteUser(mockCtx as any, args);

      expect(result).toBe('user123');
      expect(mockDb.delete).toHaveBeenCalledWith('user123');
    });

    it('should throw error if user not found', async () => {
      const { deleteUser } = await import('../../functions/mutations/users');
      
      mockDb.get.mockResolvedValue(null);

      const args = {
        userId: 'user123' as any,
      };

      await expect(deleteUser(mockCtx as any, args)).rejects.toThrow('User not found');
    });
  });
});