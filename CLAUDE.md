# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-Accelerated Starter Template designed for building conversational and agent-based applications. The project is currently in the planning/architecture phase using the BMAD (Build Me An App, Dave) Method.

### Technology Stack (Planned)

- **Frontend**: Astro (~4.5) with React (~18.2) islands
- **Styling**: TailwindCSS (~3.4) with ShadCN + Radix UI
- **Backend**: Convex (~1.11) for serverless functions and real-time database
- **Language**: TypeScript (~5.4) in strict mode
- **Runtime**: Bun
- **Deployment**: Cloudflare (Pages for frontend, Workers for serverless)
- **Testing**: Vitest for unit/integration, Playwright for E2E

## Development Commands

> Note: The project hasn't been implemented yet. These are the expected commands based on the architecture document:

```bash
# Install dependencies (using Bun)
bun install

# Start development servers
bun dev              # Start Astro dev server
bunx convex dev      # Start Convex backend

# Run tests
bun test             # Run unit tests with Vitest
bun test:e2e         # Run E2E tests with Playwright

# Build for production
bun build            # Build Astro frontend
bunx convex deploy   # Deploy Convex backend

# Deploy to Cloudflare
bunx wrangler pages deploy dist/  # Deploy frontend to Cloudflare Pages
```

## High-Level Architecture

### Monorepo Structure (using Turborepo)

```
ai-starter-template/
├── apps/
│   └── web/                # Astro frontend application
├── packages/
│   ├── config/             # Shared configurations
│   ├── lib/                # Shared utilities & types
│   └── ui/                 # Shared React UI components
├── convex/                 # Convex backend
│   ├── schema.ts           # Database schema
│   └── functions/          # Serverless functions
├── docs/                   # Context engineering docs
└── e2e/                    # End-to-end tests
```

### Key Architectural Patterns

1. **Islands Architecture**: Static content with Astro, interactive components with React islands
2. **Serverless Backend**: Convex functions for queries, mutations, and actions
3. **Real-time Database**: Convex DB with automatic reactivity
4. **Type-Safe API**: End-to-end TypeScript with shared types between frontend and backend

### Database Schema (Convex)

The application uses BetterAuth for authentication and includes these core tables:
- `users`: User accounts managed by BetterAuth
- `chats`: Chat sessions/conversations
- `messages`: Individual messages with multi-part content support
- `chat_attachments`: File attachments for conversations

### Core Workflows

1. **Authentication Flow**: Sign-up → Login → Protected routes
2. **Chat Interface**: Real-time messaging with LLM integration
3. **In-App Code Generation**: Claude Code SDK integration for generating code artifacts

## BMAD Method Framework

This project uses the BMAD (Breakthrough Method of Agile AI-driven Development) - a comprehensive framework for AI-driven development.

### BMAD Directory Structure

```
.bmad-core/                 # BMAD framework files
├── agents/                 # Agent persona definitions
├── tasks/                  # Executable task instructions
├── templates/              # Document templates (PRD, Architecture, etc.)
├── workflows/              # Project workflow definitions
├── checklists/             # Quality assurance checklists
├── data/                   # Knowledge base and preferences
└── agent-teams/            # Pre-configured agent teams

.claude/                    # Claude Code specific wrappers
└── commands/              # Agent command files for Claude
```

### BMAD Agents

**Core Development Team:**
- **`/analyst`** - Alex: Market research, requirements gathering
- **`/pm`** - Paula: Product Manager for PRDs and features
- **`/architect`** - Winston: System design and architecture
- **`/dev`** - James: Code implementation (lean, focused)
- **`/qa`** - Quinn: Testing and code review
- **`/ux-expert`** - Ava: UI/UX design and prototypes
- **`/po`** - Olivia: Product Owner for backlog management
- **`/sm`** - Bob: Scrum Master for story creation

**Meta Agents:**
- **`/bmad-master`** - Universal executor with all capabilities
- **`/bmad-orchestrator`** - Coordinates multi-agent workflows

### Using BMAD Agents in Claude Code

In Claude Code, activate agents using the `/` command:

```bash
/sm          # Activate Scrum Master Bob
/dev         # Activate Developer James
/architect   # Activate Architect Winston
```

