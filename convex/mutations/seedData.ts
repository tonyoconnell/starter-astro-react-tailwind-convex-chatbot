import { mutation } from "./_generated/server";
import { ENTITY_TYPES, CONNECTION_TYPES, EVENT_TYPES, TAG_CATEGORIES } from "./schema";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Create sample users
    const user1 = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.USER,
      name: "John Doe",
      slug: "john-doe",
      image: "https://avatar.example.com/john",
      description: "Software developer and entrepreneur",
      status: "active",
      visibility: "public",
      data: {
        email: "john@example.com",
        bio: "Full-stack developer with 5+ years experience",
        githubId: "johndoe"
      },
      wallet: {
        reputation: 4.5,
        balances: { USD: 1000 }
      },
      createdAt: now,
      updatedAt: now,
    });

    const user2 = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.USER,
      name: "Alice Smith",
      slug: "alice-smith",
      image: "https://avatar.example.com/alice",
      description: "AI researcher and data scientist",
      status: "active",
      visibility: "public",
      data: {
        email: "alice@example.com",
        bio: "PhD in Machine Learning, published researcher",
        linkedinId: "alicesmith"
      },
      wallet: {
        reputation: 4.8,
        balances: { USD: 2500 }
      },
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create an AI Agent
    const marketingAgent = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.AI_AGENT,
      name: "Marketing Assistant",
      slug: "marketing-assistant",
      description: "AI agent specialized in marketing and content creation",
      status: "active",
      visibility: "public",
      data: {
        kind: "user_generated",
        prompt: "You are a helpful marketing assistant that creates engaging content...",
        tools: ["webSearch", "contentGeneration", "analytics"],
        model: "gpt-4",
        capabilities: ["copywriting", "seo", "social media"]
      },
      wallet: {
        reputation: 4.2,
        balances: {}
      },
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create a Block (collaborative content)
    const coffeeShopBlock = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.BLOCK,
      name: "Thai Coffee Shop Market Analysis",
      slug: "thai-coffee-shop-analysis",
      content: "Deep market analysis revealing $47K in untapped tourist revenue for local coffee shops in Chiang Mai...",
      description: "Comprehensive market research identifying revenue opportunities",
      status: "active",
      visibility: "public",
      featured: true,
      price: 9900, // $99
      currency: "USD",
      category: "market_research",
      tags: ["thailand", "coffee", "tourism", "market-analysis"],
      ownerId: user1,
      collaborators: [
        {
          entityId: user1,
          role: "lead_analyst",
          share: 50,
          joinedAt: now,
          permissions: ["read", "write", "admin"]
        },
        {
          entityId: user2,
          role: "data_scientist",
          share: 30,
          joinedAt: now,
          permissions: ["read", "write"]
        },
        {
          entityId: marketingAgent,
          role: "content_optimizer",
          share: 20,
          joinedAt: now,
          permissions: ["read"]
        }
      ],
      data: {
        blockType: "market_analysis",
        insights: {
          revenueGap: 47000,
          targetMarket: "tourists",
          recommendations: ["extend hours", "tourist-friendly menu", "location optimization"]
        },
        research: {
          sources: 15,
          interviews: 8,
          dataPoints: 247
        }
      },
      analytics: {
        views: 156,
        likes: 23,
        shares: 7,
        comments: 12,
        revenue: 297, // $2.97 earned so far
        conversions: 3,
        lastUpdated: now
      },
      seo: {
        title: "Thai Coffee Shop Market Analysis - $47K Revenue Opportunity",
        description: "Discover untapped revenue streams for coffee shops in Thailand's tourist market",
        keywords: ["thailand", "coffee shop", "market analysis", "tourism revenue"],
        ogTitle: "Unlock $47K in Coffee Shop Revenue",
        ogDescription: "Data-driven insights for Thai coffee shop owners"
      },
      searchText: "Thai coffee shop market analysis tourism revenue opportunity Chiang Mai",
      aiScore: 0.89,
      viralScore: 0.72,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });

    // 4. Create a Group (workspace)
    const marketResearchGroup = await ctx.db.insert("entities", {
      entityType: ENTITY_TYPES.GROUP,
      name: "Market Research Lab",
      slug: "market-research-lab",
      description: "Collaborative workspace for market research projects",
      status: "active",
      visibility: "private",
      ownerId: user1,
      data: {
        groupType: "workspace",
        settings: {
          allowPublicBlocks: true,
          requireApproval: false
        }
      },
      createdAt: now,
      updatedAt: now,
    });

    // 5. Create Connections (relationships)
    const ownsBlockConnection = await ctx.db.insert("connections", {
      fromId: user1,
      toId: coffeeShopBlock,
      connectionType: CONNECTION_TYPES.OWNS,
      status: "active",
      metadata: { creationContext: "block_created" },
      createdAt: now,
      updatedAt: now,
    });

    const membershipConnection = await ctx.db.insert("connections", {
      fromId: user1,
      toId: marketResearchGroup,
      connectionType: CONNECTION_TYPES.ADMIN_OF,
      role: "admin",
      permissions: ["read", "write", "delete", "manage_members"],
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const collaborationConnection = await ctx.db.insert("connections", {
      fromId: user2,
      toId: coffeeShopBlock,
      connectionType: CONNECTION_TYPES.COLLABORATES_WITH,
      role: "data_scientist",
      revenueShare: 30,
      status: "active",
      metadata: { invitedBy: user1 },
      createdAt: now,
      updatedAt: now,
    });

    // 6. Create Events (activity log)
    const blockCreatedEvent = await ctx.db.insert("events", {
      eventType: EVENT_TYPES.CREATED,
      actorId: user1,
      targetId: coffeeShopBlock,
      entityId: coffeeShopBlock,
      data: {
        entityType: "block",
        category: "market_research"
      },
      message: "Created Thai Coffee Shop Market Analysis block",
      createdAt: now,
    });

    const viewEvent = await ctx.db.insert("events", {
      eventType: EVENT_TYPES.VIEWED,
      actorId: user2,
      targetId: coffeeShopBlock,
      data: {
        duration: 45000,
        depth: 0.8,
        device: "desktop"
      },
      source: "direct",
      createdAt: now - 3600000, // 1 hour ago
    });

    const revenueEvent = await ctx.db.insert("events", {
      eventType: EVENT_TYPES.REVENUE_GENERATED,
      actorId: user2,
      targetId: coffeeShopBlock,
      revenue: 99,
      currency: "USD",
      data: {
        paymentMethod: "stripe",
        transactionId: "tx_12345"
      },
      createdAt: now - 1800000, // 30 minutes ago
    });

    const aiEvent = await ctx.db.insert("events", {
      eventType: EVENT_TYPES.INFERENCE_COMPLETED,
      actorId: marketingAgent,
      targetId: coffeeShopBlock,
      cost: 0.03,
      tokensUsed: 1200,
      responseTime: 2800,
      data: {
        model: "gpt-4",
        operation: "content_optimization",
        prompt_tokens: 800,
        completion_tokens: 400
      },
      createdAt: now - 900000, // 15 minutes ago
    });

    // 7. Create Tags (categorization)
    await ctx.db.insert("tags", {
      entityId: coffeeShopBlock,
      key: TAG_CATEGORIES.CATEGORY,
      value: "market_research",
      keyValue: "category:market_research",
      entityKey: `${coffeeShopBlock}:category`,
      source: "user",
      grantedBy: user1,
      grantedAt: now,
    });

    await ctx.db.insert("tags", {
      entityId: coffeeShopBlock,
      key: TAG_CATEGORIES.TOPIC,
      value: "tourism",
      keyValue: "topic:tourism",
      entityKey: `${coffeeShopBlock}:topic`,
      source: "user",
      confidence: 0.95,
      grantedBy: user1,
      grantedAt: now,
    });

    await ctx.db.insert("tags", {
      entityId: coffeeShopBlock,
      key: TAG_CATEGORIES.DIFFICULTY,
      value: "intermediate",
      keyValue: "difficulty:intermediate",
      entityKey: `${coffeeShopBlock}:difficulty`,
      source: "ai",
      confidence: 0.82,
      grantedAt: now,
    });

    await ctx.db.insert("tags", {
      entityId: user1,
      key: TAG_CATEGORIES.ROLE,
      value: "analyst",
      keyValue: "role:analyst",
      entityKey: `${user1}:role`,
      source: "system",
      grantedAt: now,
    });

    await ctx.db.insert("tags", {
      entityId: user2,
      key: TAG_CATEGORIES.SKILL,
      value: "data_science",
      keyValue: "skill:data_science",
      entityKey: `${user2}:skill`,
      source: "user",
      confidence: 0.98,
      grantedBy: user2,
      grantedAt: now,
    });

    return {
      message: "✅ 4-Table Revolution: Sample data created successfully!",
      summary: {
        entities: 4, // 2 users, 1 agent, 1 block, 1 group
        connections: 3,
        events: 4,
        tags: 5
      },
      entities: {
        users: [user1, user2],
        agents: [marketingAgent],
        blocks: [coffeeShopBlock],
        groups: [marketResearchGroup]
      }
    };
  },
});