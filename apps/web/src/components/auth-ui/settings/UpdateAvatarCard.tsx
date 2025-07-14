/**
 * UpdateAvatarCard Component
 * Allows users to upload and manage their avatar with image cropping
 */

import React from 'react';
import { UpdateAvatarCard as BetterAuthUpdateAvatarCard } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user, notificationActions } from '@starter/lib/auth';

interface UpdateAvatarCardProps {
  className?: string;
}

export function UpdateAvatarCard({ className }: UpdateAvatarCardProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const handleAvatarUpload = async (file: File) => {
    try {
      // In production, this would upload to a service like Cloudinary
      const formData = new FormData();
      formData.append('avatar', file);
      
      // API call would go here
      notificationActions.success(
        'Avatar Updated',
        'Your profile picture has been successfully updated.'
      );
    } catch (error) {
      notificationActions.error(
        'Avatar Upload Failed',
        error instanceof Error ? error.message : 'Failed to upload avatar'
      );
    }
  };

  return (
    <BetterAuthUpdateAvatarCard
      currentAvatar={user.image}
      onAvatarUpload={handleAvatarUpload}
      className={className}
      // Additional props
      maxSizeMB={5}
      acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
      enableCropping
      cropAspectRatio={1}
    />
  );
}