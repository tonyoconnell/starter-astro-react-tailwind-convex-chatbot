/**
 * ChangePasswordCard Component
 * Allows users to change their password with strength indicator
 */

import React from 'react';
import { ChangePasswordCard as BetterAuthChangePasswordCard } from '@daveyplate/better-auth-ui';
import { notificationActions } from '@starter/lib/auth';

interface ChangePasswordCardProps {
  className?: string;
}

export function ChangePasswordCard({ className }: ChangePasswordCardProps) {
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      // API call would go here
      notificationActions.success(
        'Password Updated',
        'Your password has been successfully changed.'
      );
    } catch (error) {
      notificationActions.error(
        'Password Change Failed',
        error instanceof Error ? error.message : 'Failed to update password'
      );
    }
  };

  return (
    <BetterAuthChangePasswordCard
      onPasswordChange={handlePasswordChange}
      className={className}
      // Additional props
      showStrengthIndicator
      minLength={8}
      requireUppercase
      requireLowercase
      requireNumbers
      requireSpecialChars
    />
  );
}