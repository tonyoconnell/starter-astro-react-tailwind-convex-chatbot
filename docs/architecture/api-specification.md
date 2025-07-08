# API Specification & Contract Documentation

## Overview

This document defines the complete API specification for the AI-Accelerated Starter Template, including all Convex functions (queries, mutations, actions), request/response schemas, authentication patterns, and error handling protocols.

## API Architecture

### **Convex Function Types**

- **Queries**: Read-only operations that return data
- **Mutations**: Write operations that modify database state
- **Actions**: Functions that can call external APIs or perform complex operations

### **Type Safety & Code Generation**

```typescript
// Auto-generated types from Convex schema
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";

// Usage in frontend
const user = useQuery(api.queries.users.getCurrentUser);
const sendMessage = useMutation(api.mutations.messages.sendMessage);
```

## Authentication & Authorization

### **Authentication Strategy**

#### **Token-Based Authentication**
```typescript
// Authentication context in Convex functions
export const authenticatedQuery = query({
  args: { /* function args */ },
  handler: async (ctx, args) => {
    // Get current user from BetterAuth token
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Function implementation
  },
});
```

#### **User Context Helper**
```typescript
// Helper function: convex/lib/auth.ts
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
}

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
```

### **Authorization Patterns**

#### **Resource Ownership**
```typescript
// Ensure user can only access their own resources
export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});
```

## User Management API

### **Query Functions**

#### **getCurrentUser**
```typescript
export const getCurrentUser = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    return await getCurrentUser(ctx);
  },
});
```

**Response Schema:**
```typescript
type UserResponse = {
  _id: Id<"users">;
  name: string;
  email?: string;
  image?: string;
  tokenIdentifier: string;
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    defaultModel?: string;
    enableNotifications?: boolean;
  };
  isActive?: boolean;
  lastActiveAt?: number;
  _creationTime: number;
} | null;
```

#### **getUserById**
```typescript
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }): Promise<Doc<"users"> | null> => {
    const currentUser = await requireUser(ctx);
    
    // Users can only view their own profile or public info
    if (currentUser._id !== userId) {
      throw new Error("Access denied");
    }
    
    return await ctx.db.get(userId);
  },
});
```

### **Mutation Functions**

#### **createUser**
```typescript
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    
    if (existing) {
      throw new Error("User already exists");
    }
    
    return await ctx.db.insert("users", {
      ...args,
      isActive: true,
      lastActiveAt: Date.now(),
    });
  },
});
```

#### **updateUser**
```typescript
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    preferences: v.optional(v.object({
      theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
      language: v.optional(v.string()),
      defaultModel: v.optional(v.string()),
      enableNotifications: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<void> => {
    const user = await requireUser(ctx);
    
    await ctx.db.patch(user._id, {
      ...args,
      lastActiveAt: Date.now(),
    });
  },
});
```

## Chat Management API

### **Query Functions**

#### **getUserChats**
```typescript
export const getUserChats = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 50, cursor }) => {
    const user = await requireUser(ctx);
    
    return await ctx.db
      .query("chats")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", user._id).eq("isArchived", false)
      )
      .order("desc")
      .paginate({
        cursor,
        numItems: limit,
      });
  },
});
```

**Response Schema:**
```typescript
type ChatListResponse = {
  page: Array<{
    _id: Id<"chats">;
    userId: Id<"users">;
    title?: string;
    model?: string;
    systemPrompt?: string;
    messageCount?: number;
    lastMessageAt?: number;
    _creationTime: number;
  }>;
  isDone: boolean;
  continueCursor: string;
};
```

#### **getChatById**
```typescript
export const getChatById = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }): Promise<Doc<"chats"> | null> => {
    const user = await requireUser(ctx);
    const chat = await ctx.db.get(chatId);
    
    if (!chat || chat.userId !== user._id) {
      return null;
    }
    
    return chat;
  },
});
```

### **Mutation Functions**

#### **createChat**
```typescript
export const createChat = mutation({
  args: {
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    settings: v.optional(v.object({
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
      topP: v.optional(v.number()),
      frequencyPenalty: v.optional(v.number()),
      presencePenalty: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args): Promise<Id<"chats">> => {
    const user = await requireUser(ctx);
    
    return await ctx.db.insert("chats", {
      userId: user._id,
      ...args,
      messageCount: 0,
      isArchived: false,
    });
  },
});
```

