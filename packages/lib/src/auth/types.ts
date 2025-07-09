// Authentication types and interfaces

export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  tokenIdentifier?: string; // For Convex integration
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  {
    id: "google",
    name: "Google",
    icon: "google",
    color: "bg-red-500",
  },
  {
    id: "github", 
    name: "GitHub",
    icon: "github",
    color: "bg-gray-800",
  },
];

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  image?: string;
}

// Route protection types
export interface RouteGuard {
  requireAuth: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

// OAuth callback response
export interface OAuthCallbackResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: AuthError;
  redirectUrl?: string;
}

// Session validation response
export interface SessionValidationResponse {
  valid: boolean;
  user?: User;
  session?: Session;
  error?: AuthError;
}