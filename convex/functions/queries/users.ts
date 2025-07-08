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

/**
 * Get user by email (for authentication lookups)
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const users = await ctx.db
      .query("users")
      .collect();
    
    // Find user by email (case-insensitive)
    const user = users.find(u => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    
    return user || null;
  },
});

/**
 * Validate user session and return user context
 * This is used by BetterAuth integration
 */
export const validateUserSession = query({
  args: { 
    sessionToken: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, { sessionToken, tokenIdentifier }) => {
    // If token identifier provided, get user directly
    if (tokenIdentifier) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .first();
      
      if (user) {
        return {
          user,
          isValid: true,
        };
      }
    }

    // TODO: Add session token validation when session management is implemented
    if (sessionToken) {
      // This would validate against the user_sessions table
      // For now, return invalid
      return {
        user: null,
        isValid: false,
      };
    }

    return {
      user: null,
      isValid: false,
    };
  },
});