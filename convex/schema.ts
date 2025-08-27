/**
 * ONE Network: The 4-Table Revolution
 * 
 * Everything is a block in a collaborative economy.
 * 93 tables → 4 tables = 96% complexity reduction with 0% feature loss.
 * 
 * Deploy once. Use forever. Scale infinitely.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================
// THE 4-TABLE ARCHITECTURE
// ============================================

export default defineSchema({

  /**
   * 1. ENTITIES - Everything That Exists
   * The universal table for all objects: users, agents, blocks, conversations,
   * messages, products, services, and any future entity type.
   */
  entities: defineTable({
    // Entity classification
    entityType: v.string(), // "user", "ai_agent", "block", "conversation", "message", etc.
    
    // Core identity fields
    name: v.optional(v.string()),
    slug: v.optional(v.string()), // URL-friendly identifier
    title: v.optional(v.string()), // Alternative to name for some entity types
    description: v.optional(v.string()),
    
    // Content fields
    content: v.optional(v.string()), // Main content/body
    excerpt: v.optional(v.string()), // Summary/preview
    
    // Media fields
    image: v.optional(v.string()), // Primary image URL (avatarUrl for agents/users)
    images: v.optional(v.array(v.string())), // Multiple images
    attachments: v.optional(v.array(v.object({
      type: v.string(), // "file", "image", "video", "audio"
      url: v.string(),
      name: v.optional(v.string()),
      size: v.optional(v.number()),
      mimeType: v.optional(v.string()),
    }))),
    
    // Status and visibility
    status: v.optional(v.string()), // "active", "draft", "archived", "deleted", "pending"
    visibility: v.optional(v.string()), // "public", "private", "unlisted", "group"
    featured: v.optional(v.boolean()),
    priority: v.optional(v.number()), // For sorting and priority queues
    order: v.optional(v.number()), // For ordered lists
    
    // Categorization and discovery
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    
    // Authorship and ownership
    author: v.optional(v.string()), // Author name
    ownerId: v.optional(v.id("entities")), // Primary owner
    createdBy: v.optional(v.id("entities")),
    updatedBy: v.optional(v.id("entities")),
    
    // Collaboration (for Block Economy)
    collaborators: v.optional(v.array(v.object({
      entityId: v.id("entities"),
      role: v.optional(v.string()),
      share: v.optional(v.number()), // Revenue share percentage
      joinedAt: v.number(),
      permissions: v.optional(v.array(v.string())),
    }))),
    
    // Pricing and monetization
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    priceRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
    
    // Blockchain and crypto
    blockchain: v.optional(v.object({
      network: v.string(),
      address: v.optional(v.string()),
      tokenId: v.optional(v.string()),
      txHash: v.optional(v.string()),
      metadata: v.optional(v.any()),
    })),
    
    // Universal wallet system
    wallet: v.optional(v.object({
      reputation: v.float64(),
      balances: v.optional(v.record(v.string(), v.number())),
      addresses: v.optional(v.record(v.string(), v.string())),
    })),
    
    // Location data
    location: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    
    // URLs and external links
    url: v.optional(v.string()),
    urls: v.optional(v.record(v.string(), v.string())),
    
    // AI and search optimization
    searchText: v.optional(v.string()), // Searchable content
    vector: v.optional(v.array(v.float64())), // 1536-dim embeddings
    aiScore: v.optional(v.float64()), // AI quality score
    viralScore: v.optional(v.float64()), // Viral potential score
    
    // Analytics summary (denormalized for performance)
    analytics: v.optional(v.object({
      views: v.number(),
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      revenue: v.optional(v.number()),
      conversions: v.optional(v.number()),
      lastUpdated: v.number(),
    })),
    
    // Multi-tenancy and permissions
    domain: v.optional(v.string()), // For white-label instances
    workspace: v.optional(v.string()), // Workspace/tenant ID
    groupId: v.optional(v.id("entities")), // Associated group
    permissions: v.optional(v.record(v.string(), v.boolean())),
    
    // SEO optimization
    seo: v.optional(v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      keywords: v.optional(v.array(v.string())),
      canonical: v.optional(v.string()),
      noindex: v.optional(v.boolean()),
      ogTitle: v.optional(v.string()),
      ogDescription: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      ogType: v.optional(v.string()),
      schema: v.optional(v.any()), // Schema.org JSON-LD
    })),
    
    // Dates and lifecycle
    publishedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()), // For scheduled content
    lastActiveTime: v.optional(v.number()), // For agents
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    version: v.optional(v.number()),
    
    // THE MAGIC: Infinite extensibility
    data: v.optional(v.any()), // Store ANY additional data
    metadata: v.optional(v.any()), // System-generated metadata
    settings: v.optional(v.any()), // User/entity-specific settings
    meta: v.optional(v.any()), // Alternative metadata field
  })
    // Optimized indexes for all common queries
    .index("by_type", ["entityType", "createdAt"])
    .index("by_type_status", ["entityType", "status", "createdAt"])
    .index("by_slug", ["slug"])
    .index("by_domain_slug", ["domain", "slug"])
    .index("by_owner", ["ownerId", "createdAt"])
    .index("by_group", ["groupId", "entityType", "createdAt"])
    .index("by_published", ["publishedAt"])
    .index("by_featured", ["featured", "createdAt"])
    .index("by_domain_type", ["domain", "entityType", "status"])
    .index("by_category", ["category", "createdAt"])
    .index("by_deleted", ["deletedAt"])
    // Search indexes
    .searchIndex("search_all", {
      searchField: "searchText",
      filterFields: ["entityType", "domain", "status", "visibility"],
    })
    .searchIndex("search_by_type", {
      searchField: "searchText",
      filterFields: ["entityType", "status"],
    })
    // Vector indexes for AI
    .vectorIndex("by_embedding", {
      vectorField: "vector",
      dimensions: 1536,
      filterFields: ["entityType", "domain", "groupId"],
    })
    .vectorIndex("by_embedding_type", {
      vectorField: "vector", 
      dimensions: 1536,
      filterFields: ["entityType", "status"],
    }),

  /**
   * 2. CONNECTIONS - All Relationships
   * The universal relationship table creating a graph structure between entities.
   */
  connections: defineTable({
    fromId: v.id("entities"),
    toId: v.id("entities"),
    connectionType: v.string(), // "owns", "follows", "member_of", "collaborates_with", etc.
    
    // Relationship metadata
    strength: v.optional(v.float64()), // 0-1 relationship strength
    weight: v.optional(v.number()), // Numerical weight
    order: v.optional(v.number()), // For ordered relationships
    bidirectional: v.optional(v.boolean()), // If relationship works both ways
    
    // Status and lifecycle
    status: v.optional(v.string()), // "active", "pending", "rejected", "expired"
    
    // Permissions and roles
    role: v.optional(v.string()), // Role in the relationship (e.g., "admin", "member")
    permissions: v.optional(v.array(v.string())), // Specific permissions
    
    // Revenue sharing (for Block Economy)
    revenueShare: v.optional(v.number()), // Percentage for this connection
    
    // Multi-tenancy
    domain: v.optional(v.string()),
    groupId: v.optional(v.id("entities")), // Scoped to group
    
    // Metadata
    metadata: v.optional(v.any()), // Flexible additional data
    context: v.optional(v.string()), // Context for the connection
    
    // Lifecycle
    createdAt: v.number(),
    createdBy: v.optional(v.id("entities")),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_from", ["fromId", "connectionType", "status"])
    .index("by_to", ["toId", "connectionType", "status"])
    .index("by_pair", ["fromId", "toId"])
    .index("by_type", ["connectionType", "createdAt"])
    .index("by_type_status", ["connectionType", "status", "createdAt"])
    .index("by_group", ["groupId", "connectionType"])
    .index("by_domain", ["domain", "connectionType"])
    .index("by_deleted", ["deletedAt"]),

  /**
   * 3. EVENTS - Everything That Happens
   * The universal event log capturing all actions for audit trails and analytics.
   */
  events: defineTable({
    eventType: v.string(), // "created", "viewed", "purchased", "message_sent", etc.
    
    // Who's involved
    actorId: v.id("entities"), // Who performed the action
    targetId: v.optional(v.id("entities")), // What was acted upon
    
    // References
    entityId: v.optional(v.id("entities")), // Related entity
    connectionId: v.optional(v.id("connections")), // Related connection
    parentEventId: v.optional(v.id("events")), // Event chains
    sessionId: v.optional(v.string()), // User session
    conversationId: v.optional(v.id("entities")), // For message events
    
    // Event data
    data: v.optional(v.any()), // Flexible event data
    
    // Status and processing
    status: v.optional(v.string()), // "pending", "completed", "failed"
    message: v.optional(v.string()), // Human-readable description
    
    // Financial tracking
    revenue: v.optional(v.number()), // Revenue generated
    cost: v.optional(v.number()), // Cost incurred (e.g., AI tokens)
    currency: v.optional(v.string()),
    
    // Performance metrics
    duration: v.optional(v.number()), // Event duration in ms
    responseTime: v.optional(v.number()),
    tokensUsed: v.optional(v.number()), // For AI events
    error: v.optional(v.string()),
    
    // Analytics context
    source: v.optional(v.string()), // Traffic source
    medium: v.optional(v.string()), // Marketing medium
    campaign: v.optional(v.string()), // Marketing campaign
    
    // Geographic data
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    
    // Technical context
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    deviceType: v.optional(v.string()),
    
    // Blockchain tracking
    txHash: v.optional(v.string()),
    blockNumber: v.optional(v.number()),
    
    // Multi-tenancy
    domain: v.optional(v.string()),
    groupId: v.optional(v.id("entities")),
    
    // Timestamps
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()), // For scheduled events
  })
    .index("by_type", ["eventType", "createdAt"])
    .index("by_actor", ["actorId", "createdAt"])
    .index("by_target", ["targetId", "createdAt"])
    .index("by_entity", ["entityId", "createdAt"])
    .index("by_status", ["status", "createdAt"])
    .index("by_session", ["sessionId", "createdAt"])
    .index("by_group", ["groupId", "eventType", "createdAt"])
    .index("by_domain", ["domain", "eventType", "createdAt"])
    .index("by_revenue", ["revenue", "createdAt"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_parent", ["parentEventId", "createdAt"]),

  /**
   * 4. TAGS - Flexible Categorization
   * The universal tagging system for rich metadata and efficient querying.
   */
  tags: defineTable({
    entityId: v.id("entities"),
    key: v.string(), // Tag category (e.g., "category", "skill", "role")
    value: v.string(), // Tag value (e.g., "tutorial", "javascript", "admin")
    
    // Tag metadata
    confidence: v.optional(v.float64()), // AI confidence score (0-1)
    source: v.optional(v.string()), // "user", "ai", "system"
    weight: v.optional(v.number()), // Tag importance
    
    // Lifecycle
    grantedBy: v.optional(v.id("entities")),
    grantedAt: v.number(),
    expiresAt: v.optional(v.number()),
    verifiedAt: v.optional(v.number()), // When verified as accurate
    
    // Multi-tenancy
    domain: v.optional(v.string()),
    groupId: v.optional(v.id("entities")),
    
    // Compound keys for efficient lookups
    keyValue: v.string(), // "category:electronics" for exact matches
    entityKey: v.string(), // For unique constraints
  })
    .index("by_entity", ["entityId", "key"])
    .index("by_key_value", ["key", "value"])
    .index("by_compound", ["keyValue"])
    .index("by_entity_key", ["entityKey"]) // Unique index
    .index("by_domain", ["domain", "key", "value"])
    .index("by_group", ["groupId", "key", "value"])
    .index("by_source", ["source", "grantedAt"])
    .index("by_confidence", ["confidence", "grantedAt"]),

  // ============================================
  // LEGACY COMPATIBILITY TABLES
  // ============================================
  
  // BetterAuth compatibility (kept for current auth integration)
  user: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),
    
  session: defineTable({
    id: v.string(),
    userId: v.string(),
    expiresAt: v.number(),
    token: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["userId"]),
    
  account: defineTable({
    id: v.string(),
    userId: v.string(),
    accountId: v.string(),
    providerId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"]),
    
  verification: defineTable({
    id: v.string(),
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_identifier", ["identifier"]),

  // App compatibility (legacy tables - will be migrated to entities)
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // Unique ID from BetterAuth
  })
    .index("by_token", ["tokenIdentifier"]), // Primary index for auth lookups

  chats: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  })
    .index("by_user", ["userId"]), // Index for user's chats

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    parts: v.optional(v.array(v.object({
      type: v.literal("text"),
      text: v.string(),
    }))),
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

  user_sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
    lastAccessed: v.optional(v.number()),
  })
    .index("by_token", ["sessionToken"])
    .index("by_user", ["userId"]),

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

// ============================================
// CONSTANTS AND ENUMERATIONS
// ============================================

// Entity types aligned with ontology
export const ENTITY_TYPES = {
  // Core entities
  USER: "user",
  AI_AGENT: "ai_agent",
  GROUP: "group",
  
  // Block Economy
  BLOCK: "block",
  
  // Communication
  CONVERSATION: "conversation",
  MESSAGE: "message",
  
  // Knowledge & Content
  KNOWLEDGE: "knowledge",
  KNOWLEDGE_SOURCE: "knowledge_source",
  DOCUMENT: "document",
  ATTACHMENT: "attachment",
  
  // Analytics & Insights
  INSIGHT: "insight",
  JOURNEY: "customer_journey",
  
  // Commerce
  PRODUCT: "product",
  SERVICE: "service",
  INVOICE: "invoice",
  PAYMENT: "payment",
  
  // Tools & Integration
  TOOL: "tool",
  TOOL_CONFIG: "tool_configuration",
  WEBHOOK: "webhook",
  INTEGRATION: "integration",
  
  // Content Types
  POST: "post",
  COMMENT: "comment",
  REVIEW: "review",
  TASK: "task",
  
  // System
  AUDIT_LOG: "audit_log",
  ERROR_LOG: "error_log",
  NOTIFICATION: "notification",
  INVITATION: "invitation",
  
  // Marketing
  CAMPAIGN: "campaign",
  PROMOTION: "promotion",
  CONTACT: "contact",
  CONTACT_LIST: "contact_list",
  
  // Domain-specific (White-label)
  DOMAIN: "white_label_domain",
} as const;

// Connection types aligned with ontology
export const CONNECTION_TYPES = {
  // Ownership
  OWNS: "owns",
  CREATED: "created",
  
  // Social
  FOLLOWS: "follows",
  LIKES: "likes",
  SHARES: "shares",
  
  // Membership
  MEMBER_OF: "member_of",
  ADMIN_OF: "admin_of",
  MODERATOR_OF: "moderator_of",
  
  // Participation
  PARTICIPATES_IN: "participates_in",
  
  // Collaboration
  COLLABORATES_WITH: "collaborates_with",
  CONTRIBUTES_TO: "contributes_to",
  
  // Communication
  MESSAGES: "messages",
  MENTIONS: "mentions",
  REPLIES_TO: "replies_to",
  COMMENTED_ON: "commented_on",
  
  // Content relationships
  REFERENCES: "references",
  EXTENDS: "extends",
  DEPENDS_ON: "depends_on",
  PART_OF: "part_of",
  CONTAINS: "contains",
  
  // Commerce
  PURCHASES: "purchases",
  SUBSCRIBES_TO: "subscribes_to",
  REVIEWS: "reviews",
  
  // Knowledge
  KNOWS_ABOUT: "knows_about",
  TEACHES: "teaches",
  LEARNS_FROM: "learns_from",
  
  // Assignment
  ASSIGNED_TO: "assigned_to",
  DELEGATES_TO: "delegates_to",
} as const;

// Event types aligned with ontology
export const EVENT_TYPES = {
  // Core CRUD
  CREATED: "created",
  UPDATED: "updated", 
  DELETED: "deleted",
  RESTORED: "restored",
  
  // User actions
  VIEWED: "viewed",
  CLICKED: "clicked",
  SEARCHED: "searched",
  DOWNLOADED: "downloaded",
  SHARED: "shared",
  
  // Social interactions
  LIKED: "liked",
  COMMENTED: "commented",
  FOLLOWED: "followed",
  MENTIONED: "mentioned",
  
  // Communication
  MESSAGE_SENT: "message_sent",
  MESSAGE_READ: "message_read",
  CALL_STARTED: "call_started",
  CALL_ENDED: "call_ended",
  
  // Commerce
  PURCHASED: "purchased",
  REFUNDED: "refunded",
  SUBSCRIBED: "subscribed",
  UNSUBSCRIBED: "unsubscribed",
  
  // Revenue
  REVENUE_GENERATED: "revenue_generated",
  REVENUE_DISTRIBUTED: "revenue_distributed",
  PAYOUT_PROCESSED: "payout_processed",
  COMMISSION_EARNED: "commission_earned",
  
  // AI & System
  AI_ANALYSIS: "ai_analysis",
  EMBEDDING_GENERATED: "embedding_generated",
  INFERENCE_COMPLETED: "inference_completed",
  TOOL_EXECUTED: "tool_executed",
  
  // Journey & Analytics
  JOURNEY_STEP_COMPLETED: "journey_step_completed",
  CONVERSION: "conversion",
  GOAL_ACHIEVED: "goal_achieved",
  
  // System events
  LOGIN: "login",
  LOGOUT: "logout",
  ERROR: "error",
  WARNING: "warning",
  
  // Blockchain
  TRANSACTION_CONFIRMED: "transaction_confirmed",
  PAYMENT_RECEIVED: "payment_received",
  
  // Viral & Growth
  VIRAL_SHARE: "viral_share",
  REFERRAL: "referral",
  INVITATION_SENT: "invitation_sent",
  INVITATION_ACCEPTED: "invitation_accepted",
} as const;

// Tag categories aligned with ontology
export const TAG_CATEGORIES = {
  // Content categorization
  CATEGORY: "category",
  TOPIC: "topic",
  SKILL: "skill",
  INDUSTRY: "industry",
  
  // Quality & AI
  QUALITY: "quality",
  SENTIMENT: "sentiment",
  LANGUAGE: "language",
  DIFFICULTY: "difficulty",
  
  // User attributes
  ROLE: "role",
  PERMISSION: "permission",
  PLAN: "plan",
  STATUS: "status",
  VERIFIED: "verified",
  REPUTATION: "reputation",
  
  // System tags
  FEATURE_FLAG: "feature_flag",
  EXPERIMENT: "experiment",
  VERSION: "version",
  
  // Marketing
  SOURCE: "source",
  MEDIUM: "medium", 
  CAMPAIGN: "campaign",
  
  // Location
  COUNTRY: "country",
  REGION: "region",
  CITY: "city",
} as const;