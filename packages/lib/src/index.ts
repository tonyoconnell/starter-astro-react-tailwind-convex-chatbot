// Shared utilities and types for the AI Starter Template

export type User = {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
};

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