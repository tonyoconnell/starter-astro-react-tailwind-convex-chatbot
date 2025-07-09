# Story 1.5: Local Observability Pipeline (Proof of Concept)

**Epic:** [[epic-1]] - Foundation & Core Setup  
**Story:** 1.5  
**Status:** PLANNED  
**Assigned:** Dev Agent  
**Created:** July 9, 2025  

## User Story

**As a** Context Engineer, **I want** client-side logs to be forwarded to my local Bun server, **so that** I can validate the real-time feedback loop.

## Acceptance Criteria

1. [ ] A local Bun server with a `/log` endpoint is created
2. [ ] A utility in the frontend captures `console.log()` messages
3. [ ] The captured messages are successfully sent to and displayed by the local Bun server

## Dev Notes

### Architecture Alignment
This story implements the local observability pipeline as defined in the PRD Epic 1. This creates a proof-of-concept for real-time feedback and debugging capabilities that will support future development and monitoring.

### Previous Story Insights
From **Story 1.4 - Page Layouts & Protected Route Shell**:
- Basic page structure and layouts are established
- Authentication integration is working correctly
- Foundation is ready for additional development tooling

### System Architecture
Based on the project's technology stack and development requirements:

**Local Development Server**:
- **Bun** server for handling log forwarding
- REST endpoint for receiving client logs
- Console output for real-time monitoring
- CORS configuration for frontend integration

**Frontend Log Capture**:
- JavaScript utility to intercept console messages
- Batching and throttling for performance
- Error handling for network failures
- Optional filtering by log level

### API Specifications
Required server endpoints and client utilities:

**Server Endpoints** (`local-server/`):
- `POST /log` - Receive log messages from frontend
- `GET /health` - Health check endpoint
- `GET /logs` - Optional: retrieve stored logs

**Frontend Utilities** (`packages/lib/src/utils/`):
- `logForwarder.ts` - Console log interception and forwarding
- `logConfig.ts` - Configuration for log levels and endpoints

### File Locations
Following the project structure for development tooling:

**Local Server**: 
- `local-server/server.ts` - Main Bun server implementation
- `local-server/package.json` - Server dependencies
- `local-server/types.ts` - TypeScript types for log messages

**Frontend Integration**:
- `packages/lib/src/utils/log-forwarder.ts` - Log capture utility
- `apps/web/src/components/LogForwarder.tsx` - React component for initialization
- `apps/web/src/layouts/Layout.astro` - Integration point for log forwarding

**Configuration**:
- `local-server/.env.example` - Environment configuration template
- `package.json` - Root scripts for starting local server

### Technical Constraints
From existing project setup:

**Development Technology**:
- **Bun** runtime for local server
- **TypeScript** `~5.4` for type safety
- **CORS** configuration for cross-origin requests
- Integration with existing **Astro** + **React** frontend

**Performance Requirements**:
- Non-blocking log forwarding to avoid UI lag
- Batching to reduce network requests
- Graceful degradation when server unavailable
- Minimal impact on frontend performance

### Security Considerations
For local development environment:

**Local Development Only**:
- Server runs only in development mode
- No production deployment of log forwarding
- Environment variable controls for enabling/disabling
- Basic validation of incoming log data

## Tasks / Subtasks

### Task 1: Create Local Bun Server (AC: 1)
- [ ] Set up `local-server/` directory structure
- [ ] Create `server.ts` with Bun HTTP server
- [ ] Implement `POST /log` endpoint to receive messages
- [ ] Add `GET /health` endpoint for server status
- [ ] Configure CORS for frontend access
- [ ] Add TypeScript types for log message format

### Task 2: Implement Log Endpoint Logic (AC: 1, 3)
- [ ] Parse incoming log messages with validation
- [ ] Display logs in console with timestamp and formatting
- [ ] Add optional file logging for persistence
- [ ] Implement basic log level filtering
- [ ] Add error handling for malformed requests

### Task 3: Create Frontend Log Forwarder (AC: 2)
- [ ] Create `log-forwarder.ts` utility in shared lib
- [ ] Intercept `console.log()`, `console.error()`, etc.
- [ ] Implement batching to group multiple log calls
- [ ] Add throttling to prevent overwhelming server
- [ ] Include source location and timestamp information

### Task 4: Add Frontend Integration (AC: 2, 3)
- [ ] Create React component for log forwarder initialization
- [ ] Integrate into main layout for automatic setup
- [ ] Add configuration options for development/production
- [ ] Implement graceful fallback when server unavailable
- [ ] Add user-facing controls to enable/disable forwarding

### Task 5: Configuration and Scripts (AC: 1-3)
- [ ] Add npm/bun scripts to start local server
- [ ] Create environment configuration for server port
- [ ] Add development documentation for setup
- [ ] Integrate server startup into main dev workflow
- [ ] Create example configuration files

### Task 6: Testing and Validation (AC: 1-3)
- [ ] Test server startup and endpoint functionality
- [ ] Verify log capture and forwarding from frontend
- [ ] Test error handling and network failure scenarios
- [ ] Validate performance impact on frontend
- [ ] Document setup and usage instructions

## Definition of Done

- [ ] Local Bun server runs with `/log` endpoint
- [ ] Frontend utility captures console messages
- [ ] Logs are successfully forwarded and displayed
- [ ] Server handles errors gracefully
- [ ] Frontend performance is not impacted
- [ ] Configuration allows easy enable/disable
- [ ] Development scripts are integrated
- [ ] Documentation explains setup and usage
- [ ] Testing validates end-to-end functionality

## Project Structure Notes

This story creates a development-only observability pipeline that will support debugging and monitoring during development. The implementation is designed to be easily removable for production builds while providing valuable real-time feedback during development.

The local server runs alongside the main development servers and provides immediate visibility into frontend behavior and errors.

---

**Next Story:** [[story-2.1-user-authentication-flow]] - Implement User Authentication Flow  
**Previous Story:** [[story-1.4-page-layouts-protected-routes]] - Page Layouts & Protected Route Shell  

**Dependencies:** [[story-1.4-page-layouts-protected-routes]] should be complete  
**Blockers:** None identified  

**Related Documents:**
* [[epic-1]] - Parent epic
* [[prd]] - Original requirements for observability pipeline
* [[architecture/tech-stack]] - Technology requirements
* [[architecture/coding-standards]] - Development guidelines