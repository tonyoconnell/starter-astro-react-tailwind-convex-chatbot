# Source Tree Structure & Organization

## Complete Project Structure

```plaintext
starter-astro-react-tailwind-convex-chatbot/
├── .bmad-core/                 # BMAD Framework Files
│   ├── agents/                 # Agent persona definitions
│   ├── tasks/                  # Executable task instructions
│   ├── templates/              # Document templates
│   ├── workflows/              # Project workflow definitions
│   ├── checklists/             # Quality assurance checklists
│   ├── data/                   # Knowledge base and preferences
│   └── core-config.yaml        # BMAD configuration
│
├── .claude/                    # Claude Code Integration
│   └── commands/               # Agent command files for Claude
│
├── .github/                    # GitHub Configuration
│   └── workflows/              # GitHub Actions CI/CD
│       └── deploy.yml          # Deployment workflow
│
├── apps/                       # Runnable Applications
│   └── web/                    # Astro Frontend Application
│       ├── public/             # Static assets
│       │   ├── favicon.svg
│       │   └── images/
│       ├── src/                # Source code
│       │   ├── components/     # Astro components
│       │   ├── layouts/        # Page layouts
│       │   ├── pages/          # Astro pages (routing)
│       │   ├── islands/        # React island components
│       │   ├── styles/         # Global styles
│       │   └── utils/          # App-specific utilities
│       ├── astro.config.mjs    # Astro configuration
│       ├── tailwind.config.js  # Tailwind configuration
│       ├── tsconfig.json       # TypeScript configuration
│       └── package.json        # App dependencies
│
├── packages/                   # Shared Code Packages
│   ├── config/                 # Shared Configurations
│   │   ├── eslint.config.js    # ESLint configuration
│   │   ├── tsconfig.json       # Base TypeScript config
│   │   ├── tailwind.config.js  # Base Tailwind config
│   │   └── package.json        # Config package definition
│   │
│   ├── lib/                    # Shared Utilities & Types
│   │   ├── src/
│   │   │   ├── types/          # Shared TypeScript types
│   │   │   ├── utils/          # Pure utility functions
│   │   │   ├── constants/      # Application constants
│   │   │   ├── validators/     # Data validation functions
│   │   │   └── index.ts        # Barrel exports
│   │   ├── tsconfig.json       # TypeScript configuration
│   │   └── package.json        # Library package definition
│   │
│   └── ui/                     # Shared React UI Components
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   └── Modal.tsx
│       │   ├── hooks/          # Custom React hooks
│       │   ├── styles/         # Component-specific styles
│       │   └── index.ts        # Component exports
│       ├── tsconfig.json       # TypeScript configuration
│       └── package.json        # UI package definition
│
├── convex/                     # Convex Backend
│   ├── functions/              # Serverless Functions
│   │   ├── queries/            # Read Operations
│   │   │   ├── users.ts        # User queries
│   │   │   ├── chats.ts        # Chat queries
│   │   │   └── messages.ts     # Message queries
│   │   ├── mutations/          # Write Operations
│   │   │   ├── users.ts        # User mutations
│   │   │   ├── chats.ts        # Chat mutations
│   │   │   └── messages.ts     # Message mutations
│   │   └── actions/            # External API Calls
│   │       ├── llm.ts          # LLM provider integration
│   │       └── auth.ts         # Authentication actions
│   ├── tests/                  # Backend Tests
│   │   ├── queries/            # Query tests
│   │   ├── mutations/          # Mutation tests
│   │   └── actions/            # Action tests
│   ├── schema.ts               # Database schema definition
│   ├── package.json            # Convex dependencies
│   └── README.md               # Backend documentation
│
├── docs/                       # Context Engineering Documentation
│   ├── architecture/           # Architecture Documentation
│   │   ├── coding-standards.md # Development standards and guidelines
│   │   ├── tech-stack.md       # Technology stack specification
│   │   ├── source-tree.md      # This file - project structure
│   │   ├── database-schema.md  # Database design documentation
│   │   └── testing-strategy.md # Testing approach and guidelines
│   ├── stories/                # Development Stories (BMAD)
│   │   ├── story-1.1-project-scaffolding.md
│   │   └── story-1.2-convex-backend-setup.md
│   ├── architecture.md         # Main architecture document
│   ├── project-brief.md        # Project overview and goals
│   └── workflow-plan.md        # Development workflow plan
│
├── e2e/                        # End-to-End Tests
│   ├── tests/                  # E2E test files
│   ├── fixtures/               # Test data and fixtures
│   ├── playwright.config.ts    # Playwright configuration
│   └── package.json            # E2E testing dependencies
│
├── .gitignore                  # Git ignore patterns
├── .env.example                # Environment variables template
├── bun.lock                    # Bun lockfile
├── package.json                # Root workspace configuration
├── turbo.json                  # Turborepo configuration
├── wrangler.toml               # Cloudflare deployment config
├── CLAUDE.md                   # Claude Code instructions
└── README.md                   # Project documentation
```

