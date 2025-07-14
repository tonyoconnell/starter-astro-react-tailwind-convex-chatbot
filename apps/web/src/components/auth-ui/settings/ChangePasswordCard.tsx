/**
 * ChangePasswordCard Component
 * Allows users to change their password with strength indicator
 */

import React from 'react';
import { ChangePasswordCard as BetterAuthChangePasswordCard } from '@daveyplate/better-auth-ui';

interface ChangePasswordCardProps {
  className?: string;
}

export function ChangePasswordCard({ className }: ChangePasswordCardProps) {

  return (
    <BetterAuthChangePasswordCard
      className={className}
    />
  );
}