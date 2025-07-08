// Export all authentication utilities and types

export { auth, authClient } from "./config";
export type { AuthUser } from "./config";

export {
  $user,
  $session,
  $isLoading,
  $error,
  $isAuthenticated,
  $authState,
  authActions,
  useAuthStore,
  setConvexClient,
} from "./store";

export {
  AuthGuard,
  withAuth,
  serverAuthGuard,
  apiAuthGuard,
  getUserFromRequest,
  requiresHTTPS,
  validateRedirectUrl,
} from "./guards";

export type {
  User,
  Session,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  OAuthProvider,
  AuthError,
  UserProfileUpdate,
  RouteGuard,
  OAuthCallbackResponse,
  SessionValidationResponse,
} from "./types";

export { OAUTH_PROVIDERS } from "./types";

// Re-export commonly used types and utilities
export type { AuthGuardOptions } from "./guards";