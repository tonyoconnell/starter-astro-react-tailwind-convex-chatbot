import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (_context, next) => {
  // For now, just pass through - no authentication
  // Real user data will come from BetterAuth cookies/session
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