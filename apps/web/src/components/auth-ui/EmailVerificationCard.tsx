/**
 * EmailVerificationCard Component
 * Handles email verification and resend functionality
 */

import React, { useState, useEffect } from 'react';

interface EmailVerificationCardProps {
  email?: string;
  token?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onResendSuccess?: (email: string) => void;
  className?: string;
}

export function EmailVerificationCard({ 
  email = '', 
  token = '', 
  onSuccess, 
  onError, 
  onResendSuccess, 
  className 
}: EmailVerificationCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && verificationStatus === 'pending') {
      handleVerification();
    }
  }, [token]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerification = async () => {
    if (!token) {
      onError?.(new Error('Invalid verification link'));
      setVerificationStatus('error');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just simulate success
      setVerificationStatus('success');
      onSuccess?.();
    } catch (error) {
      setVerificationStatus('error');
      onError?.(error instanceof Error ? error : new Error('Verification failed'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      onError?.(new Error('No email address provided'));
      return;
    }

    setIsResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set cooldown (60 seconds)
      setResendCooldown(60);
      onResendSuccess?.(email);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to resend email'));
    } finally {
      setIsResending(false);
    }
  };

  if (verificationStatus === 'success') {
    return (
      <div className={`text-center space-y-4 ${className || ''}`}>
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Email Verified!</h3>
        <p className="text-gray-600">
          Your email has been successfully verified. You'll be redirected to your dashboard shortly.
        </p>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className={`text-center space-y-4 ${className || ''}`}>
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Verification Failed</h3>
        <p className="text-gray-600">
          The verification link is invalid or has expired. Please request a new verification email.
        </p>
        {email && (
          <button
            onClick={handleResendEmail}
            disabled={isResending || resendCooldown > 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {token ? (
        // Auto-verification in progress
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {isVerifying ? (
              <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isVerifying ? 'Verifying your email...' : 'Verifying Email'}
          </h3>
          <p className="text-gray-600">
            Please wait while we verify your email address.
          </p>
        </div>
      ) : (
        // Manual verification or resend
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Verify your email address</h3>
            {email && (
              <p className="text-gray-600">
                We sent a verification link to <strong>{email}</strong>
              </p>
            )}
            <p className="text-sm text-gray-500">
              Click the link in the email to verify your account. The link will expire in 24 hours.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or request a new one.
            </div>
            
            {email && (
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend verification email'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}