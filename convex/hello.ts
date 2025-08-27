import { mutation, query } from "./_generated/server";
import { ENTITY_TYPES, CONNECTION_TYPES, EVENT_TYPES } from "./schema";

export const sayHello = query({
  args: {},
  handler: async () => {
    return "Hello from Convex!";
  },
});

// Simple function to test the 4-table schema
export const createSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Create a simple user entity
    const user = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.USER,
      name: "Demo User",
      slug: "demo-user",
      status: "active",
      visibility: "public",
      createdAt: now,
      updatedAt: now,
    });

    // Create a simple block entity
    const block = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.BLOCK,
      name: "Demo Block",
      content: "This is a demo block in the 4-table architecture",
      status: "active",
      visibility: "public",
      ownerId: user,
      price: 1000, // $10
      createdAt: now,
      updatedAt: now,
    });

    // Create a connection
    const connection = await ctx.db.insert("connections", {
      fromId: user,
      toId: block,
      connectionType: CONNECTION_TYPES.OWNS,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Create an event
    const event = await ctx.db.insert("events", {
      eventType: EVENT_TYPES.CREATED,
      actorId: user,
      targetId: block,
      createdAt: now,
    });

    // Create a tag
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
      message: "🎉 4-Table Revolution sample data created!",
      entities: { user, block },
      connection,
      event,
      tag,
    };
  },
});

// Query to show the data
export const getDemoData = query({
  args: {},
  handler: async (ctx) => {
    const entities = await ctx.db.query("entities").take(10);
    const connections = await ctx.db.query("connections").take(10);
    const events = await ctx.db.query("events").take(10);
    const tags = await ctx.db.query("tags").take(10);

    return {
      entities,
      connections,
      events,
      tags,
      summary: {
        entities: entities.length,
        connections: connections.length,
        events: events.length,
        tags: tags.length,
      },
    };
  },
});