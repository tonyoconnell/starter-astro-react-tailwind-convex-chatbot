/**
 * SignedOut Component
 * Conditionally renders children only when user is not authenticated
 */

import React from 'react';
import type { ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { $isAuthenticated } from '@starter/lib/auth';

interface SignedOutProps {
  children: ReactNode;
}

export function SignedOut({ children }: SignedOutProps) {
  const isAuthenticated = useStore($isAuthenticated);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}