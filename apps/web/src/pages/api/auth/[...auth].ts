/**
 * BetterAuth API endpoints
 * Handles OAuth flows, session management, and authentication operations
 */

import type { APIRoute } from "astro";
import { betterAuth } from "better-auth";

// Disable prerendering for dynamic auth routes in SSR mode
export const prerender = false;

// Create auth instance with Astro's environment variables
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
    
    console.log("BetterAuth response:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
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

