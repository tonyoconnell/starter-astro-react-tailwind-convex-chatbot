/**
 * BetterAuth API endpoints
 * Handles OAuth flows, session management, and authentication operations
 */

import type { APIRoute } from "astro";
import { auth } from "@starter/lib/auth";

// Disable prerendering for dynamic auth routes in SSR mode
export const prerender = false;

// Handle all BetterAuth routes
export const GET: APIRoute = async ({ request, params }) => {
  try {
    console.log("BetterAuth GET handler called:", request.url, params);
    
    // BetterAuth handles all authentication routes internally
    const response = await auth.handler(request);
    
    console.log("BetterAuth response status:", response.status);
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

export const POST: APIRoute = async ({ request, params }) => {
  try {
    console.log("BetterAuth POST handler called:", request.url, params);
    
    // BetterAuth handles all authentication routes internally
    const response = await auth.handler(request);
    
    console.log("BetterAuth response status:", response.status);
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