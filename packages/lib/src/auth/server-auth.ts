/**
 * Server-side BetterAuth configuration with Convex integration
 * This is used in API routes where we have access to environment variables
 */

import { betterAuth } from "better-auth";

export function createServerAuth(baseURL: string) {
  return betterAuth({
    // Database configuration - we'll sync with Convex manually
    // since the official adapter requires specific setup
    database: undefined, // We'll handle syncing in API routes
    
    // OAuth providers with server environment variables
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
        secure: process.env.NODE_ENV === 'production',
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
    baseURL,
    
    // Secret for signing sessions
    secret: process.env.BETTER_AUTH_SECRET!,

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

    // Callbacks for Convex integration
    callbacks: {
      async signIn({ user, account }: { user: any, account: any }) {
        console.log("BetterAuth signIn callback:", { userId: user.id, provider: account?.providerId });
        return true;
      },
      async session({ session, user }: { session: any, user: any }) {
        console.log("BetterAuth session callback:", { userId: user.id, sessionId: session.id });
        return session;
      },
    },
  });
}