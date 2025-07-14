import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/react";

// Note: Commented out Convex imports to avoid initialization errors
// import { convexAdapter } from "@better-auth-kit/convex";
// import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for database adapter (only if URL is provided)
// const convexUrl = process.env.CONVEX_URL;
// const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

// For client-side usage, this config won't have access to server env vars
// Use createServerAuth in API routes instead
const isDev = process.env.NODE_ENV !== 'production';

export const auth = betterAuth({
  // Use in-memory database for development (session storage in memory)
  // TODO: Add Convex adapter once backend is deployed
  // database: convexClient ? convexAdapter(convexClient) : undefined,
  
  // OAuth providers configuration - empty for client-side
  // Server-side API routes should use createServerAuth instead
  socialProviders: {},

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    // Session cookies configuration
    cookie: {
      httpOnly: true,
      secure: !isDev,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    },
  },

  // Security configuration
  security: {
    csrf: { 
      enabled: true,
      sameSite: "strict",
    },
    rateLimit: { 
      enabled: true,
      window: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    },
  },

  // Base URL for OAuth callbacks
  baseURL: "http://localhost:4321",
  
  // Secret for signing sessions - use a static one for client-side
  secret: "client-side-placeholder-secret",

  // User configuration
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: true,
      },
      image: {
        type: "string",
        required: false,
      },
      email: {
        type: "string", 
        required: false,
      },
    },
  },

  // Advanced configuration
  advanced: {
    generateId: false, // Let Convex generate IDs
    cookiePrefix: "better-auth",
  },
});

// Create and export auth client for use in applications
export const authClient = createAuthClient({
  baseURL: "http://localhost:4321"
});

// Type definitions for authenticated user
export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}