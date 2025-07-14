/**
 * AuthLoading Component
 * Shows loading state while authentication status is being determined
 */

import React from 'react';
import type { ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoading } from '@starter/lib/auth';

interface AuthLoadingProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

export function AuthLoading({ children, fallback }: AuthLoadingProps) {
  const isLoading = useStore($isLoading);

  if (isLoading) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}