/**
 * Session management API endpoint
 * GET: Get current session status
 * DELETE: Clear current session
 */

import type { APIRoute } from "astro";
import { authClient } from "@starter/lib/auth";

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get session from BetterAuth
    const session = await authClient.getSession({
      headers: request.headers,
    });

    if (session?.user) {
      return new Response(
        JSON.stringify({
          user: session.user,
          session: {
            id: session.session.id,
            userId: session.user.id,
            expiresAt: session.session.expiresAt,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        user: null,
        session: null,
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
    // Sign out with BetterAuth
    await authClient.signOut({
      headers: request.headers,
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
          // Clear session cookie
          "Set-Cookie": "better-auth-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict",
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