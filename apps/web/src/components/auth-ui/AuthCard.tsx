/**
 * AuthCard Component
 * Unified authentication experience with sign in/up
 */

import React, { useState } from 'react';

interface AuthCardProps {
  mode?: 'signin' | 'signup';
  providers?: string[];
  showEmailPassword?: boolean;
  redirectTo?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  forgotPasswordUrl?: string;
  onSuccess?: (user: any) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function AuthCard({
  mode = 'signin',
  providers = ['google', 'github'],
  showEmailPassword = true,
  redirectTo = '/dashboard',
  showRememberMe = false,
  showForgotPassword = false,
  forgotPasswordUrl = '/forgot-password',
  onSuccess,
  onError,
  className,
}: AuthCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      // Redirect to OAuth provider
      window.location.href = `/api/auth/sign-in/social?provider=${provider}&redirect=${encodeURIComponent(redirectTo)}`;
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(`${provider} authentication failed`));
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      onError?.(new Error('Please fill in all fields'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, simulate success
      const user = { 
        id: '1', 
        email, 
        name: email.split('@')[0] 
      };
      
      onSuccess?.(user);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Authentication failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Social Providers */}
      {providers && providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => handleSocialAuth(provider)}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center">
                {provider === 'google' && (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {provider === 'github' && (
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
                Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </div>
              {isLoading && (
                <svg className="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      {providers && providers.length > 0 && showEmailPassword && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>
      )}

      {/* Email/Password Form */}
      {showEmailPassword && (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          {(showRememberMe || showForgotPassword) && (
            <div className="flex items-center justify-between">
              {showRememberMe && (
                <label className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
              )}
              {showForgotPassword && (
                <a href={forgotPasswordUrl} className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </div>
            ) : (
              mode === 'signup' ? 'Create account' : 'Sign in'
            )}
          </button>
        </form>
      )}

      {/* Sign up/in link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <a href="/sign-in" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="/sign-up" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up here
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}