# Coding Standards & Development Guidelines

## Overview

This document establishes the coding standards, development practices, and quality guidelines for the AI-Accelerated Starter Template project. These standards ensure consistency, maintainability, and quality across the entire codebase.

## Critical Fullstack Rules

### 1. TypeScript Strict Mode
- **Required**: All TypeScript must use strict mode configuration
- **No `any` types**: Use proper typing or `unknown` with type guards
- **Interface over Type**: Prefer interfaces for object shapes, types for unions/primitives
- **Export types explicitly**: Always export types that are used across packages

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email?: string;
}

// ❌ Bad  
type UserProfile = {
  id: any;
  name: string;
}
```

### 2. Import/Export Conventions
- **Absolute imports**: Use workspace aliases where possible
- **Barrel exports**: Use index.ts files for clean package exports
- **Named exports**: Prefer named exports over default exports
- **Import organization**: External packages → Internal packages → Relative imports

```typescript
// ✅ Good
import { Button } from '@starter/ui';
import { validateEmail } from '@starter/lib';
import { UserProfile } from './types';

// ❌ Bad
import Button from '../../../packages/ui/src/Button';
```

### 3. Component Architecture (React/Astro)
- **Astro for pages**: Use .astro files for page components and layouts
- **React for islands**: Use React components for interactive functionality
- **Props validation**: Always define and validate props with TypeScript
- **Component composition**: Favor composition over inheritance

```astro
---
// ✅ Good Astro component
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<Layout title={title}>
  <ChatInterface client:load />
</Layout>
```

### 4. Database & API Patterns
- **Schema-first**: Define Convex schema before implementing functions
- **Type-safe queries**: Use generated Convex types throughout
- **Error boundaries**: Implement proper error handling for all API calls
- **Validation**: Validate all inputs at API boundaries

```typescript
// ✅ Good Convex function
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: {
    title: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, { title, model }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");
    
    return await ctx.db.insert("chats", {
      userId: user._id,
      title,
      model,
    });
  },
});
```

## Naming Conventions

### Files and Directories
- **kebab-case**: Use for file and directory names
- **PascalCase**: Use for React/Astro component files
- **camelCase**: Use for utility functions and non-component files

```
✅ Good
components/ChatInterface.tsx
utils/validateEmail.ts
hooks/use-chat-state.ts

❌ Bad  
components/chatInterface.tsx
utils/validate_email.ts
hooks/useChatState.ts
```

### Variables and Functions
- **camelCase**: Variables, functions, and methods
- **PascalCase**: Classes, interfaces, types, and components
- **SCREAMING_SNAKE_CASE**: Constants and environment variables
- **Descriptive names**: Avoid abbreviations, use clear descriptive names

```typescript
// ✅ Good
const userAuthToken = getAuthToken();
const MAX_RETRY_ATTEMPTS = 3;
interface ChatMessage {
  content: string;
  timestamp: Date;
}

// ❌ Bad
const tkn = getAuth();
const maxRetry = 3;
interface Msg {
  txt: string;
  ts: Date;
}
```

### Database Schema
- **snake_case**: Table and field names in Convex schema
- **Descriptive names**: Use clear, unambiguous names
- **Consistent patterns**: Follow established patterns for similar entities

```typescript
// ✅ Good
const messages = defineTable({
  chat_id: v.id("chats"),
  user_id: v.optional(v.id("users")),
  created_at: v.number(),
  message_content: v.string(),
});

// ❌ Bad
const msgs = defineTable({
  chatId: v.id("chats"),
  userId: v.optional(v.id("users")),
  createdAt: v.number(),
  content: v.string(),
});
```

## Code Organization Patterns

### Package Structure
- **Monorepo packages**: Each package should have a clear, single responsibility
- **Public interfaces**: Export only what's needed by other packages
- **Internal organization**: Use clear directory structure within packages

```
packages/
├── ui/                 # React components
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks
│   │   └── index.ts    # Barrel exports
├── lib/                # Shared utilities
│   ├── src/
│   │   ├── utils/      # Pure utility functions
│   │   ├── types/      # Shared TypeScript types
│   │   └── index.ts    # Barrel exports
└── config/             # Shared configurations
    ├── eslint.config.js
    ├── tsconfig.json
    └── tailwind.config.js
```

### Function Organization
- **Single Responsibility**: Each function should have one clear purpose
- **Pure functions**: Prefer pure functions where possible
- **Error handling**: Handle errors gracefully with proper types
- **Documentation**: Use JSDoc for complex functions

```typescript
/**
 * Validates and normalizes an email address
 * @param email - The email string to validate
 * @returns Normalized email or throws validation error
 */
