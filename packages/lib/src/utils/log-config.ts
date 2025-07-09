import type { LogForwarderConfig } from './log-forwarder';

/**
 * Default configuration for log forwarding
 */
export const DEFAULT_LOG_CONFIG: LogForwarderConfig = {
  serverUrl: 'http://localhost:5101/log',
  enabled: true,
  batchSize: 10,
  batchTimeout: 2000,
  maxRetries: 3,
  includeUserAgent: true,
  includeUrl: true,
  logLevels: ['log', 'info', 'warn', 'error', 'debug']
};

/**
 * Development configuration with more verbose logging
 */
export const DEV_LOG_CONFIG: Partial<LogForwarderConfig> = {
  enabled: true,
  batchSize: 5,
  batchTimeout: 1000,
  includeUserAgent: true,
  includeUrl: true,
  logLevels: ['log', 'info', 'warn', 'error', 'debug']
};

/**
 * Production configuration (disabled by default)
 */
export const PROD_LOG_CONFIG: Partial<LogForwarderConfig> = {
  enabled: false,
  batchSize: 20,
  batchTimeout: 5000,
  logLevels: ['warn', 'error']
};

/**
 * Testing configuration with minimal forwarding
 */
export const TEST_LOG_CONFIG: Partial<LogForwarderConfig> = {
  enabled: false,
  batchSize: 1,
  batchTimeout: 100,
  maxRetries: 1,
  includeUserAgent: false,
  includeUrl: false
};

/**
 * Get log configuration based on environment
 */
export function getLogConfig(environment?: string): Partial<LogForwarderConfig> {
  const env = environment || import.meta.env?.MODE || (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development';
  
  switch (env) {
    case 'development':
    case 'dev':
      return DEV_LOG_CONFIG;
    case 'production':
    case 'prod':
      return PROD_LOG_CONFIG;
    case 'test':
    case 'testing':
      return TEST_LOG_CONFIG;
    default:
      return DEV_LOG_CONFIG;
  }
}

/**
 * Check if log forwarding should be enabled based on environment
 */
export function shouldEnableLogForwarding(): boolean {
  // Check for explicit override first
  const override = import.meta.env?.VITE_ENABLE_LOG_FORWARDING || 
                  (typeof process !== 'undefined' && process.env?.ENABLE_LOG_FORWARDING);
  
  if (override !== undefined) {
    return override === 'true';
  }
  
  // For now, always enable in browser context during development
  if (typeof window !== 'undefined') {
    console.log('LogForwarder: Enabling for browser context');
    return true;
  }
  
  // Server-side checks
  const isDev = Boolean(import.meta.env?.DEV || 
                       (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
                       (typeof process !== 'undefined' && process.env?.NODE_ENV === 'dev'));
  
  return isDev;
}

/**
 * Get server URL for log forwarding
 */
export function getLogServerUrl(): string {
  return import.meta.env?.VITE_LOG_SERVER_URL || 
         (typeof process !== 'undefined' && process.env?.LOG_SERVER_URL) || 
         'http://localhost:5101/log';
}