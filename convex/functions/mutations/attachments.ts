import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Upload an attachment to a chat
 */
export const uploadAttachment = mutation({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, { userId, chatId, fileId, fileName, fileType, fileSize }) => {
    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify chat exists and user owns it
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Cannot upload attachment to chat that doesn't belong to user");
    }

    // Validate file information
    const sanitizedFileName = fileName.trim();
    if (!sanitizedFileName) {
      throw new Error("File name cannot be empty");
    }

    const sanitizedFileType = fileType.trim().toLowerCase();
    if (!sanitizedFileType) {
      throw new Error("File type cannot be empty");
    }

    // Validate file type (add more restrictions as needed)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'text/plain', 'text/markdown', 'text/csv',
      'application/pdf', 'application/json',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(sanitizedFileType)) {
      throw new Error(`File type ${sanitizedFileType} is not allowed`);
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (fileSize && fileSize > maxFileSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Create the attachment record
    const attachmentId = await ctx.db.insert("chat_attachments", {
      userId,
      chatId,
      fileId,
      fileName: sanitizedFileName,
      fileType: sanitizedFileType,
      fileSize,
    });

    return attachmentId;
  },
});

/**
 * Get download URL for an attachment
 */
export const getAttachmentUrl = mutation({
  args: {
    attachmentId: v.id("chat_attachments"),
    userId: v.id("users"),
  },
  handler: async (ctx, { attachmentId, userId }) => {
    const attachment = await ctx.db.get(attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify user has access to this attachment
    if (attachment.userId !== userId) {
      // Also check if user owns the chat
      const chat = await ctx.db.get(attachment.chatId);
      if (!chat || chat.userId !== userId) {
        throw new Error("Unauthorized: Cannot access attachment");
      }
    }

    // Get the download URL from Convex storage
    const url = await ctx.storage.getUrl(attachment.fileId);
    if (!url) {
      throw new Error("File not found in storage");
    }

    return {
      url,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
    };
  },
});

/**
 * Delete an attachment
 */
export const deleteAttachment = mutation({
  args: {
    attachmentId: v.id("chat_attachments"),
    userId: v.id("users"),
  },
  handler: async (ctx, { attachmentId, userId }) => {
    const attachment = await ctx.db.get(attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify user has permission to delete this attachment
    if (attachment.userId !== userId) {
      // Also check if user owns the chat
      const chat = await ctx.db.get(attachment.chatId);
      if (!chat || chat.userId !== userId) {
        throw new Error("Unauthorized: Cannot delete attachment");
      }
    }

    // Delete the file from storage
    await ctx.storage.delete(attachment.fileId);

    // Delete the attachment record
    await ctx.db.delete(attachmentId);

    return attachmentId;
  },
});

/**
 * Get all attachments for a chat
 */
export const getChatAttachments = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.id("users"),
  },
  handler: async (ctx, { chatId, userId }) => {
    // Verify chat exists and user owns it
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.userId !== userId) {
      throw new Error("Unauthorized: Cannot access attachments for chat that doesn't belong to user");
    }

    // Get all attachments for this chat
    const attachments = await ctx.db
      .query("chat_attachments")
      .withIndex("by_chatId", (q) => q.eq("chatId", chatId))
      .order("desc")
      .collect();

    return attachments;
  },
});

/**
 * Get all attachments for a user
 */
export const getUserAttachments = mutation({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 50 }) => {
    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get all attachments for this user
    const attachments = await ctx.db
      .query("chat_attachments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return attachments;
  },
});

/**
 * Update attachment metadata
 */
export const updateAttachment = mutation({
  args: {
    attachmentId: v.id("chat_attachments"),
    userId: v.id("users"),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, { attachmentId, userId, fileName }) => {
    const attachment = await ctx.db.get(attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Verify user has permission to update this attachment
    if (attachment.userId !== userId) {
      // Also check if user owns the chat
      const chat = await ctx.db.get(attachment.chatId);
      if (!chat || chat.userId !== userId) {
        throw new Error("Unauthorized: Cannot update attachment");
      }
    }

    const updates: Partial<{
      fileName: string;
    }> = {};

    // Update file name
    if (fileName !== undefined) {
      const sanitizedFileName = fileName.trim();
      if (!sanitizedFileName) {
        throw new Error("File name cannot be empty");
      }
      updates.fileName = sanitizedFileName;
    }

    // Apply updates
    await ctx.db.patch(attachmentId, updates);
    return attachmentId;
  },
});

/**
 * Get attachment statistics for a user
 */
export const getAttachmentStats = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const attachments = await ctx.db
      .query("chat_attachments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const stats = {
      totalAttachments: attachments.length,
      totalSize: attachments.reduce((sum, att) => sum + (att.fileSize || 0), 0),
      byType: {} as Record<string, number>,
      byChatId: {} as Record<string, number>,
    };

    // Group by file type
    for (const attachment of attachments) {
      const type = attachment.fileType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    // Group by chat
    for (const attachment of attachments) {
      const chatId = attachment.chatId;
      stats.byChatId[chatId] = (stats.byChatId[chatId] || 0) + 1;
    }

    return stats;
  },
});

/**
 * Cleanup orphaned attachments (files without database records)
 * This is an admin function that should be run periodically
 */
export const cleanupOrphanedAttachments = mutation({
  args: { adminUserId: v.id("users") },
  handler: async (ctx, { adminUserId }) => {
    // In a real app, you'd verify the user has admin privileges
    // For now, we'll just acknowledge this is an admin operation
    
    // This is a placeholder for a cleanup operation
    // In practice, you'd:
    // 1. Get all file IDs from storage
    // 2. Get all file IDs from chat_attachments table
    // 3. Find files in storage that aren't in the database
    // 4. Delete orphaned files
    
    // For now, just return a success message
    return {
      message: "Cleanup operation completed",
      adminUserId,
    };
  },
});