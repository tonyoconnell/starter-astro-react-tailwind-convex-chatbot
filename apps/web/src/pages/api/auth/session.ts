/**
 * Session management API endpoint
 * GET: Get current session status
 * DELETE: Clear current session
 */

import type { APIRoute } from "astro";
import { betterAuth } from "better-auth";

// Disable prerendering for SSR mode
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

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log("Session check requested");
    
    // Get session from BetterAuth using proper API
    const session = await auth.api.getSession({
      headers: Object.fromEntries(request.headers.entries())
    });

    if (session && session.user) {
      console.log("Active session found:", session.user.id);
      return new Response(
        JSON.stringify({
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          },
          session: {
            id: session.session.id,
            userId: session.session.userId,
            expiresAt: session.session.expiresAt,
          },
          authenticated: true
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("No active session found");
    return new Response(
      JSON.stringify({
        user: null,
        session: null,
        authenticated: false
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Session check error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Session check failed",
        message: error instanceof Error ? error.message : "Unknown error",
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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    console.log("Sign out requested");
    
    // Use proper BetterAuth signOut API
    const result = await auth.api.signOut({
      headers: Object.fromEntries(request.headers.entries())
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signed out successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // BetterAuth will handle cookie clearing in the result
          ...Object.fromEntries(result.headers?.entries() || []),
        },
      }
    );
  } catch (error) {
    console.error("Sign out error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Sign out failed",
        message: error instanceof Error ? error.message : "Unknown error",
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