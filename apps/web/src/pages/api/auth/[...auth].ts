/**
 * BetterAuth API endpoints
 * Handles OAuth flows, session management, and authentication operations
 */

import type { APIRoute } from "astro";

export const prerender = false;

// Simple auth handler that sets session cookies
export const ALL: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);
  const pathSegments = params.auth;
  const authPath = Array.isArray(pathSegments) ? pathSegments.join('/') : (pathSegments || '');
  
  console.log("Auth request:", request.method, authPath);

  // Handle sign-in requests
  if (authPath === 'sign-in/social' && request.method === 'POST') {
    try {
      const body = await request.json();
      const { provider } = body;
      
      console.log("Social sign-in attempt:", provider);
      
      if (provider === 'google') {
        // Create Google OAuth URL
        const googleClientId = import.meta.env.GOOGLE_CLIENT_ID;
        const redirectUri = `${import.meta.env.BETTER_AUTH_URL || 'http://localhost:4321'}/api/auth/callback/google`;
        
        console.log('Google OAuth redirect URI:', redirectUri);
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
          state: 'google-auth'
        })}`;
        
        return new Response(JSON.stringify({ url: authUrl }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (provider === 'github') {
        // Create GitHub OAuth URL
        const githubClientId = import.meta.env.GITHUB_CLIENT_ID;
        const redirectUri = `${import.meta.env.BETTER_AUTH_URL || 'http://localhost:4321'}/api/auth/callback/github`;
        
        const authUrl = `https://github.com/login/oauth/authorize?${new URLSearchParams({
          client_id: githubClientId,
          redirect_uri: redirectUri,
          scope: 'user:email',
          state: 'github-auth'
        })}`;
        
        return new Response(JSON.stringify({ url: authUrl }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error("Social auth error:", error);
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle OAuth callbacks
  if (authPath.startsWith('callback/')) {
    const provider = authPath.split('/')[1];
    const code = url.searchParams.get('code');
    
    console.log(`OAuth callback for ${provider}, code:`, code ? 'received' : 'missing');
    
    if (!code) {
      return new Response('Authorization code missing', { status: 400 });
    }

    try {
      let userInfo: any = null;
      
      if (provider === 'google') {
        // Exchange code for access token
        const redirectUri = `${import.meta.env.BETTER_AUTH_URL || 'http://localhost:4321'}/api/auth/callback/google`;
        
        console.log('Google token exchange, redirect_uri:', redirectUri);
        
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: import.meta.env.GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          })
        });

        console.log('Google token response status:', tokenResponse.status);
        
        if (tokenResponse.ok) {
          const tokens = await tokenResponse.json();
          console.log('Google tokens received:', { has_access_token: !!tokens.access_token });
          
          // Get user info
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          });
          
          console.log('Google userinfo response status:', userResponse.status);
          
          if (userResponse.ok) {
            userInfo = await userResponse.json();
            console.log('Google user info:', { id: userInfo.id, email: userInfo.email, name: userInfo.name });
          } else {
            const errorText = await userResponse.text();
            console.error('Google userinfo error:', errorText);
          }
        } else {
          const errorText = await tokenResponse.text();
          console.error('Google token exchange error:', errorText);
        }
      }
      
      if (provider === 'github') {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: new URLSearchParams({
            client_id: import.meta.env.GITHUB_CLIENT_ID,
            client_secret: import.meta.env.GITHUB_CLIENT_SECRET,
            code,
          })
        });

        if (tokenResponse.ok) {
          const tokens = await tokenResponse.json();
          
          // Get user info
          const userResponse = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          });
          
          if (userResponse.ok) {
            userInfo = await userResponse.json();
          }
        }
      }

      if (userInfo) {
        console.log('Creating session for user:', { id: userInfo.id, email: userInfo.email, provider });
        
        // Create session cookie
        const sessionData = {
          id: userInfo.id || userInfo.login,
          name: userInfo.name || userInfo.login,
          email: userInfo.email,
          image: userInfo.picture || userInfo.avatar_url,
          provider,
          createdAt: Date.now()
        };

        console.log('Session data created:', sessionData);

        // Set session cookie with proper encoding
        const sessionJson = JSON.stringify(sessionData);
        console.log('Setting cookie with data:', sessionJson);
        
        const response = new Response(null, {
          status: 302,
          headers: {
            'Location': '/dashboard',
            'Set-Cookie': `better-auth.session=${encodeURIComponent(sessionJson)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}` // 7 days
          }
        });

        console.log('Redirecting to dashboard with session cookie');
        return response;
      } else {
        console.error('No user info received from OAuth provider');
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
    }

    return new Response('Authentication failed', { status: 400 });
  }

  // Handle session check
  if (authPath === 'session' && request.method === 'GET') {
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/better-auth\.session=([^;]+)/);
    
    if (sessionMatch) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionMatch[1]));
        return new Response(JSON.stringify({ user: sessionData }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error("Session parse error:", error);
      }
    }
    
    return new Response(JSON.stringify({ user: null }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response("Not found", { status: 404 });
};

