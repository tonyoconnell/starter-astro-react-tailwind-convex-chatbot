/**
 * UpdateUsernameCard Component
 * Allows users to change their username with availability check
 */

import React from 'react';
import { UpdateUsernameCard as BetterAuthUpdateUsernameCard } from '@daveyplate/better-auth-ui';

interface UpdateUsernameCardProps {
  className?: string;
}

export function UpdateUsernameCard({ className }: UpdateUsernameCardProps) {

  return (
    <BetterAuthUpdateUsernameCard
      className={className}
    />
  );
}