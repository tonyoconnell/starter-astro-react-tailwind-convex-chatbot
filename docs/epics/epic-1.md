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

**Status:** ✅ COMPLETED - See [[story-1.2-convex-backend-setup]] for full implementation details.

*Acceptance Criteria:*
1. The `convex/` directory is initialized.
2. The database schema from [[architecture/database-schema]] is implemented in `convex/schema.ts`.
3. The frontend application successfully connects to the Convex development server.

### Story 1.3: Authentication Integration & User Management
**As a** Context Engineer, **I want** a complete authentication system using BetterAuth, **so that** users can sign up, log in, and access protected content with a solid foundation for the application.

**Status:** ✅ COMPLETED - See [[story-1.3-authentication-integration]] for full implementation details.

*Acceptance Criteria:*
1. BetterAuth library is fully integrated with OAuth providers
2. Users can sign up, log in, and log out with Google/GitHub
3. Protected routes are properly secured with authentication guards
4. User session management works correctly across page loads
5. ShadCN and TailwindCSS are installed and configured
6. UI components support both light and dark themes

### Story 1.4: Page Layouts & Protected Route Shell
**As a** Context Engineer, **I want** a basic public layout and a protected dashboard layout defined, **so that** I have a clear structure for public and private content.

**Status:** ✅ COMPLETED - See [[story-1.4-page-layouts-protected-routes]] for full implementation details.

*Acceptance Criteria:*
1. A main layout component is created in Astro with a simple header and footer.
2. A public home page (`/`) and a protected dashboard page (`/dashboard`) exist.
3. The dashboard page has a placeholder for authentication logic.

### Story 1.5: Local Observability Pipeline (Proof of Concept)
**As a** Context Engineer, **I want** client-side logs to be forwarded to my local Bun server, **so that** I can validate the real-time feedback loop.

**Status:** 📋 PLANNED - See [[story-1.5-local-observability-pipeline]] for story details.

*Acceptance Criteria:*
1. A local Bun server with a `/log` endpoint is created.
2. A utility in the frontend captures `console.log()` messages.
3. The captured messages are successfully sent to and displayed by the local Bun server.

## Epic Status

**Overall Progress:** 4 of 5 stories completed (80%)

**Completed Stories:**
- ✅ Story 1.1: Project Scaffolding & Initial Deployment
- ✅ Story 1.2: Core Backend Setup (Convex)  
- ✅ Story 1.3: Authentication Integration & User Management
- ✅ Story 1.4: Page Layouts & Protected Route Shell

**Remaining Stories:**
- 📋 Story 1.5: Local Observability Pipeline (Proof of Concept)

**Ready for Development:** Story 1.5 can begin immediately as all dependencies are complete.
