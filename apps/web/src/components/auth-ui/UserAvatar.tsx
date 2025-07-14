/**
 * UserAvatar Component
 * Avatar with upload and management capabilities using Better Auth UI
 */

import React from 'react';
import { UserAvatar as BetterAuthUserAvatar } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user } from '@starter/lib/auth';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (file: File) => Promise<void>;
  className?: string;
}

export function UserAvatar({
  size = 'md',
  className,
}: UserAvatarProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const sizeMap = {
    sm: 'sm' as const,
    md: 'default' as const,
    lg: 'lg' as const,
    xl: 'xl' as const,
  };

  return (
    <BetterAuthUserAvatar
      user={user}
      size={sizeMap[size]}
      className={className}
    />
  );
}