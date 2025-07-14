/**
 * UpdateNameCard Component
 * Allows users to update their display name
 */

import React from 'react';
import { UpdateNameCard as BetterAuthUpdateNameCard } from '@daveyplate/better-auth-ui';

interface UpdateNameCardProps {
  className?: string;
}

export function UpdateNameCard({ className }: UpdateNameCardProps) {

  return (
    <BetterAuthUpdateNameCard
      className={className}
    />
  );
}