/**
 * Message-related TypeScript types and interfaces
 */

// Message roles
export type MessageRole = 'user' | 'assistant' | 'system';

// Message part types (for multi-part content)
export interface MessagePart {
  type: 'text';
  text: string;
}

// Message metadata
export interface MessageMetadata {
  timestamp?: number;
  model?: string;
  tokenCount?: number;
  responseTime?: number;
  reactions?: Record<string, string[]>;
  edited?: boolean;
  editedAt?: number;
  version?: number;
}

// Base message interface
export interface Message {
  _id: string;
  _creationTime: number;
  chatId: string;
  userId?: string;
  role: MessageRole;
  content: string;
  parts?: MessagePart[];
  metadata?: MessageMetadata;
}

// Message creation parameters
export interface CreateMessageParams {
  chatId: string;
  userId?: string;
  role: MessageRole;
  content: string;
  parts?: MessagePart[];
  metadata?: MessageMetadata;
}

// Message update parameters
export interface UpdateMessageParams {
  messageId: string;
  userId?: string;
  content?: string;
  parts?: MessagePart[];
  metadata?: MessageMetadata;
}

// Message search parameters
export interface MessageSearchParams {
  searchTerm: string;
  userId?: string;
  chatId?: string;
  role?: MessageRole;
  limit?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Message list query parameters
export interface MessageListParams {
  chatId: string;
  limit?: number;
  cursor?: string;
  order?: 'asc' | 'desc';
}

// Message pagination result
export interface MessagePaginationResult {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}

// Message statistics
export interface MessageStats {
  total: number;
  byRole: {
    user: number;
    assistant: number;
    system: number;
  };
  totalTokens: number;
  averageLength: number;
  averageResponseTime: number;
}

// Message reaction types
export type MessageReaction = 'like' | 'dislike' | 'love' | 'laugh' | 'cry' | 'angry';

// Message reaction data
export interface MessageReactionData {
  userId: string;
  reaction: MessageReaction;
  timestamp: number;
}

// Message thread (for conversation context)
export interface MessageThread {
  messages: Message[];
  totalTokens: number;
  conversationFlow: {
    userMessages: number;
    assistantMessages: number;
    systemMessages: number;
  };
}

// Message validation errors
export interface MessageValidationError {
  field: string;
  message: string;
  code: string;
}

// Message operation result
export interface MessageOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

// Message events for real-time updates
export type MessageEvent = 
  | { type: 'message_created'; message: Message }
  | { type: 'message_updated'; message: Message }
  | { type: 'message_deleted'; messageId: string; chatId: string }
  | { type: 'message_reaction_added'; messageId: string; userId: string; reaction: MessageReaction }
  | { type: 'message_reaction_removed'; messageId: string; userId: string; reaction: MessageReaction }
  | { type: 'message_typing_start'; chatId: string; userId: string }
  | { type: 'message_typing_stop'; chatId: string; userId: string };

// Message formatting options
export interface MessageFormattingOptions {
  maxLength?: number;
  includeMetadata?: boolean;
  includeReactions?: boolean;
  dateFormat?: 'relative' | 'absolute' | 'timestamp';
  highlightSearchTerms?: string[];
}

// Message export format
export interface MessageExport {
  message: Message;
  chatTitle?: string;
  exportedAt: number;
  version: string;
}

// Bulk message operations
export interface BulkMessageOperation {
  operation: 'delete' | 'export' | 'archive';
  messageIds: string[];
  chatId: string;
  userId: string;
}

// Message bulk operation result
export interface BulkMessageResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    messageId: string;
    error: string;
  }>;
}

// Message conversation context
export interface ConversationContext {
  messages: Message[];
  systemPrompt?: string;
  maxTokens?: number;
  includeSystem?: boolean;
  tokenCount: number;
}

// Message search result
export interface MessageSearchResult {
  message: Message;
  chatTitle?: string;
  relevanceScore: number;
  matchedTerms: string[];
  context: {
    before?: Message;
    after?: Message;
  };
}

// Message filter options
export interface MessageFilters {
  role?: MessageRole;
  hasReactions?: boolean;
  minTokens?: number;
  maxTokens?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchContent?: string;
}

// Message sort options
export type MessageSortBy = 'createdAt' | 'tokenCount' | 'relevance';
export type MessageSortOrder = 'asc' | 'desc';

export interface MessageSortOptions {
  by: MessageSortBy;
  order: MessageSortOrder;
}