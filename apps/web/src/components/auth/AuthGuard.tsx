import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { $isAuthenticated, $isLoading, $user, authActions } from "@starter/lib/auth";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireRole?: string;
  className?: string;
}

export function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = "/login", 
  requireRole,
  className = "" 
}: AuthGuardProps) {
  const isAuthenticated = useStore($isAuthenticated);
  const isLoading = useStore($isLoading);
  const user = useStore($user);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Initialize auth state if not already done
    if (!hasCheckedAuth) {
      authActions.initializeAuth().finally(() => {
        setHasCheckedAuth(true);
      });
    }
  }, [hasCheckedAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated (only in browser)
    if (hasCheckedAuth && !isLoading && !isAuthenticated && typeof window !== "undefined") {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      const loginUrl = `${redirectTo}?redirect=${currentUrl}`;
      window.location.href = loginUrl;
    }
  }, [isAuthenticated, isLoading, redirectTo, hasCheckedAuth]);

  // Show loading state while checking authentication
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to access this page.
          </p>
          <a
            href={redirectTo}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Check role-based access if required
  if (requireRole && user) {
    // Note: This assumes user object has a role property
    // Adjust based on your user schema
    const userRole = (user as any).role;
    if (!userRole || userRole !== requireRole) {
      return (
        <div className={`flex items-center justify-center min-h-64 ${className}`}>
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">⛔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and authorized
  return <div className={className}>{children}</div>;
}

// Higher-order component version for wrapping components
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardOptions?: Omit<AuthGuardProps, "children">
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...guardOptions}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}