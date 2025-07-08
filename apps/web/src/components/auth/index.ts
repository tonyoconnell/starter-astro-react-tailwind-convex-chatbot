// Authentication UI Components
export { LoginForm } from "./LoginForm";
export { UserMenu } from "./UserMenu";
export { AuthGuard, withAuthGuard } from "./AuthGuard";
export { 
  AuthProvider, 
  useAuthContext, 
  AuthErrorBoundary, 
  AuthErrorFallback 
} from "./AuthProvider";
export { AuthLoadingSpinner } from "./AuthLoadingSpinner";

// Re-export auth utilities for convenience
export {
  useAuthStore,
  authActions,
  $isAuthenticated,
  $user,
  $isLoading,
  $error,
} from "@starter/lib/auth";