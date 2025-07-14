/**
 * UpdateUsernameCard Component
 * Allows users to change their username with availability check
 */

import React from 'react';
import { UpdateUsernameCard as BetterAuthUpdateUsernameCard } from '@daveyplate/better-auth-ui';
import { useStore } from '@nanostores/react';
import { $user, notificationActions } from '@starter/lib/auth';

interface UpdateUsernameCardProps {
  className?: string;
}

export function UpdateUsernameCard({ className }: UpdateUsernameCardProps) {
  const user = useStore($user);

  if (!user) {
    return null;
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    // API call to check username availability
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo, some usernames are taken
    const takenUsernames = ['admin', 'root', 'test', 'user'];
    return !takenUsernames.includes(username.toLowerCase());
  };

  const handleUsernameChange = async (newUsername: string) => {
    try {
      // API call would go here
      notificationActions.success(
        'Username Updated',
        `Your username has been changed to @${newUsername}.`
      );
    } catch (error) {
      notificationActions.error(
        'Username Change Failed',
        error instanceof Error ? error.message : 'Failed to update username'
      );
    }
  };

  return (
    <BetterAuthUpdateUsernameCard
      currentUsername={user.username || ''}
      onUsernameChange={handleUsernameChange}
      checkAvailability={checkUsernameAvailability}
      className={className}
      // Additional props
      minLength={3}
      maxLength={20}
      pattern="^[a-zA-Z0-9_]+$"
      debounceMs={300}
    />
  );
}