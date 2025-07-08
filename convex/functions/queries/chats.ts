import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Get all chats for a specific user with real-time updates
 */
export const getUserChats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    return chats;
  },
});

/**
 * Get a specific chat by ID
 */
export const getChatById = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const chat = await ctx.db.get(chatId);
    return chat;
  },
});

/**
 * Get chat with verification that user owns it
 */
export const getChatForUser = query({
  args: { 
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    
    if (!chat) {
      return null;
    }
    
    // Verify user owns this chat
    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Chat does not belong to user");
    }
    
    return chat;
  },
});

/**
 * Get recent chats for a user (limited to improve performance)
 */
export const getRecentUserChats = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    return chats;
  },
});

/**
 * Get chat summary with message count and last message time
 */
export const getChatSummary = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, { chatId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      return null;
    }

    // Get message count for this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .collect();

    const messageCount = messages.length;
    const lastMessageTime = messages.length > 0 
      ? Math.max(...messages.map(m => m._creationTime))
      : chat._creationTime;

    return {
      ...chat,
      messageCount,
      lastMessageTime,
    };
  },
});

/**
 * Search chats by title for a user
 */
export const searchUserChats = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, searchTerm, limit = 10 }) => {
    const userChats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Simple text search on title
    const filteredChats = userChats
      .filter(chat => 
        chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, limit);

    return filteredChats;
  },
});