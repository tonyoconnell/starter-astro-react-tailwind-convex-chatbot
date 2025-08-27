import { mutation } from "./_generated/server";

export const createTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a simple entity
    const entity = await ctx.db.insert("entities", {
      entityType: "user",
      name: "Test User",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, entityId: entity };
  },
});