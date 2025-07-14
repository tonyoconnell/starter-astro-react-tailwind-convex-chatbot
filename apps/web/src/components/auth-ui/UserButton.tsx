/**
 * UserButton Component
 * Advanced user menu with account management using Better Auth UI
 */

import React from 'react';
import { UserButton as BetterAuthUserButton } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user } from '@starter/lib/auth';

interface UserButtonProps {
  showName?: boolean;
  showEmail?: boolean;
  menuItems?: Array<{
    label: string;
    href?: string;
    action?: 'signout' | string;
    type?: 'separator';
  }>;
  className?: string;
}

export function UserButton({
  showName = true,
  showEmail = true,
  menuItems = [
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
    { label: 'API Keys', href: '/settings/api-keys' },
    { type: 'separator' },
    { label: 'Sign Out', action: 'signout' },
  ],
  className,
}: UserButtonProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  return (
    <BetterAuthUserButton
      user={user}
      showName={showName}
      showEmail={showEmail}
      menuItems={menuItems}
      className={className}
      // Additional Better Auth UI props
      avatarFallback={user.name?.charAt(0).toUpperCase() || '?'}
      signOutRedirect="/"
    />
  );
}