import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Add custom matchers for better assertions
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
  value: () => true,
  writable: true,
});

// Mock console methods to avoid noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = (...args: any[]) => {
    // Ignore React warnings about missing props
    if (args[0]?.includes?.('Warning:')) {
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    // Ignore React warnings
    if (args[0]?.includes?.('Warning:')) {
      return;
    }
    originalWarn.apply(console, args);
  };
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});