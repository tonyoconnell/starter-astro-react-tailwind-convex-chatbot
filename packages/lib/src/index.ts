// Shared utilities and types for the AI Starter Template

// Re-export auth types (User from auth will override this basic one)
export type { User } from "./auth/types";

// Re-export chat and message types
export * from "./types/chat";
export * from "./types/message";

// Re-export utilities
export * from "./utils/chat-helpers";
export * from "./utils/message-formatting";

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Re-export authentication utilities
export * from "./auth";