import { mutation } from "./_generated/server";

// Simple mutation to populate the 4 tables with demo data
export const createDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // 1. Create a user entity
    const user = await ctx.db.insert("entities", {
      entityType: "user",
      name: "Demo User",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create a block entity  
    const block = await ctx.db.insert("entities", {
      entityType: "block",
      name: "4-Table Demo Block",
      content: "This is a demo of the 4-table architecture!",
      status: "active",
      price: 99,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create a connection
    const connection = await ctx.db.insert("connections", {
      fromId: user,
      toId: block,
      connectionType: "owns",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // 4. Create an event
    const event = await ctx.db.insert("events", {
      eventType: "created",
      actorId: user,
      targetId: block,
      createdAt: now,
    });

    // 5. Create a tag
    const tag = await ctx.db.insert("tags", {
      entityId: block,
      key: "category", 
      value: "demo",
      keyValue: "category:demo",
      entityKey: `${block}:category`,
      grantedAt: now,
    });

    return {
      success: true,
      message: "🎉 4-Table Revolution demo data created!",
      created: { user, block, connection, event, tag }
    };
  },
});