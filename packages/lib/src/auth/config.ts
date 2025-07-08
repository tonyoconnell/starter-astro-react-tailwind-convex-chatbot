import { betterAuth } from "better-auth";
import { createAuthClient } from "better-auth/react";

// Note: Commented out Convex imports to avoid initialization errors
// import { convexAdapter } from "@better-auth-kit/convex";
// import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for database adapter (only if URL is provided)
// const convexUrl = process.env.CONVEX_URL;
// const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export const auth = betterAuth({
  // Use in-memory database for development (session storage in memory)
  // TODO: Add Convex adapter once backend is deployed
  // database: convexClient ? convexAdapter(convexClient) : undefined,
  
  // OAuth providers configuration
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID || "",
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${import.meta.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: import.meta.env.GITHUB_CLIENT_ID || "",
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: `${import.meta.env.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    // Session cookies configuration
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
  baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:4321",
  
  // Secret for signing sessions
  secret: import.meta.env.BETTER_AUTH_SECRET || "your-secret-key-here-change-in-production",

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
  baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:4321"
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