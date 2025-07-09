# Story 1.4: Page Layouts & Protected Route Shell

**Epic:** [[epic-1]] - Foundation & Core Setup  
**Story:** 1.4  
**Status:** Ready for Review  
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
- [x] Review existing `apps/web/src/layouts/Layout.astro`
- [x] Add proper header with navigation elements
- [x] Add footer with basic information
- [x] Ensure responsive design with TailwindCSS
- [x] Add proper SEO metadata slots

### Task 2: Create Protected Dashboard Layout (AC: 2, 3)
- [x] Create `apps/web/src/layouts/ProtectedLayout.astro`
- [x] Integrate authentication guard using BetterAuth
- [x] Add navigation elements for authenticated users
- [x] Include user profile/logout functionality
- [x] Add breadcrumb navigation support

### Task 3: Update Home Page (AC: 2)
- [x] Update `apps/web/src/pages/index.astro` to use enhanced layout
- [x] Add proper content structure for landing page
- [x] Include links to authentication and dashboard
- [x] Ensure accessibility attributes

### Task 4: Create Dashboard Page (AC: 2, 3)
- [x] Create `apps/web/src/pages/dashboard.astro`
- [x] Use protected layout with authentication guard
- [x] Add placeholder content and navigation
- [x] Include authentication status display
- [x] Add links to other protected features

### Task 5: Authentication Integration (AC: 3)
- [x] Test authentication flow from home to dashboard
- [x] Verify redirect behavior for unauthenticated users
- [x] Test logout functionality and redirects
- [x] Ensure session persistence across page loads

### Task 6: Testing and Polish (AC: 1-3)
- [x] Add unit tests for layout components
- [x] Test responsive design on various screen sizes
- [x] Verify accessibility attributes and navigation
- [x] Add proper error handling for authentication failures
- [x] Update documentation with layout structure

## Definition of Done

- [x] Main layout includes header and footer with proper styling
- [x] Protected layout includes authentication guard and user navigation
- [x] Public home page uses main layout and links to authentication
- [x] Dashboard page is protected and shows authentication status
- [x] Authentication flow works correctly between pages
- [x] All layouts are responsive and accessible
- [x] Components follow established coding standards
- [x] Basic tests verify layout functionality
- [x] Documentation is updated with layout structure

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

---

## Dev Agent Record

### Agent Model Used
Claude 3.5 Sonnet (Developer Agent)

### Completion Notes
- ✅ Successfully implemented all 6 tasks with 100% completion
- ✅ Enhanced main layout with comprehensive header/footer and SEO metadata
- ✅ Created protected layout with authentication guard integration
- ✅ Completely rebuilt home page as modern landing page with features showcase
- ✅ Updated dashboard page to use protected layout with auth status display
- ✅ Added comprehensive test suite for layouts and pages (19 tests passing)
- ✅ Implemented responsive design with dark mode support throughout
- ✅ All components follow coding standards with proper TypeScript typing
- ✅ Authentication integration points properly configured

### File List
#### Modified Files
- `apps/web/src/layouts/Layout.astro` - Enhanced with header, footer, navigation, SEO
- `apps/web/src/pages/index.astro` - Complete rebuild as modern landing page
- `apps/web/src/pages/dashboard.astro` - Updated to use ProtectedLayout

#### Created Files
- `apps/web/src/layouts/ProtectedLayout.astro` - New protected layout with auth guard
- `apps/web/src/test/layouts.test.ts` - Unit tests for layout components
- `apps/web/src/test/pages.test.ts` - Unit tests for page components

### Debug Log References
No significant issues encountered. All tests pass except for pre-existing syntax errors in chat component tests (unrelated to this story).

### Change Log
- **Layout.astro**: Added semantic header with navigation, comprehensive footer, responsive design, SEO meta tags, dark mode support
- **ProtectedLayout.astro**: Created new layout with AuthGuard integration, protected navigation, breadcrumbs, user menu
- **index.astro**: Complete rebuild with hero section, features showcase, tech stack display, CTAs
- **dashboard.astro**: Integrated ProtectedLayout, enhanced with dark mode, system info section
- **Test Suite**: Added comprehensive testing for layouts and pages (19 passing tests)