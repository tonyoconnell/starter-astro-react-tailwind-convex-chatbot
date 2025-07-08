import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define message part types for multi-part content support
const messagePart = v.object({
  type: v.literal("text"),
  text: v.string(),
});

export default defineSchema({
  // Users table - managed by BetterAuth integration
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // Unique ID from BetterAuth
  })
    .index("by_token", ["tokenIdentifier"]), // Primary index for auth lookups

  // Chats table - conversation sessions
  chats: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  })
    .index("by_user", ["userId"]), // Index for user's chats

  // Messages table - individual messages with multi-part content
  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    parts: v.optional(v.array(messagePart)),
    content: v.string(), // For search compatibility and simple text access
    metadata: v.optional(v.object({
      timestamp: v.optional(v.number()),
      model: v.optional(v.string()),
      tokenCount: v.optional(v.number()),
    })),
  })
    .index("by_chat_and_created", ["chatId", "_creationTime"])
    .searchIndex("by_user_content", {
      searchField: "content",
      filterFields: ["userId", "chatId"],
    }),

  // Chat attachments table - file attachments for conversations
  chat_attachments: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    fileId: v.id("_storage"), // Convex file storage reference
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.optional(v.number()),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"]),

  // User sessions table - for session management (BetterAuth integration)
  user_sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
    lastAccessed: v.optional(v.number()),
  })
    .index("by_token", ["sessionToken"])
    .index("by_user", ["userId"]),

  // Chat shares table - for sharing chat conversations
  chat_shares: defineTable({
    chatId: v.id("chats"),
    shareId: v.string(), // Public share identifier
    isPublic: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdBy: v.id("users"),
  })
    .index("by_shareId", ["shareId"])
    .index("by_chat", ["chatId"]),
});