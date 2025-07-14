/**
 * DeleteAccountCard Component
 * Allows users to delete their account with multi-step confirmation
 */

import React from 'react';
import { DeleteAccountCard as BetterAuthDeleteAccountCard } from '@daveyplate/better-auth-ui';

interface DeleteAccountCardProps {
  className?: string;
}

export function DeleteAccountCard({ className }: DeleteAccountCardProps) {

  return (
    <BetterAuthDeleteAccountCard
      className={className}
    />
  );
}