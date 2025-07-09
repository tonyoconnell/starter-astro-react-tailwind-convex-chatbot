/**
 * Chat-related TypeScript types and interfaces
 */

// Base chat interface
export interface Chat {
  _id: string;
  _creationTime: number;
  userId: string;
  title?: string;
  model?: string;
  systemPrompt?: string;
}

// Extended chat interface with metadata
export interface ChatWithMetadata extends Chat {
  latestMessage?: {
    _id: string;
    content: string;
    _creationTime: number;
    role: 'user' | 'assistant' | 'system';
  } | null;
  messageCount: number;
  lastActivity?: number;
}

// Chat creation parameters
export interface CreateChatParams {
  userId: string;
  title?: string;
  model?: string;
  systemPrompt?: string;
}

// Chat update parameters
export interface UpdateChatParams {
  chatId: string;
  userId: string;
  title?: string;
  model?: string;
  systemPrompt?: string;
}

// Chat search parameters
export interface ChatSearchParams {
  userId: string;
  searchTerm: string;
  limit?: number;
}

// Chat list query parameters
export interface ChatListParams {
  userId: string;
  limit?: number;
  cursor?: string;
}

// Available AI models
export type AIModel = 
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-sonnet'
  | 'claude-3-haiku'
  | 'claude-3-opus';

// Model configuration
export interface ModelConfig {
  id: AIModel;
  name: string;
  description: string;
  maxTokens?: number;
  costPerToken?: number;
  supportsVision?: boolean;
  supportsFunction?: boolean;
}

// Chat settings
export interface ChatSettings {
  model: AIModel;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  enableVision?: boolean;
  enableFunctions?: boolean;
}

// Chat statistics
export interface ChatStats {
  totalMessages: number;
  totalTokens: number;
  averageResponseTime: number;
  messagesByRole: {
    user: number;
    assistant: number;
    system: number;
  };
}

// Chat export format
export interface ChatExport {
  chat: Chat;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  exportedAt: number;
  version: string;
}

// Chat pagination result
export interface ChatPaginationResult {
  chats: ChatWithMetadata[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

// Chat validation errors
export interface ChatValidationError {
  field: string;
  message: string;
  code: string;
}

// Chat operation result
export interface ChatOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

// Chat event types for real-time updates
export type ChatEvent = 
  | { type: 'chat_created'; chat: Chat }
  | { type: 'chat_updated'; chat: Chat }
  | { type: 'chat_deleted'; chatId: string }
  | { type: 'message_added'; chatId: string; messageId: string }
  | { type: 'message_updated'; chatId: string; messageId: string }
  | { type: 'message_deleted'; chatId: string; messageId: string }
  | { type: 'typing_start'; chatId: string; userId: string }
  | { type: 'typing_stop'; chatId: string; userId: string };

// Chat filter options
export interface ChatFilters {
  model?: AIModel;
  hasSystemPrompt?: boolean;
  minMessages?: number;
  maxMessages?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Chat sort options
export type ChatSortBy = 'createdAt' | 'updatedAt' | 'messageCount' | 'title';
export type ChatSortOrder = 'asc' | 'desc';

export interface ChatSortOptions {
  by: ChatSortBy;
  order: ChatSortOrder;
}