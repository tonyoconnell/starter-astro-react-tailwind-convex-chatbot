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
  editable = false,
  onUpload,
  className,
}: UserAvatarProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return (
    <BetterAuthUserAvatar
      user={user}
      size={sizeMap[size]}
      editable={editable}
      onUpload={onUpload}
      className={className}
      // Additional Better Auth UI props
      fallback={user.name?.charAt(0).toUpperCase() || '?'}
      showUploadOnHover={editable}
    />
  );
}