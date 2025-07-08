import { mutation } from "../../_generated/server";
import { v } from "convex/values";

// Define message part types for multi-part content support
const messagePart = v.object({
  type: v.literal("text"),
  text: v.string(),
});

/**
 * Send a new message to a chat
 */
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    parts: v.optional(v.array(messagePart)),
    metadata: v.optional(v.object({
      timestamp: v.optional(v.number()),
      model: v.optional(v.string()),
      tokenCount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { chatId, userId, role, content, parts, metadata }) => {
    // Verify chat exists
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify user exists if userId is provided
    if (userId) {
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // For user messages, verify they own the chat
      if (role === "user" && chat.userId !== userId) {
        throw new Error("Unauthorized: Cannot send message to chat that doesn't belong to user");
      }
    }

    // Validate and sanitize content
    const sanitizedContent = content.trim();
    if (!sanitizedContent) {
      throw new Error("Message content cannot be empty");
    }

    // If no parts provided, create a simple text part
    const messageParts = parts || [{
      type: "text" as const,
      text: sanitizedContent,
    }];

    // Validate parts
    for (const part of messageParts) {
      if (part.type === "text" && !part.text.trim()) {
        throw new Error("Text parts cannot be empty");
      }
    }

    // Add timestamp to metadata if not provided
    const enrichedMetadata = {
      timestamp: Date.now(),
      ...metadata,
    };

    // Create the message
    const messageId = await ctx.db.insert("messages", {
      chatId,
      userId,
      role,
      content: sanitizedContent,
      parts: messageParts,
      metadata: enrichedMetadata,
    });

    return messageId;
  },
});

/**
 * Update an existing message
 */
export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.optional(v.id("users")),
    content: v.optional(v.string()),
    parts: v.optional(v.array(messagePart)),
    metadata: v.optional(v.object({
      timestamp: v.optional(v.number()),
      model: v.optional(v.string()),
      tokenCount: v.optional(v.number()),
    })),
  },
  handler: async (ctx, { messageId, userId, content, parts, metadata }) => {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify user authorization for user messages
    if (userId && message.role === "user" && message.userId !== userId) {
      throw new Error("Unauthorized: Cannot update message that doesn't belong to user");
    }

    const updates: Partial<{
      content: string;
      parts: Array<{ type: "text"; text: string }>;
      metadata: {
        timestamp?: number;
        model?: string;
        tokenCount?: number;
      };
    }> = {};

    // Update content
    if (content !== undefined) {
      const sanitizedContent = content.trim();
      if (!sanitizedContent) {
        throw new Error("Message content cannot be empty");
      }
      updates.content = sanitizedContent;
    }

    // Update parts
    if (parts !== undefined) {
      // Validate parts
      for (const part of parts) {
        if (part.type === "text" && !part.text.trim()) {
          throw new Error("Text parts cannot be empty");
        }
      }
      updates.parts = parts;
    }

    // Update metadata
    if (metadata !== undefined) {
      updates.metadata = {
        ...message.metadata,
        ...metadata,
      };
    }

    // Apply updates
    await ctx.db.patch(messageId, updates);
    return messageId;
  },
});

/**
 * Delete a message
 */
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { messageId, userId }) => {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify user authorization
    if (userId) {
      if (message.role === "user" && message.userId !== userId) {
        throw new Error("Unauthorized: Cannot delete message that doesn't belong to user");
      }

      // For assistant/system messages, verify user owns the chat
      const chat = await ctx.db.get(message.chatId);
      if (chat && chat.userId !== userId) {
        throw new Error("Unauthorized: Cannot delete message from chat that doesn't belong to user");
      }
    }

    // Delete the message
    await ctx.db.delete(messageId);
    return messageId;
  },
});

/**
 * Add a reaction to a message (like/dislike feedback)
 */
export const addMessageReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  },
  handler: async (ctx, { messageId, userId, reaction }) => {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // For now, we'll store reactions in metadata
    // In a production app, you might have a separate reactions table
    const currentMetadata = message.metadata || {};
    const reactions = currentMetadata.reactions || {};
    const userReactions = reactions[userId] || [];

    // Remove any existing reaction from this user
    const filteredReactions = userReactions.filter((r: string) => r !== reaction);
    
    // Add the new reaction
    filteredReactions.push(reaction);

    const updatedReactions = {
      ...reactions,
      [userId]: filteredReactions,
    };

    const updatedMetadata = {
      ...currentMetadata,
      reactions: updatedReactions,
    };

    await ctx.db.patch(messageId, {
      metadata: updatedMetadata,
    });

    return messageId;
  },
});

/**
 * Remove a reaction from a message
 */
export const removeMessageReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  },
  handler: async (ctx, { messageId, userId, reaction }) => {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const currentMetadata = message.metadata || {};
    const reactions = currentMetadata.reactions || {};
    const userReactions = reactions[userId] || [];

    // Remove the reaction
    const filteredReactions = userReactions.filter((r: string) => r !== reaction);

    const updatedReactions = {
      ...reactions,
      [userId]: filteredReactions,
    };

    const updatedMetadata = {
      ...currentMetadata,
      reactions: updatedReactions,
    };

    await ctx.db.patch(messageId, {
      metadata: updatedMetadata,
    });

    return messageId;
  },
});

/**
 * Bulk delete messages from a chat (for cleanup operations)
 */
export const bulkDeleteMessages = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
    messageIds: v.optional(v.array(v.id("messages"))),
    deleteAll: v.optional(v.boolean()),
  },
  handler: async (ctx, { chatId, userId, messageIds, deleteAll = false }) => {
    // Verify chat exists and user owns it
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete messages from chat that doesn't belong to user");
    }

    let messagesToDelete: any[];

    if (deleteAll) {
      // Delete all messages in the chat
      messagesToDelete = await ctx.db
        .query("messages")
        .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
        .collect();
    } else if (messageIds && messageIds.length > 0) {
      // Delete specific messages
      messagesToDelete = [];
      for (const messageId of messageIds) {
        const message = await ctx.db.get(messageId);
        if (message && message.chatId === chatId) {
          messagesToDelete.push(message);
        }
      }
    } else {
      throw new Error("Must specify either messageIds or deleteAll=true");
    }

    // Delete the messages
    const deletedIds = [];
    for (const message of messagesToDelete) {
      await ctx.db.delete(message._id);
      deletedIds.push(message._id);
    }

    return {
      deletedCount: deletedIds.length,
      deletedIds,
    };
  },
});