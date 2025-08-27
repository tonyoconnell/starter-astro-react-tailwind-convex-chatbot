/**
 * Convex client for auth operations
 * This handles syncing auth data with the Convex database
 */

export interface UserData {
  id: string;
  name: string;
  email?: string;
  image?: string;
  provider?: string;
}

export interface SessionData {
  userId: string;
  sessionToken: string;
  expires: number;
}

/**
 * Sync user data with Convex via HTTP API
 */
export async function syncUserWithConvex(userData: UserData, convexUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${convexUrl}/api/mutations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: 'auth:syncUser',
        args: userData,
      }),
    });

    if (!response.ok) {
      console.error('Failed to sync user with Convex:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log('User synced with Convex:', result);
    return true;
  } catch (error) {
    console.error('Error syncing user with Convex:', error);
    return false;
  }
}

/**
 * Create user session in Convex via HTTP API
 */
export async function createSessionInConvex(sessionData: SessionData, convexUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${convexUrl}/api/mutations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: 'auth:createUserSession',
        args: sessionData,
      }),
    });

    if (!response.ok) {
      console.error('Failed to create session in Convex:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log('Session created in Convex:', result);
    return true;
  } catch (error) {
    console.error('Error creating session in Convex:', error);
    return false;
  }
}

/**
 * Verify session with Convex via HTTP API
 */
export async function verifySessionWithConvex(sessionToken: string, convexUrl: string): Promise<any | null> {
  try {
    const response = await fetch(`${convexUrl}/api/queries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function: 'auth:getUserBySession',
        args: { sessionToken },
      }),
    });

    if (!response.ok) {
      console.error('Failed to verify session with Convex:', await response.text());
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error verifying session with Convex:', error);
    return null;
  }
}