export function validateAndNormalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }
  
  const normalized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(normalized)) {
    throw new Error('Invalid email format');
  }
  
  return normalized;
}
```

## Quality Assurance Standards

### Testing Requirements
- **Unit tests**: All utility functions and business logic must have unit tests
- **Component tests**: Interactive components must have render and interaction tests
- **Integration tests**: API functions must have integration tests
- **E2E tests**: Critical user flows must have end-to-end tests

```typescript
// ✅ Good test structure
import { describe, it, expect } from 'vitest';
import { validateAndNormalizeEmail } from './email-utils';

describe('validateAndNormalizeEmail', () => {
  it('should normalize valid email addresses', () => {
    const result = validateAndNormalizeEmail('  USER@EXAMPLE.COM  ');
    expect(result).toBe('user@example.com');
  });

  it('should throw error for invalid email format', () => {
    expect(() => validateAndNormalizeEmail('invalid-email')).toThrow('Invalid email format');
  });
});
```

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling implemented
- [ ] Tests cover new functionality
- [ ] Documentation updated if needed
- [ ] No console.log statements in production code
- [ ] Performance implications considered
- [ ] Security best practices followed

### Performance Guidelines
- **Bundle size**: Monitor and minimize JavaScript bundle size
- **Database queries**: Optimize Convex queries with proper indexes
- **Image optimization**: Use appropriate formats and sizes
- **Caching**: Implement appropriate caching strategies

```typescript
// ✅ Good - Optimized query with index
const getUserChats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
```

## Security Standards

### Authentication & Authorization
- **Token validation**: Always validate authentication tokens
- **User context**: Verify user permissions for all operations
- **Input sanitization**: Sanitize all user inputs
- **HTTPS only**: All communications must use HTTPS

### Data Handling
- **No sensitive data in logs**: Never log passwords, tokens, or sensitive user data
- **Environment variables**: Use environment variables for all secrets
- **Data validation**: Validate all data at system boundaries
- **Secure headers**: Implement appropriate security headers

```typescript
// ✅ Good - Secure user data handling
export const updateUserProfile = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, { name, email }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    // Validate and sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedEmail = email ? validateAndNormalizeEmail(email) : undefined;
    
    return await ctx.db.patch(user._id, {
      name: sanitizedName,
      email: sanitizedEmail,
    });
  },
});
```

## Documentation Standards

### Code Documentation
- **JSDoc comments**: Use for all public functions and complex logic
- **README files**: Each package must have a comprehensive README
- **Type documentation**: Document complex types and interfaces
- **Architecture decisions**: Document significant architectural choices

### API Documentation
- **Function signatures**: Document all Convex function parameters and return types
- **Error cases**: Document possible error conditions
- **Usage examples**: Provide clear usage examples
- **Version changes**: Document breaking changes and migrations

## Linting and Formatting

### ESLint Configuration
- **Strict rules**: Use strict ESLint rules for code quality
- **TypeScript integration**: Use @typescript-eslint for TypeScript-specific rules
- **React rules**: Use react and react-hooks plugins for React code
- **Custom rules**: Add project-specific rules as needed

### Prettier Configuration
- **Consistent formatting**: Use Prettier for automatic code formatting
- **Team settings**: Standardize formatting across all developers
- **Pre-commit hooks**: Automatically format code before commits

```json
// .eslintrc.js example
{
  "extends": [
    "@starter/eslint-config",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "no-console": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

## Version Control Standards

### Commit Message Format
- **Conventional commits**: Use conventional commit format
- **Clear descriptions**: Write descriptive commit messages
- **Scope clarity**: Include appropriate scope in commit messages

```
feat(auth): add user registration with email validation
fix(ui): resolve button hover state in dark mode
docs(readme): update installation instructions
test(api): add integration tests for chat functions
```

### Branch Strategy
- **Feature branches**: Create feature branches for all new work
- **Pull requests**: All changes must go through pull request review
- **Protected main**: Main branch should be protected and require reviews
- **Clean history**: Use squash merging for clean git history

## Environment-Specific Guidelines

### Development Environment
- **Local testing**: All features must work in local development
- **Hot reloading**: Ensure proper hot reloading for efficient development
- **Debug tools**: Use appropriate debugging tools and configurations
- **Error visibility**: Ensure errors are clearly visible during development

### Production Environment
- **Error handling**: Implement comprehensive error handling and logging
- **Performance monitoring**: Monitor application performance
- **Security scanning**: Regular security scans and updates
- **Backup strategies**: Implement appropriate backup and recovery procedures

This coding standards document serves as the foundation for maintaining code quality and consistency throughout the project lifecycle.