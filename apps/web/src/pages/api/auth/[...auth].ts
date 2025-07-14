/**
 * BetterAuth API endpoints
 * Handles OAuth flows, session management, and authentication operations
 */

import type { APIRoute } from "astro";
import { betterAuth } from "better-auth";

// Disable prerendering for dynamic auth routes in SSR mode
export const prerender = false;

// Create auth instance with Astro's environment variables and Better Auth UI features
const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID || "",
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${import.meta.env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/callback/google`,
    },
    github: {
      clientId: import.meta.env.GITHUB_CLIENT_ID || "",
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET || "",
      redirectURI: `${import.meta.env.BETTER_AUTH_URL || "http://localhost:4321"}/api/auth/callback/github`,
    },
  },
  baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:4321",
  secret: import.meta.env.BETTER_AUTH_SECRET || "development-secret",
  
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    // Email configuration would go here for production
  },
  
  // Two-Factor Authentication
  twoFactor: {
    enabled: true,
    issuer: "AI Starter Template",
  },
  
  // Passkeys/WebAuthn Support
  passkeys: {
    enabled: true,
    rpName: "AI Starter Template",
    rpID: import.meta.env.BETTER_AUTH_URL?.replace(/^https?:\/\//, '') || "localhost",
  },
  
  // Organizations (optional - enable if needed)
  organizations: {
    enabled: false, // Enable when needed
    allowUserToCreateOrganization: true,
  },
  
  // API Keys Management
  apiKeys: {
    enabled: true,
    prefix: "ast_", // AI Starter Template prefix
  },
  
  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
  
  // User configuration
  user: {
    additionalFields: {
      name: {
        type: "string",
        required: false,
      },
      image: {
        type: "string",
        required: false,
      },
      username: {
        type: "string",
        required: false,
      },
    },
  },
});

// Handle all BetterAuth routes
export const ALL: APIRoute = async ({ request, params }) => {
  try {
    console.log("BetterAuth handler called:", {
      method: request.method,
      url: request.url,
      params: params,
      auth: params.auth
    });
    
    // BetterAuth handles all authentication routes internally
    const response = await auth.handler(request);
    
    // Convert headers to plain object for logging
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    console.log("BetterAuth response:", {
      status: response.status,
      headers: headersObj
    });
    
    return response;
  } catch (error) {
    console.error("Auth handler error:", error);
    
    // If BetterAuth fails, fall back to informative error
    return new Response(
      JSON.stringify({
        error: "Authentication error",
        message: error instanceof Error ? error.message : "Unknown error",
        hint: "Check that OAuth credentials are properly configured",
        url: request.url,
        params: params
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

