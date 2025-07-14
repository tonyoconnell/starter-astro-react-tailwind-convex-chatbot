/**
 * ForgotPasswordCard Component
 * Allows users to request a password reset email
 */

import React, { useState } from 'react';

interface ForgotPasswordCardProps {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function ForgotPasswordCard({ onSuccess, onError, className }: ForgotPasswordCardProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      onError?.(new Error('Please enter your email address'));
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just simulate success
      onSuccess?.(email);
      
      // Clear form
      setEmail('');
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to send reset email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
            required
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending email...
            </div>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          We'll send you a secure link to reset your password. Check your spam folder if you don't see it in your inbox.
        </p>
      </div>
    </div>
  );
}