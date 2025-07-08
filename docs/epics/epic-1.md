# Epic 1: Foundation & Core Setup

**Goal:** To establish the complete, deployable project structure with all core tooling, a basic UI shell with theming, and a functioning CI/CD pipeline.

**Related Documents:**
* [[prd]] - Product Requirements Document
* [[architecture]] - Technical architecture specifications
* [[architecture/tech-stack]] - Technology stack details

## Stories

### Story 1.1: Project Scaffolding & Initial Deployment
**As a** Context Engineer, **I want** the basic monorepo structure with a 'Hello World' page and a working CI/CD pipeline, **so that** I can validate the end-to-end deployment process from day one.

**Status:** ✅ COMPLETED - See [[story-1.1-project-scaffolding]] for full implementation details.

*Acceptance Criteria:*
1. The project monorepo is initialized using Turborepo.
2. An `apps/web` package exists containing a minimal Astro application.
3. A `packages/` directory exists for future shared code.
4. A GitHub Actions workflow runs on push to `main` and successfully deploys the site to a Cloudflare Pages URL.

### Story 1.2: Core Backend Setup (Convex)
**As a** Context Engineer, **I want** the Convex backend initialized and connected to my frontend, **so that** the application has a live, real-time data layer.

**Status:** 🔄 IN PROGRESS - See [[story-1.2-convex-backend-setup]] for current status.

*Acceptance Criteria:*
1. The `convex/` directory is initialized.
2. The database schema from [[architecture/database-schema]] is implemented in `convex/schema.ts`.
3. The frontend application successfully connects to the Convex development server.

### Story 1.3: UI Foundation & Theming
**As a** Context Engineer, **I want** a basic UI component library and a light/dark theme toggle implemented, **so that** future features can be built with a consistent look.

**Status:** 📋 PLANNED - Authentication integration needed first.

*Acceptance Criteria:*
1. ShadCN and TailwindCSS are installed and configured.
2. A functional light/dark mode toggle is implemented.
3. At least two essential UI components (e.g., Button, Card) are created in the `packages/ui` directory.

**See [[story-1.3-authentication-integration]] for current authentication setup progress.**

### Story 1.4: Page Layouts & Protected Route Shell
**As a** Context Engineer, **I want** a basic public layout and a protected dashboard layout defined, **so that** I have a clear structure for public and private content.

*Acceptance Criteria:*
1. A main layout component is created in Astro with a simple header and footer.
2. A public home page (`/`) and a protected dashboard page (`/dashboard`) exist.
3. The dashboard page has a placeholder for authentication logic.

### Story 1.5: Local Observability Pipeline (Proof of Concept)
**As a** Context Engineer, **I want** client-side logs to be forwarded to my local Bun server, **so that** I can validate the real-time feedback loop.

*Acceptance Criteria:*
1. A local Bun server with a `/log` endpoint is created.
2. A utility in the frontend captures `console.log()` messages.
3. The captured messages are successfully sent to and displayed by the local Bun server.
