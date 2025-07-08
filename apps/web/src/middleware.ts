import { defineMiddleware } from "astro:middleware";
import { serverAuthGuard } from "@starter/lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, redirect } = context;

  // Define protected routes
  const protectedRoutes = [
    "/profile",
    "/settings", 
    "/chat",
    "/dashboard"
  ];

  // Define public routes that don't need auth
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/about",
    "/api/auth"
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

  // Only apply auth guard to protected routes
  if (isProtectedRoute) {
    const { user, shouldRedirect, redirectUrl } = await serverAuthGuard(request, {
      requireAuth: true,
      redirectTo: "/login",
    });

    if (shouldRedirect && redirectUrl) {
      // Add current URL as redirect parameter
      const loginUrl = new URL(redirectUrl, url.origin);
      loginUrl.searchParams.set("redirect", pathname);
      return redirect(loginUrl.toString());
    }

    // Add user to locals for use in Astro pages
    context.locals.user = user;
    context.locals.isAuthenticated = !!user;
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