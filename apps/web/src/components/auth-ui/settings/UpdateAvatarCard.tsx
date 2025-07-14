/**
 * UpdateAvatarCard Component
 * Allows users to upload and manage their avatar with image cropping
 */

import React from 'react';
import { UpdateAvatarCard as BetterAuthUpdateAvatarCard } from '@daveyplate/better-auth-ui';

interface UpdateAvatarCardProps {
  className?: string;
}

export function UpdateAvatarCard({ className }: UpdateAvatarCardProps) {

  return (
    <BetterAuthUpdateAvatarCard
      className={className}
    />
  );
}