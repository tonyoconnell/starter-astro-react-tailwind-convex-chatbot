/**
 * DeleteAccountCard Component
 * Allows users to delete their account with multi-step confirmation
 */

import React from 'react';
import { DeleteAccountCard as BetterAuthDeleteAccountCard } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user, notificationActions } from '@starter/lib/auth';

interface DeleteAccountCardProps {
  className?: string;
}

export function DeleteAccountCard({ className }: DeleteAccountCardProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const handleAccountDeletion = async (confirmationText: string) => {
    try {
      // API call would go here
      notificationActions.warning(
        'Account Scheduled for Deletion',
        'Your account will be permanently deleted in 30 days. You can cancel this within the grace period.'
      );
      
      // In production, this would sign out and redirect
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      notificationActions.error(
        'Account Deletion Failed',
        error instanceof Error ? error.message : 'Failed to delete account'
      );
    }
  };

  return (
    <BetterAuthDeleteAccountCard
      onAccountDelete={handleAccountDeletion}
      className={className}
      // Additional props
      requirePassword
      confirmationText="DELETE MY ACCOUNT"
      gracePeriodDays={30}
      showDataExportOption
      warningMessage="This action cannot be undone. All your data will be permanently deleted."
    />
  );
}