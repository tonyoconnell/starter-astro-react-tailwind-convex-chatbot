/**
 * User profile management API endpoint (Development Mode)
 * GET: Get user profile
 * PATCH: Update user profile
 * DELETE: Delete user account
 */

import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    console.log("Profile GET requested");
    
    // Mock profile data for development
    return new Response(
      JSON.stringify({
        user: {
          id: "dev-user-123",
          name: "Development User",
          email: "dev@example.com",
          image: null,
          _creationTime: Date.now() - 86400000, // 1 day ago
        },
        developmentMode: true,
        message: "Mock profile data - Convex not connected"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Profile GET error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Profile fetch failed",
        message: error instanceof Error ? error.message : "Unknown error",
        developmentMode: true
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
    console.log("Profile PATCH requested");
    
    const body = await request.json();
    console.log("Profile update data:", body);
    
    // Mock successful profile update
    return new Response(
      JSON.stringify({
        user: {
          id: "dev-user-123",
          name: body.name || "Development User",
          email: body.email || "dev@example.com",
          image: body.image || null,
          _creationTime: Date.now() - 86400000,
        },
        success: true,
        message: "Profile updated successfully (development mode)",
        developmentMode: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Profile PATCH error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Profile update failed",
        message: error instanceof Error ? error.message : "Unknown error",
        developmentMode: true
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
    console.log("Profile DELETE requested");
    
    const body = await request.json();
    console.log("Account deletion data:", body);
    
    // Mock successful account deletion
    return new Response(
      JSON.stringify({
        success: true,
        message: "Account deleted successfully (development mode)",
        reason: body.reason || "Not specified",
        feedback: body.feedback || "No feedback provided",
        developmentMode: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Clear session cookie
          "Set-Cookie": "better-auth-session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict",
        },
      }
    );
  } catch (error) {
    console.error("Profile DELETE error:", error);
    
    return new Response(
      JSON.stringify({
        error: "Account deletion failed",
        message: error instanceof Error ? error.message : "Unknown error",
        developmentMode: true
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