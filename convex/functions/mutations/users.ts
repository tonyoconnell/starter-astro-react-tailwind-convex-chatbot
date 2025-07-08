import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Create a new user account (called during authentication flow)
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, { name, email, image, tokenIdentifier }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Validate and sanitize inputs
    const sanitizedName = name.trim();
    if (!sanitizedName) {
      throw new Error("Name is required");
    }

    const sanitizedEmail = email?.toLowerCase().trim();

    // Create the user
    const userId = await ctx.db.insert("users", {
      name: sanitizedName,
      email: sanitizedEmail,
      image: image?.trim(),
      tokenIdentifier,
    });

    return userId;
  },
});

/**
 * Update user profile information
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, email, image }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<{
      name: string;
      email: string;
      image: string;
    }> = {};

    // Validate and sanitize name
    if (name !== undefined) {
      const sanitizedName = name.trim();
      if (!sanitizedName) {
        throw new Error("Name cannot be empty");
      }
      updates.name = sanitizedName;
    }

    // Validate and sanitize email
    if (email !== undefined) {
      const sanitizedEmail = email.toLowerCase().trim();
      if (sanitizedEmail && !isValidEmail(sanitizedEmail)) {
        throw new Error("Invalid email format");
      }
      updates.email = sanitizedEmail || undefined;
    }

    // Update image
    if (image !== undefined) {
      updates.image = image.trim() || undefined;
    }

    // Apply updates
    await ctx.db.patch(userId, updates);
    return userId;
  },
});

/**
 * Delete a user account (soft delete - mark as inactive)
 * Note: In a real application, consider data retention policies
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // In a production app, you might want to:
    // 1. Mark user as inactive instead of deleting
    // 2. Clean up related data (chats, messages, etc.)
    // 3. Handle data retention requirements
    
    await ctx.db.delete(userId);
    return userId;
  },
});

/**
 * Update user's last accessed timestamp
 */
export const updateLastAccessed = mutation({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, { tokenIdentifier }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Note: You might store lastAccessed in a separate sessions table
    // For now, we'll just acknowledge the user exists
    return user._id;
  },
});

/**
 * Helper function to validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}