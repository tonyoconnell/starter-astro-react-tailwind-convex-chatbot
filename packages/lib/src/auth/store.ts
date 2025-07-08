import { atom, computed } from "nanostores";
import type { User, Session, AuthState, AuthError } from "./types";
import { notificationActions } from "./notifications";

// Note: Convex client integration will be added when the main app initializes
// This allows the store to work without Convex dependency in the shared lib
let convexClient: any = null;

export const setConvexClient = (client: any) => {
  convexClient = client;
};

// Core authentication state atoms
export const $user = atom<User | null>(null);
export const $session = atom<Session | null>(null);
export const $isLoading = atom<boolean>(false);
export const $error = atom<AuthError | null>(null);

// Computed authentication state
export const $isAuthenticated = computed([$user, $session], (user, session) => {
  return !!(user && session);
});

export const $authState = computed(
  [$user, $session, $isAuthenticated, $isLoading, $error],
  (user, session, isAuthenticated, isLoading, error): AuthState => ({
    user,
    session,
    isAuthenticated,
    isLoading,
    error: error?.message || null,
  })
);

// Authentication actions
export const authActions = {
  /**
   * Set the current authenticated user
   */
  setUser(user: User | null) {
    $user.set(user);
    if (!user) {
      $session.set(null);
    }
  },

  /**
   * Set the current session
   */
  setSession(session: Session | null) {
    $session.set(session);
  },

  /**
   * Set loading state
   */
  setLoading(loading: boolean) {
    $isLoading.set(loading);
  },

  /**
   * Set authentication error
   */
  setError(error: AuthError | null) {
    $error.set(error);
  },

  /**
   * Clear all authentication state
   */
  clearAuth() {
    $user.set(null);
    $session.set(null);
    $isLoading.set(false);
    $error.set(null);
  },

  /**
   * Initialize authentication state from stored session
   */
  async initializeAuth() {
    $isLoading.set(true);
    $error.set(null);

    try {
      // Check for existing session
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user && data.session) {
          $user.set(data.user);
          $session.set(data.session);
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      $error.set({
        code: "INIT_ERROR",
        message: "Failed to initialize authentication",
        details: error,
      });
    } finally {
      $isLoading.set(false);
    }
  },

  /**
   * Sign out user and clear authentication state
   */
  async signOut() {
    $isLoading.set(true);
    $error.set(null);

    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        authActions.clearAuth();
        notificationActions.success("Signed out", "You have been successfully signed out");
        // Redirect to home page
        window.location.href = "/";
      } else {
        throw new Error("Failed to sign out");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      const errorMsg = "Failed to sign out. Please try again.";
      $error.set({
        code: "SIGNOUT_ERROR",
        message: errorMsg,
        details: error,
      });
      notificationActions.error("Sign out failed", errorMsg);
    } finally {
      $isLoading.set(false);
    }
  },

  /**
   * Refresh user session
   */
  async refreshSession() {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user && data.session) {
          $user.set(data.user);
          $session.set(data.session);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Failed to refresh session:", error);
      return false;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>) {
    $isLoading.set(true);
    $error.set(null);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        $user.set(updatedUser);
        notificationActions.success("Profile updated", "Your profile has been successfully updated");
        
        // Sync with Convex if available
        if (convexClient && updatedUser.tokenIdentifier) {
          try {
            await convexClient.mutation("functions/mutations/users:updateUser", {
              userId: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              image: updatedUser.image,
            });
          } catch (convexError) {
            console.warn("Failed to sync profile update with Convex:", convexError);
            notificationActions.warning("Sync warning", "Profile updated but sync with database failed");
          }
        }
        
        return updatedUser;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMsg = "Failed to update profile. Please try again.";
      $error.set({
        code: "PROFILE_UPDATE_ERROR",
        message: errorMsg,
        details: error,
      });
      notificationActions.error("Profile update failed", errorMsg);
      throw error;
    } finally {
      $isLoading.set(false);
    }
  },

  /**
   * Sync user data with Convex backend
   */
  async syncWithConvex() {
    const currentUser = $user.get();
    if (!convexClient || !currentUser?.tokenIdentifier) {
      return false;
    }

    try {
      const convexUser = await convexClient.query("functions/queries/users:getCurrentUser", {
        tokenIdentifier: currentUser.tokenIdentifier,
      });

      if (convexUser) {
        // Update local user state with Convex data
        $user.set({
          ...currentUser,
          name: convexUser.name,
          email: convexUser.email,
          image: convexUser.image,
        });
        return true;
      }
    } catch (error) {
      console.warn("Failed to sync with Convex:", error);
    }
    return false;
  },
};

// Auto-initialize authentication on store creation
if (typeof window !== "undefined") {
  authActions.initializeAuth();
}

// Export store subscription helpers
export const useAuthStore = () => ({
  user: $user,
  session: $session,
  isAuthenticated: $isAuthenticated,
  isLoading: $isLoading,
  error: $error,
  authState: $authState,
  actions: authActions,
});

// Token refresh interval (15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000;

// Set up automatic token refresh if in browser
if (typeof window !== "undefined") {
  setInterval(async () => {
    const isAuthenticated = $isAuthenticated.get();
    if (isAuthenticated) {
      const refreshed = await authActions.refreshSession();
      if (refreshed) {
        // Sync with Convex after successful refresh
        await authActions.syncWithConvex();
      }
    }
  }, TOKEN_REFRESH_INTERVAL);
}