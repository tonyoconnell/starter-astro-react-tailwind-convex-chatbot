/**
 * ChangeEmailCard Component
 * Allows users to change their email address with verification
 */

import React from 'react';
import { ChangeEmailCard as BetterAuthChangeEmailCard } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user, notificationActions } from '@starter/lib/auth';

interface ChangeEmailCardProps {
  className?: string;
}

export function ChangeEmailCard({ className }: ChangeEmailCardProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const handleEmailChange = async (newEmail: string) => {
    try {
      // API call would go here
      notificationActions.info(
        'Verification Email Sent',
        `Please check ${newEmail} to verify your new email address.`
      );
    } catch (error) {
      notificationActions.error(
        'Email Change Failed',
        error instanceof Error ? error.message : 'Failed to update email'
      );
    }
  };

  return (
    <BetterAuthChangeEmailCard
      currentEmail={user.email || ''}
      onEmailChange={handleEmailChange}
      className={className}
      // Additional props
      requirePassword
      sendVerificationEmail
    />
  );
}