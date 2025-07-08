import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Create a new chat session
 */
export const createChat = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, { userId, title, model, systemPrompt }) => {
    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate and sanitize inputs
    const sanitizedTitle = title?.trim() || `Chat ${new Date().toLocaleString()}`;
    const sanitizedModel = model?.trim();
    const sanitizedSystemPrompt = systemPrompt?.trim();

    // Create the chat
    const chatId = await ctx.db.insert("chats", {
      userId,
      title: sanitizedTitle,
      model: sanitizedModel,
      systemPrompt: sanitizedSystemPrompt,
    });

    return chatId;
  },
});

/**
 * Update chat information
 */
export const updateChat = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, userId, title, model, systemPrompt }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify user owns this chat
    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Cannot update chat that doesn't belong to user");
    }

    const updates: Partial<{
      title: string;
      model: string;
      systemPrompt: string;
    }> = {};

    // Update title
    if (title !== undefined) {
      const sanitizedTitle = title.trim();
      if (!sanitizedTitle) {
        throw new Error("Title cannot be empty");
      }
      updates.title = sanitizedTitle;
    }

    // Update model
    if (model !== undefined) {
      updates.model = model.trim() || undefined;
    }

    // Update system prompt
    if (systemPrompt !== undefined) {
      updates.systemPrompt = systemPrompt.trim() || undefined;
    }

    // Apply updates
    await ctx.db.patch(chatId, updates);
    return chatId;
  },
});

/**
 * Delete a chat and all its messages
 */
export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify user owns this chat
    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete chat that doesn't belong to user");
    }

    // Delete all messages in this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat_and_created", (q) => q.eq("chatId", chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete all attachments for this chat
    const attachments = await ctx.db
      .query("chat_attachments")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .collect();

    for (const attachment of attachments) {
      // Delete the file from storage
      await ctx.storage.delete(attachment.fileId);
      // Delete the attachment record
      await ctx.db.delete(attachment._id);
    }

    // Delete any chat shares
    const shares = await ctx.db
      .query("chat_shares")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .collect();

    for (const share of shares) {
      await ctx.db.delete(share._id);
    }

    // Finally, delete the chat itself
    await ctx.db.delete(chatId);
    
    return chatId;
  },
});

/**
 * Archive a chat (mark as archived without deleting)
 * Note: This would require adding an 'archived' field to the schema
 */
export const archiveChat = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Verify user owns this chat
    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Cannot archive chat that doesn't belong to user");
    }

    // For now, we'll use the title to indicate archived status
    // In a production app, you'd add an 'archived' boolean field to the schema
    const archivedTitle = chat.title?.startsWith("[ARCHIVED]") 
      ? chat.title 
      : `[ARCHIVED] ${chat.title || "Chat"}`;

    await ctx.db.patch(chatId, {
      title: archivedTitle,
    });

    return chatId;
  },
});

/**
 * Duplicate a chat (create a copy with the same settings but no messages)
 */
export const duplicateChat = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    const originalChat = await ctx.db.get(chatId);
    if (!originalChat) {
      throw new Error("Chat not found");
    }

    // Verify user owns this chat
    if (originalChat.userId !== userId) {
      throw new Error("Unauthorized: Cannot duplicate chat that doesn't belong to user");
    }

    // Create a copy with modified title
    const duplicatedTitle = `Copy of ${originalChat.title || "Chat"}`;

    const newChatId = await ctx.db.insert("chats", {
      userId: originalChat.userId,
      title: duplicatedTitle,
      model: originalChat.model,
      systemPrompt: originalChat.systemPrompt,
    });

    return newChatId;
  },
});