/**
 * UpdateNameCard Component
 * Allows users to update their display name
 */

import React from 'react';
import { UpdateNameCard as BetterAuthUpdateNameCard } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user, notificationActions } from '@starter/lib/auth';

interface UpdateNameCardProps {
  className?: string;
}

export function UpdateNameCard({ className }: UpdateNameCardProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const handleNameChange = async (firstName: string, lastName: string) => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      // API call would go here
      notificationActions.success(
        'Name Updated',
        'Your display name has been successfully updated.'
      );
    } catch (error) {
      notificationActions.error(
        'Name Update Failed',
        error instanceof Error ? error.message : 'Failed to update name'
      );
    }
  };

  return (
    <BetterAuthUpdateNameCard
      currentName={user.name || ''}
      onNameChange={handleNameChange}
      className={className}
      // Additional props
      showFirstLastSeparately
      requireBothNames={false}
    />
  );
}