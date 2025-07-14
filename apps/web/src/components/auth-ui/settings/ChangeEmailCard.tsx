/**
 * ChangeEmailCard Component
 * Allows users to change their email address with verification
 */

import React from 'react';
import { ChangeEmailCard as BetterAuthChangeEmailCard } from '@daveyplate/better-auth-ui';

interface ChangeEmailCardProps {
  className?: string;
}

export function ChangeEmailCard({ className }: ChangeEmailCardProps) {

  return (
    <BetterAuthChangeEmailCard
      className={className}
    />
  );
}