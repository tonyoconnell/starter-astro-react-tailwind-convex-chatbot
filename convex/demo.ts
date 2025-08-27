import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create demo data for the 4-table schema
export const createDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Create entities
    const user = await ctx.db.insert("entities", {
      entityType: "user",
      name: "John Doe",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const block = await ctx.db.insert("entities", {
      entityType: "block", 
      name: "Sample Block",
      content: "This demonstrates the 4-table architecture",
      status: "active",
      price: 99,
      createdAt: now,
      updatedAt: now,
    });

    // Create connection
    const connection = await ctx.db.insert("connections", {
      fromId: user,
      toId: block,
      connectionType: "owns",
      status: "active", 
      createdAt: now,
      updatedAt: now,
    });

    // Create event
    const event = await ctx.db.insert("events", {
      eventType: "created",
      actorId: user,
      targetId: block,
      createdAt: now,
    });

    // Create tag
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
      message: "Demo data created successfully!",
      data: { user, block, connection, event, tag }
    };
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const entities = await ctx.db.query("entities").collect();
    const connections = await ctx.db.query("connections").collect();
    const events = await ctx.db.query("events").collect();
    const tags = await ctx.db.query("tags").collect();

    return {
      entities: entities.length,
      connections: connections.length,
      events: events.length,
      tags: tags.length,
      data: { entities, connections, events, tags }
    };
  },
});