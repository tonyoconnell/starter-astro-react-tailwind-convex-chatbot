import { useEffect, type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { authActions, $isAuthenticated, setConvexClient } from "@starter/lib/auth";

interface AuthProviderProps {
  children: ReactNode;
  convexClient?: any; // Type this properly based on your Convex client
}

export function AuthProvider({ children, convexClient }: AuthProviderProps) {
  const isAuthenticated = useStore($isAuthenticated);

  useEffect(() => {
    // Set up Convex client integration if provided
    if (convexClient) {
      setConvexClient(convexClient);
    }

    // Initialize authentication state
    authActions.initializeAuth();

    // Set up auth state change listeners
    const handleStorageChange = (e: StorageEvent) => {
      // Handle auth state changes from other tabs
      if (e.key === "auth_session_changed") {
        authActions.refreshSession();
      }
    };

    const handleVisibilityChange = () => {
      // Refresh session when tab becomes visible
      if (!document.hidden && isAuthenticated) {
        authActions.refreshSession();
      }
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Set up periodic session validation
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        authActions.refreshSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(sessionCheckInterval);
    };
  }, [convexClient, isAuthenticated]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Refresh auth state on navigation
      if (isAuthenticated) {
        authActions.refreshSession();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated]);

  return <>{children}</>;
}

// Hook for components that need auth context
export function useAuthContext() {
  return {
    // Re-export commonly used auth stores and actions
    actions: authActions,
  };
}

// Optional: Error Boundary for auth-related errors
export class AuthErrorBoundary extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = "AuthErrorBoundary";
  }
}

interface AuthErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function AuthErrorFallback({ error, resetError }: AuthErrorFallbackProps) {
  const isAuthError = error instanceof AuthErrorBoundary;

  return (
    <div className="min-h-64 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isAuthError ? "Authentication Error" : "Something went wrong"}
        </h2>
        <p className="text-gray-600 mb-6">
          {isAuthError 
            ? "There was a problem with authentication. Please try signing in again."
            : "An unexpected error occurred. Please try refreshing the page."
          }
        </p>
        <div className="space-x-3">
          <button
            onClick={resetError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          {isAuthError && (
            <button
              onClick={() => {
                authActions.clearAuth();
                window.location.href = "/login";
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}