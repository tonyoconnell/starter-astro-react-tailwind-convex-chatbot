# Story 1.4: Page Layouts & Protected Route Shell

**Epic:** [[epic-1]] - Foundation & Core Setup  
**Story:** 1.4  
**Status:** PLANNED  
**Assigned:** Dev Agent  
**Created:** July 9, 2025  

## User Story

**As a** Context Engineer, **I want** a basic public layout and a protected dashboard layout defined, **so that** I have a clear structure for public and private content.

## Acceptance Criteria

1. [ ] A main layout component is created in Astro with a simple header and footer
2. [ ] A public home page (`/`) and a protected dashboard page (`/dashboard`) exist
3. [ ] The dashboard page has a placeholder for authentication logic

## Dev Notes

### Architecture Alignment
This story implements the basic page structure as defined in the PRD Epic 1. Based on the existing project structure and authentication system from Story 1.3, this story creates the foundation layouts for public and protected content.

### Previous Story Insights
From **Story 1.3 - Authentication Integration**:
- Authentication system is fully functional with BetterAuth and OAuth providers
- User management with Convex integration is working correctly
- Protected routes and session management are implemented
- Authentication state management with NanoStores is established

### Component Specifications
Based on existing project structure and Astro framework:

**Layout Components** (`apps/web/src/layouts/`):
- `Layout.astro` - Main layout component with header and footer
- `ProtectedLayout.astro` - Dashboard layout for authenticated users

**Page Components** (`apps/web/src/pages/`):
- `index.astro` - Public home page using main layout
- `dashboard.astro` - Protected dashboard page using protected layout

### File Locations
Following the existing project structure:

**Frontend Layouts**: 
- `apps/web/src/layouts/Layout.astro` - Already exists, may need enhancement
- `apps/web/src/layouts/ProtectedLayout.astro` - New protected layout

**Frontend Pages**:
- `apps/web/src/pages/index.astro` - Already exists, may need layout updates
- `apps/web/src/pages/dashboard.astro` - New protected dashboard page

### Technical Constraints
From existing project setup:

**Frontend Technology**:
- **Astro** `~4.5` for page routing and layouts
- **React** `~18.2` for interactive components (islands)
- **TailwindCSS** `~3.4` for styling with responsive design
- **BetterAuth** integration for authentication guards

**Authentication Requirements**:
- Dashboard page requires authenticated user
- Redirect unauthenticated users to login
- Preserve intended destination after login

## Tasks / Subtasks

### Task 1: Create Enhanced Main Layout (AC: 1)
- [ ] Review existing `apps/web/src/layouts/Layout.astro`
- [ ] Add proper header with navigation elements
- [ ] Add footer with basic information
- [ ] Ensure responsive design with TailwindCSS
- [ ] Add proper SEO metadata slots

### Task 2: Create Protected Dashboard Layout (AC: 2, 3)
- [ ] Create `apps/web/src/layouts/ProtectedLayout.astro`
- [ ] Integrate authentication guard using BetterAuth
- [ ] Add navigation elements for authenticated users
- [ ] Include user profile/logout functionality
- [ ] Add breadcrumb navigation support

### Task 3: Update Home Page (AC: 2)
- [ ] Update `apps/web/src/pages/index.astro` to use enhanced layout
- [ ] Add proper content structure for landing page
- [ ] Include links to authentication and dashboard
- [ ] Ensure accessibility attributes

### Task 4: Create Dashboard Page (AC: 2, 3)
- [ ] Create `apps/web/src/pages/dashboard.astro`
- [ ] Use protected layout with authentication guard
- [ ] Add placeholder content and navigation
- [ ] Include authentication status display
- [ ] Add links to other protected features

### Task 5: Authentication Integration (AC: 3)
- [ ] Test authentication flow from home to dashboard
- [ ] Verify redirect behavior for unauthenticated users
- [ ] Test logout functionality and redirects
- [ ] Ensure session persistence across page loads

### Task 6: Testing and Polish (AC: 1-3)
- [ ] Add unit tests for layout components
- [ ] Test responsive design on various screen sizes
- [ ] Verify accessibility attributes and navigation
- [ ] Add proper error handling for authentication failures
- [ ] Update documentation with layout structure

## Definition of Done

- [ ] Main layout includes header and footer with proper styling
- [ ] Protected layout includes authentication guard and user navigation
- [ ] Public home page uses main layout and links to authentication
- [ ] Dashboard page is protected and shows authentication status
- [ ] Authentication flow works correctly between pages
- [ ] All layouts are responsive and accessible
- [ ] Components follow established coding standards
- [ ] Basic tests verify layout functionality
- [ ] Documentation is updated with layout structure

## Project Structure Notes

This story creates the foundation page layouts that will be used throughout the application. The layouts build upon the existing authentication system from Story 1.3 and provide the structure for all future features.

---

**Next Story:** [[story-1.5-local-observability-pipeline]] - Local Observability Pipeline  
**Previous Story:** [[story-1.3-authentication-integration]] - Authentication Integration & User Management  

**Dependencies:** [[story-1.3-authentication-integration]] must be complete  
**Blockers:** None identified  

**Related Documents:**
* [[epic-1]] - Parent epic
* [[prd]] - Original requirements for page layouts
* [[architecture/tech-stack]] - Technology requirements
* [[architecture/coding-standards]] - Development guidelines