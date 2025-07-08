import { defineMiddleware } from "astro:middleware";
import { auth } from "@starter/lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, redirect } = context;

  // Define protected routes
  const protectedRoutes = [
    "/profile",
    "/settings", 
    "/chat",
    "/dashboard"
  ];

  const pathname = url.pathname;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if this is an API auth route (always allow)
  const isAuthApiRoute = pathname.startsWith("/api/auth");

  if (isAuthApiRoute) {
    return next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute) {
    try {
      // Use proper BetterAuth session validation
      const session = await auth.api.getSession({
        headers: Object.fromEntries(request.headers.entries())
      });
      
      if (!session || !session.user) {
        // Redirect to auth test page for login
        const loginUrl = new URL("/auth-test", url.origin);
        loginUrl.searchParams.set("redirect", pathname);
        return redirect(loginUrl.toString());
      }
      
      // Add auth data to locals for use in pages
      context.locals.isAuthenticated = true;
      context.locals.user = session.user;
    } catch (error) {
      console.error("Authentication check failed:", error);
      
      // Redirect to auth page on error
      const loginUrl = new URL("/auth-test", url.origin);
      loginUrl.searchParams.set("redirect", pathname);
      return redirect(loginUrl.toString());
    }
  }

  return next();
});

// Export type for Astro locals
declare global {
  namespace App {
    interface Locals {
      user?: any;
      isAuthenticated?: boolean;
    }
  }
}