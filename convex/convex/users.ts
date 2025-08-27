/**
 * User-related Convex functions for auth integration
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get current user for authenticated requests
 */
export const getCurrentUser = query({
  args: { tokenIdentifier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.tokenIdentifier) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    return user;
  },
});

/**
 * Get user entity from new schema
 */
export const getUserEntity = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    const entity = await ctx.db
      .query("entities")
      .filter((q) => 
        q.and(
          q.eq(q.field("entityType"), "user"),
          q.eq(q.field("data.authId"), args.authId)
        )
      )
      .first();

    return entity;
  },
});

/**
 * Update user profile
 */
export const updateUserProfile = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(user._id, updates);

    // Also update the entity
    const entity = await ctx.db
      .query("entities")
      .filter((q) => 
        q.and(
          q.eq(q.field("entityType"), "user"),
          q.eq(q.field("data.authId"), args.tokenIdentifier)
        )
      )
      .first();

    if (entity) {
      await ctx.db.patch(entity._id, {
        name: args.name || entity.name,
        image: args.image || entity.image,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Delete user account
 */
export const deleteUserAccount = mutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Delete user sessions
    const sessions = await ctx.db
      .query("user_sessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete user chats
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const chat of chats) {
      // Delete messages in each chat
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat_and_created", (q) => q.eq("chatId", chat._id))
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      // Delete chat attachments
      const attachments = await ctx.db
        .query("chat_attachments")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
        .collect();

      for (const attachment of attachments) {
        await ctx.db.delete(attachment._id);
      }

      await ctx.db.delete(chat._id);
    }

    // Delete user entity
    const entity = await ctx.db
      .query("entities")
      .filter((q) => 
        q.and(
          q.eq(q.field("entityType"), "user"),
          q.eq(q.field("data.authId"), args.tokenIdentifier)
        )
      )
      .first();

    if (entity) {
      await ctx.db.delete(entity._id);
    }

    // Finally delete the user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});