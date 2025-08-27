/**
 * BetterAuth integration with Convex
 * Handles user authentication and session management
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { UserInfo } from "../packages/lib/src/auth/types";

/**
 * Create or update user from BetterAuth session
 */
export const syncUser = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists in BetterAuth tables
    const existingBetterAuthUser = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    let betterAuthUserId;
    
    if (!existingBetterAuthUser) {
      // Create user in BetterAuth table
      betterAuthUserId = await ctx.db.insert("user", {
        id: args.id,
        name: args.name,
        email: args.email || "",
        emailVerified: false,
        image: args.image,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      betterAuthUserId = existingBetterAuthUser._id;
      // Update existing user
      await ctx.db.patch(existingBetterAuthUser._id, {
        name: args.name,
        email: args.email || existingBetterAuthUser.email,
        image: args.image || existingBetterAuthUser.image,
        updatedAt: Date.now(),
      });
    }

    // No need for legacy users table - BetterAuth user table is sufficient

    // Create entity in new schema
    const existingEntity = await ctx.db
      .query("entities")
      .filter((q) => 
        q.and(
          q.eq(q.field("entityType"), "user"),
          q.eq(q.field("data.authId"), args.id)
        )
      )
      .first();

    if (!existingEntity) {
      await ctx.db.insert("entities", {
        entityType: "user",
        name: args.name,
        image: args.image,
        status: "active",
        visibility: "public",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: {
          authId: args.id,
          provider: args.provider,
          email: args.email,
        },
      });
    }

    return { success: true, userId: betterAuthUserId };
  },
});

/**
 * Create session for authenticated user
 */
export const createUserSession = mutation({
  args: {
    userId: v.string(),
    sessionToken: v.string(),
    expires: v.number(),
  },
  handler: async (ctx, args) => {
    // Get user from legacy table
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if session already exists
    const existingSession = await ctx.db
      .query("user_sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!existingSession) {
      // Create new session
      await ctx.db.insert("user_sessions", {
        userId: user._id,
        sessionToken: args.sessionToken,
        expires: args.expires,
        lastAccessed: Date.now(),
      });
    }

    // Also create session in BetterAuth table
    await ctx.db.insert("session", {
      id: args.sessionToken,
      userId: args.userId,
      token: args.sessionToken,
      expiresAt: args.expires,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get user by session token
 */
export const getUserBySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("user_sessions")
      .withIndex("by_token", (q) => q.eq("sessionToken", args.sessionToken))
      .first();

    if (!session || session.expires < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    return user;
  },
});

/**
 * Get user by token identifier (for compatibility)
 */
export const getUserByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .first();

    return user;
  },
});

/**
 * Clean up expired sessions
 */
export const cleanExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Clean user_sessions
    const expiredUserSessions = await ctx.db
      .query("user_sessions")
      .filter((q) => q.lt(q.field("expires"), now))
      .collect();

    for (const session of expiredUserSessions) {
      await ctx.db.delete(session._id);
    }

    // Clean BetterAuth sessions
    const expiredBetterAuthSessions = await ctx.db
      .query("session")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const session of expiredBetterAuthSessions) {
      await ctx.db.delete(session._id);
    }

    return { 
      cleaned: expiredUserSessions.length + expiredBetterAuthSessions.length 
    };
  },
});