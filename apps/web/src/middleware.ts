import { defineMiddleware } from "astro:middleware";

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

  // Check if this is an API route (always allow)
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    return next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute) {
    try {
      // For now, just check for a session cookie
      const cookies = request.headers.get("cookie") || "";
      const hasSession = cookies.includes("better-auth.session");
      
      if (!hasSession) {
        // Redirect to auth test page for login
        const loginUrl = new URL("/auth-test", url.origin);
        loginUrl.searchParams.set("redirect", pathname);
        return redirect(loginUrl.toString());
      }
      
      // Add auth data to locals for use in pages
      context.locals.isAuthenticated = true;
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