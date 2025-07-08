/**
 * User profile management API endpoint
 * GET: Get user profile
 * PATCH: Update user profile
 * DELETE: Delete user account
 */

import type { APIRoute } from "astro";
import { authClient } from "@starter/lib/auth";
import { api } from "../../../convex/_generated/api";

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get current session
    const session = await authClient.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "No active session",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return user profile
    return new Response(
      JSON.stringify({
        user: session.user,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Profile fetch failed",
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

export const PATCH: APIRoute = async ({ request }) => {
  try {
    // Get current session
    const session = await authClient.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "No active session",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse request body
    const updates = await request.json();
    
    // Validate update fields
    const allowedFields = ["name", "email", "image"];
    const filteredUpdates: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        // Basic validation
        if (key === "email" && typeof value === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return new Response(
              JSON.stringify({
                error: "Invalid email format",
                message: "Please provide a valid email address",
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
        
        if (key === "name" && typeof value === "string") {
          const trimmedName = value.trim();
          if (trimmedName.length < 1) {
            return new Response(
              JSON.stringify({
                error: "Invalid name",
                message: "Name cannot be empty",
              }),
              {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
          }
          filteredUpdates[key] = trimmedName;
        } else {
          filteredUpdates[key] = value;
        }
      }
    }

    // TODO: Update user in Convex database
    // This would call the updateUser mutation with the user ID and updates
    
    // For now, return success with mock updated user
    const updatedUser = {
      ...session.user,
      ...filteredUpdates,
      updatedAt: new Date(),
    };

    return new Response(
      JSON.stringify(updatedUser),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Profile update failed",
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
    // Get current session
    const session = await authClient.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "No active session",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // TODO: Delete user account in Convex database
    // This would call the deleteUser mutation with proper cleanup
    
    // Sign out the user
    await authClient.signOut({
      headers: request.headers,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Account deleted successfully",
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
    console.error("Account deletion error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Account deletion failed",
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