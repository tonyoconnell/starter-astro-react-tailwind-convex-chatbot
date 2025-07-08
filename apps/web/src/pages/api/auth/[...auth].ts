/**
 * BetterAuth API endpoints
 * Handles OAuth flows, session management, and authentication operations
 */

import type { APIRoute } from "astro";
import { auth } from "@starter/lib/auth";

// Handle all BetterAuth routes
export const ALL: APIRoute = async ({ request }) => {
  try {
    // BetterAuth handles all authentication routes internally
    const response = await auth.handler(request);
    
    return response;
  } catch (error) {
    console.error("Auth handler error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Authentication error",
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