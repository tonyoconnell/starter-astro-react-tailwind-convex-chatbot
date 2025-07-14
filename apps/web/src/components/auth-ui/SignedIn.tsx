/**
 * SignedIn Component
 * Conditionally renders children only when user is authenticated
 */

import React from 'react';
import type { ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { $isAuthenticated } from '@starter/lib/auth';

interface SignedInProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function SignedIn({ children, fallback = null }: SignedInProps) {
  const isAuthenticated = useStore($isAuthenticated);

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}