#### **updateChat**
```typescript
export const updateChat = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    settings: v.optional(v.object({
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
      topP: v.optional(v.number()),
      frequencyPenalty: v.optional(v.number()),
      presencePenalty: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { chatId, ...updates }): Promise<void> => {
    const user = await requireUser(ctx);
    const chat = await ctx.db.get(chatId);
    
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or access denied");
    }
    
    await ctx.db.patch(chatId, updates);
  },
});
```

## Message Management API

### **Query Functions**

#### **getChatMessages**
```typescript
export const getChatMessages = query({
  args: {
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, limit = 50, cursor }) => {
    const user = await requireUser(ctx);
    
    // Verify user owns the chat
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or access denied");
    }
    
    return await ctx.db
      .query("messages")
      .withIndex("by_chat_created", (q) => q.eq("chatId", chatId))
      .order("asc")
      .paginate({
        cursor,
        numItems: limit,
      });
  },
});
```

#### **searchMessages**
```typescript
export const searchMessages = query({
  args: {
    searchTerm: v.string(),
    chatId: v.optional(v.id("chats")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, chatId, limit = 20 }) => {
    const user = await requireUser(ctx);
    
    let query = ctx.db
      .query("messages")
      .withSearchIndex("by_content", (q) => 
        q.search("content", searchTerm).eq("userId", user._id)
      );
    
    if (chatId) {
      query = query.filter((q) => q.eq(q.field("chatId"), chatId));
    }
    
    return await query.take(limit);
  },
});
```

### **Mutation Functions**

#### **sendMessage**
```typescript
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    parts: v.optional(v.array(MessagePart)),
    metadata: v.optional(MessageMetadata),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args): Promise<Id<"messages">> => {
    const user = await requireUser(ctx);
    
    // Verify user owns the chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or access denied");
    }
    
    // Calculate thread level if this is a reply
    let threadLevel = 0;
    if (args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (parentMessage) {
        threadLevel = (parentMessage.threadLevel || 0) + 1;
      }
    }
    
    const messageId = await ctx.db.insert("messages", {
      ...args,
      userId: user._id,
      status: "sent",
      threadLevel,
    });
    
    // Update chat's message count and last message time
    await ctx.db.patch(args.chatId, {
      messageCount: (chat.messageCount || 0) + 1,
      lastMessageAt: Date.now(),
    });
    
    return messageId;
  },
});
```

## File Management API

### **Mutation Functions**

#### **generateUploadUrl**
```typescript
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx): Promise<string> => {
    const user = await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
```

#### **createAttachment**
```typescript
export const createAttachment = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.optional(v.id("messages")),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    metadata: v.optional(v.object({
      dimensions: v.optional(v.object({
        width: v.number(),
        height: v.number(),
      })),
      duration: v.optional(v.number()),
      pages: v.optional(v.number()),
      encoding: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<Id<"chat_attachments">> => {
    const user = await requireUser(ctx);
    
    // Verify user owns the chat
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or access denied");
    }
    
    return await ctx.db.insert("chat_attachments", {
      userId: user._id,
      fileId: args.storageId,
      ...args,
      status: "ready",
      isPublic: false,
      downloadCount: 0,
    });
  },
});
```

### **Query Functions**

#### **getAttachmentUrl**
```typescript
export const getAttachmentUrl = query({
  args: { attachmentId: v.id("chat_attachments") },
  handler: async (ctx, { attachmentId }): Promise<string | null> => {
    const user = await requireUser(ctx);
    const attachment = await ctx.db.get(attachmentId);
    
    if (!attachment || attachment.userId !== user._id) {
      return null;
    }
    
    return await ctx.storage.getUrl(attachment.fileId);
  },
});
```

## Action Functions (External API Integration)

### **LLM Integration**

