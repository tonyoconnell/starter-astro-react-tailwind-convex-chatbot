import { query } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Get the current authenticated user based on token identifier
 */
export const getCurrentUser = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, { tokenIdentifier }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();
    
    return user;
  },
});

/**
 * Get a user by their ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    return user;
  },
});

/**
 * Get user profile information (excluding sensitive data)
 */
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Return only public profile information
    return {
      _id: user._id,
      name: user.name,
      image: user.image,
      _creationTime: user._creationTime,
    };
  },
});

/**
 * Check if a user exists by token identifier
 */
export const userExists = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, { tokenIdentifier }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();
    
    return !!user;
  },
});