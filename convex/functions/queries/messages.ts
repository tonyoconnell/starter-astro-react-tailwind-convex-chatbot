import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Get all messages for a specific chat with pagination
 */
export const getChatMessages = query({
  args: { 
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, limit = 50, cursor }) => {
    let messagesQuery = ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .order("asc");

    // Apply cursor-based pagination if provided
    if (cursor) {
      messagesQuery = messagesQuery.filter((q) => 
        q.gt(q.field("_creationTime"), parseFloat(cursor))
      );
    }

    const messages = await messagesQuery.take(limit);
    
    // Get the next cursor for pagination
    const nextCursor = messages.length === limit 
      ? messages[messages.length - 1]._creationTime.toString()
      : null;

    return {
      messages,
      nextCursor,
      hasMore: messages.length === limit,
    };
  },
});

/**
 * Get recent messages for a chat (most recent first)
 */
export const getRecentChatMessages = query({
  args: { 
    chatId: v.id("chats"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { chatId, limit = 20 }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .order("desc")
      .take(limit);
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  },
});

/**
 * Get a specific message by ID
 */
export const getMessageById = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const message = await ctx.db.get(messageId);
    return message;
  },
});

/**
 * Search messages within a chat or for a user
 */
export const searchMessages = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.id("users")),
    chatId: v.optional(v.id("chats")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, userId, chatId, limit = 10 }) => {
    const searchFilters: Record<string, any> = {};
    
    if (userId) {
      searchFilters.userId = userId;
    }
    
    if (chatId) {
      searchFilters.chatId = chatId;
    }

    const results = await ctx.db
      .query("messages")
      .withSearchIndex("by_user_content", (q) => 
        q.search("content", searchTerm).eq("userId", userId || "").eq("chatId", chatId || "")
      )
      .take(limit);

    return results;
  },
});

/**
 * Get message count for a specific chat
 */
export const getChatMessageCount = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .collect();
    
    return messages.length;
  },
});

/**
 * Get messages with a specific role from a chat
 */
export const getMessagesByRole = query({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { chatId, role, limit = 50 }) => {
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .collect();

    const filteredMessages = allMessages
      .filter(message => message.role === role)
      .slice(0, limit);

    return filteredMessages;
  },
});

/**
 * Get conversation context (last N messages) for AI processing
 */
export const getConversationContext = query({
  args: {
    chatId: v.id("chats"),
    maxMessages: v.optional(v.number()),
    includeSystem: v.optional(v.boolean()),
  },
  handler: async (ctx, { chatId, maxMessages = 10, includeSystem = true }) => {
    let messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .order("desc")
      .take(maxMessages);

    // Filter out system messages if requested
    if (!includeSystem) {
      messages = messages.filter(msg => msg.role !== "system");
    }

    // Return in chronological order for conversation flow
    return messages.reverse();
  },
});

/**
 * Get message statistics for a chat
 */
export const getChatMessageStats = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .collect();

    const stats = {
      total: messages.length,
      byRole: {
        user: messages.filter(m => m.role === "user").length,
        assistant: messages.filter(m => m.role === "assistant").length,
        system: messages.filter(m => m.role === "system").length,
      },
      totalTokens: messages.reduce((sum, msg) => 
        sum + (msg.metadata?.tokenCount || 0), 0
      ),
      averageLength: messages.length > 0 
        ? Math.round(messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length)
        : 0,
    };

    return stats;
  },
});