#### **generateAIResponse**
```typescript
export const generateAIResponse = action({
  args: {
    chatId: v.id("chats"),
    messageHistory: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
    model: v.optional(v.string()),
    settings: v.optional(v.object({
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { chatId, messageHistory, model = "gpt-3.5-turbo", settings }) => {
    // Verify user owns the chat
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or access denied");
    }
    
    // Call external LLM API
    const response = await fetch("https://api.openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: messageHistory,
        temperature: settings?.temperature || 0.7,
        max_tokens: settings?.maxTokens || 2000,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    // Store AI response in database
    await ctx.runMutation(api.mutations.messages.sendMessage, {
      chatId,
      role: "assistant",
      content: aiMessage,
      metadata: {
        model,
        tokens: {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        },
        temperature: settings?.temperature,
      },
    });
    
    return aiMessage;
  },
});
```

## Error Handling Patterns

### **Standard Error Responses**

#### **Error Types**
```typescript
export class ConvexError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ConvexError";
  }
}

// Common error patterns
export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN", 
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
} as const;
```

#### **Error Handling Wrapper**
```typescript
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      
      // Log unexpected errors
      console.error("Unexpected error:", error);
      throw new ConvexError("Internal server error", "INTERNAL_ERROR");
    }
  };
}
```

### **Validation Patterns**

#### **Input Validation**
```typescript
import { v } from "convex/values";

// Reusable validators
export const validators = {
  email: v.string(), // TODO: Add email regex validation
  chatTitle: v.string(), // TODO: Add length constraints
  fileSize: v.number(), // TODO: Add size limits
};

// Example usage in mutation
export const createChat = mutation({
  args: {
    title: validators.chatTitle,
    model: v.optional(v.string()),
  },
  handler: withErrorHandling(async (ctx, { title, model }) => {
    // Validation logic
    if (title && title.length > 200) {
      throw new ConvexError("Title too long", ErrorCodes.VALIDATION_ERROR);
    }
    
    // Implementation...
  }),
});
```

## Rate Limiting & Security

### **Rate Limiting Strategy**
```typescript
// Rate limiting helper
export async function checkRateLimit(
  ctx: MutationCtx,
  userId: Id<"users">,
  action: string,
  limit: number,
  windowMs: number
) {
  const windowStart = Date.now() - windowMs;
  
  // Count recent actions
  const recentActions = await ctx.db
    .query("user_actions") // Hypothetical rate limiting table
    .withIndex("by_user_action", (q) => 
      q.eq("userId", userId)
       .eq("action", action)
       .gte("timestamp", windowStart)
    )
    .collect();
  
  if (recentActions.length >= limit) {
    throw new ConvexError("Rate limit exceeded", ErrorCodes.RATE_LIMITED);
  }
  
  // Record this action
  await ctx.db.insert("user_actions", {
    userId,
    action,
    timestamp: Date.now(),
  });
}
```

## API Documentation Standards

### **Function Documentation**
```typescript
/**
 * Retrieves paginated chat messages for a specific chat
 * 
 * @param chatId - The chat to retrieve messages from
 * @param limit - Maximum number of messages to return (default: 50, max: 100)
 * @param cursor - Pagination cursor for subsequent pages
 * 
 * @returns Paginated list of messages with continuation cursor
 * 
 * @throws {ConvexError} FORBIDDEN - User doesn't own the chat
 * @throws {ConvexError} NOT_FOUND - Chat doesn't exist
 * 
 * @example
 * ```typescript
 * const messages = await ctx.runQuery(api.queries.messages.getChatMessages, {
 *   chatId: "chat123",
 *   limit: 25
 * });
 * ```
 */
export const getChatMessages = query({
  // Implementation...
});
```

### **Testing Contracts**
```typescript
// API contract tests
import { expect, test } from "vitest";
import { convexTest } from "convex-test";

test("getChatMessages enforces ownership", async () => {
  const t = convexTest(schema);
  
  // Create two users
  const user1 = await t.mutation(api.mutations.users.createUser, {
    name: "User 1",
    tokenIdentifier: "user1",
  });
  
  const user2 = await t.mutation(api.mutations.users.createUser, {
    name: "User 2", 
    tokenIdentifier: "user2",
  });
  
  // User 1 creates a chat
  const chatId = await t.mutation(api.mutations.chats.createChat, {
    title: "Private Chat",
  });
  
  // User 2 tries to access User 1's chat
  const result = await t.query(api.queries.messages.getChatMessages, {
    chatId,
  });
  
  expect(result).toThrow("Chat not found or access denied");
});
```

This API specification provides a comprehensive contract for all backend functionality, ensuring type safety, proper authentication, and clear error handling patterns throughout the application.