Each agent will:
1. Greet you with their name and role
2. Load their specific context and rules
3. Offer their specialized commands (use `*help` to see them)
4. Stay in character until you use `*exit`

### BMAD Development Workflow

**Phase 1: Planning (Recommended in Web UI for cost efficiency)**
1. Use `/pm` to create Product Requirements Document (PRD)
2. Use `/architect` to create Architecture document
3. Shard documents into manageable pieces

**Phase 2: Development (In Claude Code IDE)**
1. `/sm` creates next story from sharded docs
2. Review and approve story
3. `/dev` implements approved story
4. `/qa` reviews and refactors code
5. Repeat until epic complete

### Key BMAD Principles

- **Document-Driven**: All development flows from PRD and Architecture docs
- **Clean Context Windows**: New chat for each agent = better performance
- **Sequential Stories**: One story at a time, manageable complexity
- **Specialized Agents**: Each agent masters one role
- **Human Oversight**: You validate each step

### Current Project Status

- ✅ Project Brief completed (docs/project-brief.md)
- ✅ Architecture document completed (docs/architecture.md)
- ⏳ Ready for Scrum Master (`/sm`) to create first stories

### Next Steps with BMAD

1. Use `/sm` to create the first story from the architecture
2. Review the story for accuracy and completeness
3. Use `/dev` to implement the approved story
4. Use `/qa` to review the implementation
5. Continue the cycle for each story

## Development Guidelines

### AI Pair Programming Workflow
This template is designed for "Context Engineer + AI Coder" collaboration:
- Rich contextual documentation for AI agents
- Best practice templates for all artifacts
- Structured approach using BMAD agents

### Testing Strategy
- Unit tests co-located with code
- Backend tests in `convex/tests/`
- E2E tests in root `e2e/` folder
- AI agent for test coverage enhancement

### Error Handling
- **Production**: Sentry → n8n → GitHub Issues with AI triage
- **Local Dev**: Errors piped to local Bun server → Claude Code SDK analysis

### Deployment
- Frontend: Cloudflare Pages via GitHub Actions
- Backend: Convex automatic deployment
- Environment-specific configurations for dev/staging/production

## Authentication Setup (BetterAuth + Astro)

### Important: Environment Variables in Astro

**Key Learning**: Astro looks for `.env` files in the app directory, not the monorepo root!

1. **Environment File Location**: 
   - Astro expects `.env` in `apps/web/.env`, NOT in the root directory
   - If you have a root `.env`, copy it: `cp .env apps/web/.env`

2. **Accessing Environment Variables**:
   - Server-side: Use `import.meta.env.VARIABLE_NAME` (not `process.env`)
   - All env vars are available server-side (not just PUBLIC_ prefixed ones)
   - Client-side: Only `PUBLIC_` prefixed variables are accessible

3. **TypeScript Support**:
   - Create `apps/web/src/env.d.ts` for type definitions:
   ```typescript
   interface ImportMetaEnv {
     readonly GOOGLE_CLIENT_ID: string;
     readonly GOOGLE_CLIENT_SECRET: string;
     readonly GITHUB_CLIENT_ID: string;
     readonly GITHUB_CLIENT_SECRET: string;
     readonly BETTER_AUTH_URL: string;
     readonly BETTER_AUTH_SECRET: string;
   }
   ```

4. **BetterAuth Configuration**:
   - Initialize BetterAuth directly in API routes using `import.meta.env`
   - Don't use helper functions that check `process.env` - they won't work
   - Always include redirect URIs in OAuth provider configuration

5. **Common Issues & Solutions**:
   - **Empty OAuth client_id**: Environment variables not loaded → Check `.env` location
   - **500 errors on auth endpoints**: Missing env vars → Copy `.env` to `apps/web/`
   - **Middleware errors**: Don't import heavy auth configs in middleware
   - **Dev server restart**: Required after adding/changing `.env` files

## BMAD Configuration

The project's BMAD configuration is in `.bmad-core/core-config.yaml`. Key settings:
- Document locations (PRD, Architecture)
- Version preferences (v3 vs v4 formats)
- Developer context files
- Sharding preferences