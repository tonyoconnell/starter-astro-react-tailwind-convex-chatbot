import { betterAuth } from "better-auth";

// Server-side auth configuration that uses environment variables directly
export const createServerAuth = (env: Record<string, any>) => {
  return betterAuth({
    // OAuth providers configuration
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || "",
        clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        redirectURI: `${env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/callback/google`,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID || "",
        clientSecret: env.GITHUB_CLIENT_SECRET || "",
        redirectURI: `${env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/callback/github`,
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
        secure: env.NODE_ENV === "production",
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
    baseURL: env.BETTER_AUTH_URL || "http://localhost:4321",
    
    // Secret for signing sessions
    secret: env.BETTER_AUTH_SECRET || "your-secret-key-here-change-in-production",

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
};