## Directory Responsibilities

### Root Level
- **Configuration files**: Project-wide settings and build configurations
- **Documentation**: High-level project documentation and setup instructions
- **Package management**: Workspace configuration and dependency management

### `.bmad-core/` - BMAD Framework
- **Agents**: AI agent persona definitions for specialized development roles
- **Tasks**: Reusable task instructions for automated development workflows  
- **Templates**: Document templates for PRDs, architecture docs, user stories
- **Workflows**: Project workflow definitions and process automation
- **Checklists**: Quality assurance and definition-of-done checklists

### `apps/web/` - Frontend Application
- **Components**: Astro components for static content and layouts
- **Islands**: React components for interactive functionality
- **Pages**: File-based routing with Astro page components
- **Styles**: Global CSS and styling configurations
- **Public**: Static assets served directly (images, fonts, etc.)

### `packages/` - Shared Code
- **`config/`**: Shared build and development configurations
- **`lib/`**: Pure utility functions, types, and business logic
- **`ui/`**: Reusable React components with consistent design system

### `convex/` - Backend Services
- **Functions**: Type-safe serverless functions for all backend operations
- **Schema**: Database schema definitions with relationships and indexes
- **Tests**: Comprehensive backend testing for all functions and workflows

### `docs/` - Documentation & Context Engineering
- **Architecture**: Technical documentation for developers and AI agents
- **Stories**: BMAD user stories for structured development workflow
- **Planning**: High-level project planning and architectural decisions

### `e2e/` - End-to-End Testing
- **Tests**: Full application workflow testing with real browser automation
- **Fixtures**: Test data and mock configurations for realistic testing scenarios

## File Organization Principles

### Naming Conventions
- **kebab-case**: Files and directories (except components)
- **PascalCase**: React/Astro component files
- **camelCase**: Utility functions and non-component TypeScript files
- **UPPERCASE**: Environment variables and constants

### Import/Export Patterns
- **Barrel exports**: Use `index.ts` files to create clean public APIs
- **Absolute imports**: Leverage workspace aliases for clean import paths
- **Consistent structure**: Maintain parallel structure across similar directories

### Code Organization
- **Feature-based**: Group related functionality together
- **Separation of concerns**: Clear boundaries between UI, business logic, and data
- **Reusability**: Promote code reuse through well-designed shared packages

## Development Workflow Integration

### Local Development
```bash
# Start all services
bun dev                    # Root: Starts web app and Convex

# Individual services  
cd apps/web && bun dev     # Astro dev server
bunx convex dev           # Convex backend development

# Testing
bun test                  # Run all unit/integration tests
bun test:e2e             # Run end-to-end tests
```

### Build Process
```bash
# Build all packages
bun build                 # Turborepo orchestrated build

# Individual builds
cd apps/web && bun build  # Build web application
bunx convex deploy       # Deploy Convex backend
```

### Package Management
- **Bun workspaces**: Manages dependencies across all packages
- **Turborepo**: Optimizes builds with intelligent caching and parallelization
- **Shared dependencies**: Common dependencies managed at workspace root

## Deployment Structure

### Cloudflare Pages (Frontend)
- **Build output**: `apps/web/dist/` deployed to Cloudflare Pages
- **Static assets**: Optimized and served from global CDN
- **Environment variables**: Managed through Cloudflare dashboard

### Convex (Backend)
- **Functions**: Deployed to Convex cloud infrastructure
- **Database**: Managed Convex database with automatic scaling
- **Real-time**: WebSocket connections for live updates

### CI/CD Integration
- **GitHub Actions**: Automated testing and deployment pipeline
- **Build caching**: Turborepo cache integration for faster builds
- **Environment promotion**: Automated deployment to staging and production

## Security & Access Patterns

### Environment Configuration
- **`.env.local`**: Local development environment variables (not committed)
- **`.env.example`**: Template showing required environment variables
- **Secrets management**: Production secrets managed through deployment platforms

### Access Control
- **Package boundaries**: Clear separation between public and internal APIs
- **Type safety**: TypeScript enforcement across all package boundaries
- **Authentication**: Centralized auth handling through BetterAuth integration

## Future Expansion

### Scalability Considerations
- **Package addition**: New packages can be easily added to the workspace
- **Service separation**: Backend functions can be further modularized
- **Deployment scaling**: Architecture supports horizontal scaling needs

### Extension Points
- **Plugin system**: Architecture supports additional Astro and Vite plugins
- **Component library**: UI package can be published as standalone library
- **API expansion**: Convex functions can be extended with additional services

This source tree structure provides a solid foundation for scalable, maintainable full-stack development with clear separation of concerns and excellent developer experience.