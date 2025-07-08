# Technology Stack Specification

## Overview

This document serves as the single source of truth for all technology choices, version constraints, and integration requirements for the AI-Accelerated Starter Template project.

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | `~5.4` | Primary language for type-safety | Strict mode ensures code quality and robustness. |
| **Frontend Framework** | Astro | `~4.5` | Content-rich sites with React islands | Excellent performance (MPA) with component-based interactivity. |
| **UI Framework** | React | `~18.2` | Interactive UI components (islands) | The standard for interactive UI, works seamlessly with Astro. |
| **UI Component Lib** | ShadCN + Radix UI | `latest` | Headless UI components | Provides accessible, unstyled primitives for a custom design. |
| **CSS Framework** | TailwindCSS | `~3.4` | Utility-first CSS styling | Rapidly builds modern designs without leaving HTML. |
| **State Management**| NanoStores | `latest` | Lightweight, shared state | Simple and effective for Astro's island architecture. |
| **Backend Platform**| Convex | `~1.11` | Backend logic, DB, and functions | Unified platform simplifies backend dev, offers real-time. [ESLint Config](https://docs.convex.dev/eslint) |
| **API Style** | Convex Functions | `~1.11` | Queries, Mutations, Actions | Type-safe, serverless functions co-located with the schema. |
| **Database** | Convex DB | `~1.11` | Real-time document database | Integrated, transactional, and provides real-time updates. |
| **File Storage** | Cloudflare R2 | `N/A` | S3-compatible object storage | Seamless and cost-effective integration with the Cloudflare ecosystem. |
| **Authentication** | BetterAuth | `TBD` | User authentication & management | Chosen solution, pending final due diligence during implementation. [Astro Integration](https://www.better-auth.com/docs/integrations/astro) |
| **Unit/Integration Testing** | Vitest | `~1.4` | Test runner for FE and BE | Fast, modern test framework that works well with Vite/Astro/Convex. |
| **E2E Testing** | Playwright | `~1.42` | End-to-end browser testing | Recommended for its modern features, reliability, and tracing. |
| **Build Tool** | Astro CLI / Vite | `~5.2` | Building, bundling, and dev server | Native tooling for the Astro framework. |
| **IaC / Deployment** | Wrangler CLI | `~3.47`| Infrastructure-as-Code for CF | Native tool for managing and deploying to the Cloudflare ecosystem. |
| **CI/CD** | GitHub Actions | `N/A` | Automated build, test, deploy | Integrates directly with the project repository for automation. |
| **Monitoring** | PostHog / Sentry | `latest` | Product analytics & error tracking | A powerful combination for user behavior and issue diagnosis. |
| **Logging** | Logflare | `latest` | Centralized log management | Chosen for its ability to aggregate logs from various sources. |

## Development Environment Requirements

### Required Tools
- **Bun**: `>=1.0.0` - Primary runtime and package manager
- **Node.js**: `>=20.0.0` - Fallback runtime for tools that require it
- **Git**: `>=2.40.0` - Version control
- **VS Code**: Recommended editor with extensions

### Recommended VS Code Extensions
- **Astro**: Official Astro language support
- **TypeScript**: Enhanced TypeScript development
- **Tailwind CSS IntelliSense**: Tailwind class autocompletion
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Convex**: Convex development tools

## Critical Version Constraints

### Pinned Versions (Do Not Upgrade Without Testing)
- **TailwindCSS**: `~3.4` - v4.x has compatibility issues with Astro integrations
- **TypeScript**: `~5.4` - Latest stable with strict mode features
- **Convex**: `~1.11` - Required for stable real-time functionality

### Flexible Versions (Safe to Update)
- **React**: `~18.2` or newer within v18.x
- **Astro**: `~4.5` or newer within v4.x
- **Vitest**: `~1.4` or newer
- **Playwright**: `~1.42` or newer

## Integration Requirements

### Frontend-Backend Type Safety
- Convex automatically generates TypeScript types for frontend consumption
- All API calls must use generated Convex client types
- Shared types defined in `packages/lib/src/types/`

### Build System Integration
- Turborepo orchestrates builds across all packages
- Shared configurations in `packages/config/`
- Hot reloading works across frontend and backend

### Testing Integration
- Vitest for unit and integration tests
- Playwright for end-to-end browser testing
- Shared test utilities in `packages/lib/src/test-utils/`

## Development Commands

### Installation
```bash
bun install                    # Install all dependencies
```

### Development
```bash
bun dev                       # Start all development servers
cd apps/web && bun dev        # Start only frontend
bunx convex dev              # Start only backend
```

### Testing
```bash
bun test                     # Run all unit/integration tests
bun test:e2e                 # Run end-to-end tests
bun test:watch               # Run tests in watch mode
```

### Building
```bash
bun build                    # Build all packages
cd apps/web && bun build     # Build only frontend
bunx convex deploy          # Deploy backend
```

### Linting & Formatting
```bash
bun lint                     # Run ESLint across all packages
bun format                   # Run Prettier formatting
bun typecheck               # Run TypeScript type checking
```
