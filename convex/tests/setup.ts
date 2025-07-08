/**
 * Test setup file for Convex backend testing
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Setup global test utilities
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.resetAllMocks();
});

// Export test utilities
export const createMockUser = () => ({
  _id: "user123" as any,
  name: "Test User",
  email: "test@example.com",
  image: "https://example.com/avatar.jpg",
  tokenIdentifier: "test_token_123",
  _creationTime: Date.now(),
});

export const createMockChat = (userId: string) => ({
  _id: "chat123" as any,
  userId: userId as any,
  title: "Test Chat",
  model: "gpt-4",
  systemPrompt: "You are a helpful assistant.",
  _creationTime: Date.now(),
});

export const createMockMessage = (chatId: string, userId?: string) => ({
  _id: "message123" as any,
  chatId: chatId as any,
  userId: userId as any,
  role: "user" as const,
  content: "Hello, world!",
  parts: [{ type: "text" as const, text: "Hello, world!" }],
  metadata: {
    timestamp: Date.now(),
    model: "gpt-4",
    tokenCount: 10,
  },
  _creationTime: Date.now(),
});