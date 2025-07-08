# Epic 2: Authentication & Real-Time Data

**Goal:** To implement a complete user authentication flow and demonstrate the core value of the real-time backend with a functional example application.

## Stories

### Story 2.1: Implement User Authentication Flow
**As a** Context Engineer, **I want** a complete authentication system using BetterAuth, **so that** users can sign up, log in, and access protected content.

*Acceptance Criteria:*
1. The BetterAuth library is fully integrated.
2. Users can sign up, log in, and log out.
3. The `/dashboard` page is accessible only to authenticated users.
4. A new user document is created in Convex upon first sign-up.

### Story 2.2: Implement Real-Time Data Example
**As a** Context Engineer, **I want** a simple, real-time "guestbook" on the dashboard, **so that** I can validate the live-query capabilities of Convex.

*Acceptance Criteria:*
1. An authenticated user can see a list of all guestbook messages.
2. A user can submit a new message, and it appears in the list instantly for all clients without a page refresh.
3. The UI is built using the shared UI components.

### Story 2.3: Implement Basic Feature Flag System
**As a** Context Engineer, **I want** a basic feature flag system, **so that** I can toggle experimental features.

*Acceptance Criteria:*
1. A `featureFlags` table is added to the Convex schema.
2. A query exists to fetch flag statuses.
3. An example feature is successfully hidden or shown based on a flag's value.
