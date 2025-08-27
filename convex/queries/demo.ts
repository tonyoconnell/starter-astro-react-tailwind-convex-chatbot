import { query } from "../_generated/server";
import { ENTITY_TYPES } from "../schema";

// Query to demonstrate the 4-table architecture
export const getDemo = query({
  args: {},
  handler: async (ctx) => {
    // Get all entities by type
    const users = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("entityType", ENTITY_TYPES.USER))
      .collect();

    const agents = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("entityType", ENTITY_TYPES.AI_AGENT))
      .collect();

    const blocks = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("entityType", ENTITY_TYPES.BLOCK))
      .collect();

    const groups = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("entityType", ENTITY_TYPES.GROUP))
      .collect();

    // Get all connections
    const connections = await ctx.db.query("connections").collect();

    // Get recent events
    const recentEvents = await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("eventType", "viewed"))
      .order("desc")
      .take(5);

    // Get all tags
    const tags = await ctx.db.query("tags").collect();

    return {
      summary: {
        totalEntities: users.length + agents.length + blocks.length + groups.length,
        users: users.length,
        agents: agents.length,
        blocks: blocks.length,
        groups: groups.length,
        connections: connections.length,
        events: recentEvents.length,
        tags: tags.length,
      },
      data: {
        users: users.slice(0, 2), // Show first 2
        agents: agents.slice(0, 2),
        blocks: blocks.slice(0, 2),
        groups: groups.slice(0, 2),
        connections: connections.slice(0, 3),
        recentEvents,
        tags: tags.slice(0, 5),
      },
    };
  },
});