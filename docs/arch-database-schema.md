# AI-Accelerated Starter Template - Database Schema

This schema will be defined in `convex/schema.ts` and uses BetterAuth for user management.

```typescript
// Path: convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Note: Using the custom 'BetterAuth' solution.
// Schema definitions for Message Parts (TextPart, etc.) would be here...
const TextPart = v.object({ type: v.literal("text"), text: v.string() });
const MessagePart = v.union(TextPart /*, ... other parts */);

export default defineSchema({
  // Self-managed users table for BetterAuth
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // Unique ID from the BetterAuth provider
  }).index("by_token", ["tokenIdentifier"]),

  // Table for chat sessions
  chats: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Table for individual messages
  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    parts: v.optional(v.array(MessagePart)),
    content: v.string(), // For search compatibility
    metadata: v.optional(v.object({ /* ... as defined ... */ })),
  })
  .index("by_chat_and_created", ["chatId", "createdAt"])
  .searchIndex("by_user_content", { searchField: "content", filterFields: ["userId", "chatId"] }),

  // Table for file attachments
  chat_attachments: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  }).index("by_chatId", ["chatId"]),
});
```
