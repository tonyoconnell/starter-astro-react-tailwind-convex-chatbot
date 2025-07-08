import { betterAuth } from "better-auth";
import { convexAdapter } from "@better-auth-kit/convex";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for database adapter
const convexClient = new ConvexHttpClient(process.env.CONVEX_URL || "");

export const auth = betterAuth({
  database: convexAdapter(convexClient),
  
  // OAuth providers configuration
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/github`,
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
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4321",
  
  // Secret for signing sessions
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-here-change-in-production",

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

// Export auth client for use in applications
export const authClient = auth.createAuthClient();

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