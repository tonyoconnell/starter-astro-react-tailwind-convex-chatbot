/**
 * RedirectToSignUp Component
 * Redirects unauthenticated users to sign up page
 */

import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $isAuthenticated, $isLoading } from '@starter/lib/auth';

interface RedirectToSignUpProps {
  redirectUrl?: string;
}

export function RedirectToSignUp({ redirectUrl = '/signup' }: RedirectToSignUpProps) {
  const isAuthenticated = useStore($isAuthenticated);
  const isLoading = useStore($isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current URL to redirect back after signup
      const currentUrl = window.location.pathname + window.location.search;
      const redirectParam = currentUrl !== '/' ? `?redirect=${encodeURIComponent(currentUrl)}` : '';
      
      window.location.href = `${redirectUrl}${redirectParam}`;
    }
  }, [isAuthenticated, isLoading, redirectUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return null;
}