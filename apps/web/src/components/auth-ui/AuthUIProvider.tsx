/**
 * AuthUIProvider Component
 * Provides authentication configuration and context
 */

import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// Simplified config without external dependencies
interface AuthUIConfig {
  theme: {
    colorScheme: 'auto' | 'light' | 'dark';
    primaryColor: string;
    radius: string;
  };
  features: {
    socialProviders: string[];
    emailAndPassword: boolean;
    twoFactor: boolean;
    passkeys: boolean;
    organizations: boolean;
    apiKeys: boolean;
  };
  toast: {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration: number;
  };
}

const defaultConfig: AuthUIConfig = {
  theme: {
    colorScheme: 'auto',
    primaryColor: 'blue',
    radius: 'md',
  },
  features: {
    socialProviders: ['google', 'github'],
    emailAndPassword: true,
    twoFactor: false,
    passkeys: false,
    organizations: false,
    apiKeys: false,
  },
  toast: {
    position: 'top-right',
    duration: 5000,
  },
};

interface AuthUIContextValue {
  config: AuthUIConfig;
}

const AuthUIContext = createContext<AuthUIContextValue | undefined>(undefined);

interface AuthUIProviderProps {
  children: ReactNode;
  config?: Partial<AuthUIConfig>;
}

export function AuthUIProvider({ children, config }: AuthUIProviderProps) {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    theme: { ...defaultConfig.theme, ...config?.theme },
    features: { ...defaultConfig.features, ...config?.features },
    toast: { ...defaultConfig.toast, ...config?.toast },
  };

  return (
    <AuthUIContext.Provider value={{ config: mergedConfig }}>
      {children}
    </AuthUIContext.Provider>
  );
}

export function useAuthUIConfig() {
  const context = useContext(AuthUIContext);
  if (!context) {
    return defaultConfig; // Return default config if no provider
  }
  return context.config;
}