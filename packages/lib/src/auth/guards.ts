import * as React from "react";
import type { RouteGuard, User, Session } from "./types";

/**
 * Route protection utilities and guards
 */

export class AuthGuard {
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(user: User | null, session: Session | null): boolean {
    return !!(user && session && new Date(session.expiresAt) > new Date());
  }

  /**
   * Validate user session
   */
  static isValidSession(session: Session | null): boolean {
    if (!session) return false;
    return new Date(session.expiresAt) > new Date();
  }

  /**
   * Check if user has required role (for future RBAC)
   */
  static hasRole(user: User | null, requiredRole: string): boolean {
    // TODO: Implement role checking when RBAC is added
    // For now, just check if user exists
    return !!user;
  }

  /**
   * Check if user has any of the required roles
   */
  static hasAnyRole(user: User | null, requiredRoles: string[]): boolean {
    if (!requiredRoles.length) return true;
    // TODO: Implement role checking when RBAC is added
    return !!user;
  }

  /**
   * Get redirect URL for unauthenticated users
   */
  static getRedirectUrl(
    originalUrl: string,
    defaultRedirect: string = "/login"
  ): string {
    const url = new URL(defaultRedirect, window.location.origin);
    url.searchParams.set("redirect", originalUrl);
    return url.toString();
  }
}

/**
 * HOC for protecting React components
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<RouteGuard> = {}
) {
  const {
    requireAuth = true,
    redirectTo = "/login",
    allowedRoles = [],
  } = options;

  return function AuthenticatedComponent(props: P) {
    // This will be implemented when we have React components
    // For now, just return the component
    return React.createElement(Component, props);
  };
}

/**
 * Server-side authentication guard for Astro pages
 */
export interface AuthGuardOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export async function serverAuthGuard(
  request: Request,
  options: AuthGuardOptions = {}
): Promise<{ user: User | null; shouldRedirect: boolean; redirectUrl?: string }> {
  const { requireAuth = true, redirectTo = "/login" } = options;

  try {
    // Extract session cookie from request
    const cookies = request.headers.get("cookie") || "";
    const sessionCookie = cookies
      .split(";")
      .find((c) => c.trim().startsWith("better-auth-session="));

    if (!sessionCookie && requireAuth) {
      return {
        user: null,
        shouldRedirect: true,
        redirectUrl: redirectTo,
      };
    }

    // TODO: Validate session with BetterAuth
    // For now, just check if cookie exists
    if (sessionCookie) {
      // This would typically validate the session with the auth service
      // and return the user data
      return {
        user: null, // TODO: Get actual user from session
        shouldRedirect: false,
      };
    }

    return {
      user: null,
      shouldRedirect: requireAuth,
      redirectUrl: requireAuth ? redirectTo : undefined,
    };
  } catch (error) {
    console.error("Auth guard error:", error);
    return {
      user: null,
      shouldRedirect: requireAuth,
      redirectUrl: redirectTo,
    };
  }
}

/**
 * Middleware for protecting API routes
 */
export async function apiAuthGuard(
  request: Request
): Promise<{ user: User | null; isAuthenticated: boolean }> {
  try {
    // Extract authorization header or session cookie
    const authHeader = request.headers.get("authorization");
    const cookies = request.headers.get("cookie") || "";
    
    // Check for Bearer token
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // TODO: Validate Bearer token
      return { user: null, isAuthenticated: false };
    }

    // Check for session cookie
    const sessionCookie = cookies
      .split(";")
      .find((c) => c.trim().startsWith("better-auth-session="));

    if (sessionCookie) {
      // TODO: Validate session cookie
      return { user: null, isAuthenticated: false };
    }

    return { user: null, isAuthenticated: false };
  } catch (error) {
    console.error("API auth guard error:", error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Utility to extract user from request in Astro endpoints
 */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const { user } = await apiAuthGuard(request);
  return user;
}

/**
 * Check if current environment requires HTTPS
 */
export function requiresHTTPS(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Validate redirect URL to prevent open redirects
 */
export function validateRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    const redirectUrl = new URL(url);
    const currentDomain = new URL(window.location.href).hostname;
    
    // Allow relative URLs and same domain
    if (redirectUrl.hostname === currentDomain) {
      return true;
    }
    
    // Check against allowed domains
    return allowedDomains.includes(redirectUrl.hostname);
  } catch {
    // Invalid URL format
    return false;
  }
}