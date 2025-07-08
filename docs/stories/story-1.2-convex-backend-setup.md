# Story 1.2: Core Backend Setup (Convex)

**Epic:** 1 - Foundation & Core Setup  
**Story:** 1.2  
**Status:** Ready for Development  
**Assigned:** Dev Agent  

## User Story

**As a** Context Engineer, **I want** a fully configured Convex backend with database schema, authentication, and core serverless functions, **so that** I can build real-time chat functionality with user management and file attachments.

## Acceptance Criteria

1. [ ] Convex is installed and configured in the monorepo
2. [ ] Database schema is defined with users, chats, messages, and chat_attachments tables
3. [ ] BetterAuth is integrated for user authentication
4. [ ] Basic CRUD operations are implemented for all entities
5. [ ] Real-time functionality is working (live updates)
6. [ ] Local development environment is fully functional with `bunx convex dev`

## Dev Notes

### Architecture Alignment
This story implements the backend architecture defined in:
- `docs/architecture.md` - Overall system architecture and tech stack
- `docs/architecture/database-schema.md` - Database design and relationships
- `docs/architecture/tech-stack.md` - Technology versions and constraints
- `docs/architecture/coding-standards.md` - Development standards and patterns
- `docs/architecture/source-tree.md` - Project structure and organization

### Technology Stack Context
- **Backend Platform:** Convex ~1.11 for serverless functions and real-time database
- **Authentication:** BetterAuth with Astro integration
- **Language:** TypeScript ~5.4 in strict mode
- **Runtime:** Bun (consistent with frontend)
- **Testing:** Vitest for backend testing

### Architecture Requirements
Based on the project architecture in `docs/architecture.md` and `docs/architecture/database-schema.md`, the backend must support:

#### Database Schema (in `/convex/schema.ts`)
1. **users table** - User accounts managed by BetterAuth
   - `name: string`
   - `email: optional string` 
   - `image: optional string`
   - `tokenIdentifier: string` (unique ID from BetterAuth)
   - Index: `by_token` on `tokenIdentifier`

2. **chats table** - Chat sessions/conversations
   - `userId: id("users")`
   - `title: optional string`
   - `model: optional string`
   - `systemPrompt: optional string`
   - Index: `by_user` on `userId`

3. **messages table** - Individual messages with multi-part content
   - `chatId: id("chats")`
   - `userId: optional id("users")`
   - `role: union("user", "assistant", "system")`
   - `parts: optional array(MessagePart)`
   - `content: string` (for search compatibility)
   - `metadata: optional object`
   - Index: `by_chat_and_created` on `chatId, createdAt`
   - Search Index: `by_user_content` on content field

4. **chat_attachments table** - File attachments
   - `userId: id("users")`
   - `chatId: id("chats")`
   - `fileId: id("_storage")`
   - `fileName: string`
   - `fileType: string`
   - Index: `by_chatId` on `chatId`

#### Message Parts Structure
```typescript
type TextPart = { type: "text", text: string };
type MessagePart = TextPart; // Extensible for future part types
```

### Project Structure to Create
```
convex/
├── schema.ts           # Database schema definition
├── functions/          # Serverless functions
│   ├── queries/        # Read operations
│   │   ├── users.ts    # User queries
│   │   ├── chats.ts    # Chat queries
│   │   └── messages.ts # Message queries
│   ├── mutations/      # Write operations
│   │   ├── users.ts    # User mutations
│   │   ├── chats.ts    # Chat mutations
│   │   └── messages.ts # Message mutations
│   └── actions/        # External API calls (future LLM integration)
├── tests/             # Backend tests
├── package.json       # Convex dependencies
└── README.md          # Backend documentation
```

### Technical Implementation Details

1. **Convex Installation:**
   - Install Convex CLI globally: `bun add -g convex`
   - Initialize Convex in project: `bunx convex dev --configure`
   - Add Convex scripts to root package.json and turbo.json pipeline
   - Verify Convex dashboard connection

2. **Schema Definition:**
   - Define all tables with proper TypeScript types and indexes
   - Include validation rules and foreign key relationships
   - Set up search indexes for message content filtering
   - Follow schema patterns from `docs/architecture/database-schema.md`

3. **Authentication Setup:**
   - Install BetterAuth with Convex adapter following `docs/architecture/tech-stack.md`
   - Configure user authentication flow with token-based identification
   - Set up user session management and token validation
   - Integrate with Astro frontend authentication

4. **Backend Functions:**
   - Implement type-safe CRUD operations for all entities
   - Set up real-time query subscriptions for live updates
   - Create file upload/download handlers with Convex storage
   - Follow coding standards from `docs/architecture/coding-standards.md`

5. **Testing Configuration:**
   - Configure Vitest for Convex function testing
   - Write comprehensive unit tests for all CRUD operations
   - Test real-time functionality with multiple client scenarios
   - Follow testing strategy from `docs/architecture/testing-strategy.md`

### Testing
Following the testing strategy outlined in `docs/architecture/testing-strategy.md`:
- **Test Framework**: Vitest for all Convex function testing
- **Test Location**: Co-located with functions (e.g., `convex/functions/queries/users.test.ts`)
- **Test Standards**: 
  - Unit tests for all queries and mutations independently
  - Integration tests for real-time functionality and file operations
  - Performance tests to verify query performance with indexes and search functionality
  - Manual testing for full CRUD cycles and real-time updates across multiple clients
- **Coverage Requirements**: 
  - Backend functions: 80% minimum coverage
  - Critical business logic: 90% minimum coverage
- **Test Patterns**: Use `convex-test` framework for database testing
- **Code Quality**: All functions must follow `docs/architecture/coding-standards.md` guidelines

## Tasks

### Task 1: Install and Configure Convex
- [ ] Install Convex CLI globally: `bun add -g convex`
- [ ] Initialize Convex in project: `bunx convex dev --configure`
- [ ] Create `convex/package.json` with dependencies
- [ ] Add Convex scripts to root `package.json`
- [ ] Update `turbo.json` to include Convex dev pipeline
- [ ] Verify Convex dashboard connection

### Task 2: Define Database Schema
- [ ] Create `convex/schema.ts` following patterns from `docs/architecture/database-schema.md`
- [ ] Define `users` table with BetterAuth integration (snake_case fields per coding standards)
- [ ] Define `chats` table with user relationships and proper indexes
- [ ] Define `messages` table with multi-part content support and search capabilities
- [ ] Define `chat_attachments` table for file storage with proper constraints
- [ ] Add all required indexes for performance following `docs/architecture/coding-standards.md`
- [ ] Set up search index for message content with proper field configuration

### Task 3: Implement User Management Functions
- [ ] Create `convex/functions/queries/users.ts`
- [ ] Implement `getCurrentUser` query
- [ ] Implement `getUserById` query
- [ ] Create `convex/functions/mutations/users.ts`
- [ ] Implement `createUser` mutation
- [ ] Implement `updateUser` mutation
- [ ] Add user authentication helpers

### Task 4: Implement Chat Management Functions
- [ ] Create `convex/functions/queries/chats.ts`
- [ ] Implement `getUserChats` query with real-time updates
- [ ] Implement `getChatById` query
- [ ] Create `convex/functions/mutations/chats.ts`
- [ ] Implement `createChat` mutation
- [ ] Implement `updateChat` mutation
- [ ] Implement `deleteChat` mutation

### Task 5: Implement Message Management Functions
- [ ] Create `convex/functions/queries/messages.ts`
- [ ] Implement `getChatMessages` query with pagination
- [ ] Implement `searchMessages` query using search index
- [ ] Create `convex/functions/mutations/messages.ts`
- [ ] Implement `sendMessage` mutation with multi-part support
- [ ] Implement `updateMessage` mutation
- [ ] Implement `deleteMessage` mutation

### Task 6: Set Up File Attachment Support
- [ ] Configure Convex file storage
- [ ] Create `convex/functions/mutations/attachments.ts`
- [ ] Implement `uploadAttachment` mutation
- [ ] Implement `getAttachmentUrl` query
- [ ] Implement `deleteAttachment` mutation
- [ ] Add file type validation and size limits

### Task 7: Testing and Validation
- [ ] Set up Vitest configuration for Convex testing
- [ ] Write unit tests for all CRUD operations
- [ ] Test real-time functionality with multiple clients
- [ ] Validate schema constraints and indexes
- [ ] Test file upload/download functionality
- [ ] Run integration tests with local Convex instance

### Task 8: Documentation and Integration
- [ ] Create `convex/README.md` with setup instructions following documentation standards
- [ ] Document all function APIs and usage examples with JSDoc comments
- [ ] Add TypeScript type exports for frontend integration per `docs/architecture/source-tree.md`
- [ ] Update root README with Convex setup instructions
- [ ] Verify monorepo build includes Convex properly with Turborepo configuration
- [ ] Ensure all code follows `docs/architecture/coding-standards.md` guidelines

## Definition of Done
- [ ] Convex backend is fully configured and running locally
- [ ] All database tables are created with proper schema
- [ ] CRUD operations work for users, chats, messages, and attachments
- [ ] Real-time updates are functional across multiple clients
- [ ] File upload/download functionality is working
- [ ] All functions are properly typed and tested
- [ ] Documentation is complete and accurate
- [ ] Integration with monorepo build system is working

## File List (to be updated by Dev)

### Files to Create:
- `convex/schema.ts` - Complete database schema
- `convex/package.json` - Convex dependencies and scripts
- `convex/functions/queries/users.ts` - User query functions
- `convex/functions/queries/chats.ts` - Chat query functions  
- `convex/functions/queries/messages.ts` - Message query functions
- `convex/functions/mutations/users.ts` - User mutation functions
- `convex/functions/mutations/chats.ts` - Chat mutation functions
- `convex/functions/mutations/messages.ts` - Message mutation functions
- `convex/functions/mutations/attachments.ts` - File attachment functions
- `convex/tests/` - Test files for all functions
- `convex/README.md` - Backend documentation

### Files to Modify:
- `package.json` - Add Convex scripts and dev commands
- `turbo.json` - Include Convex in build pipeline
- `README.md` - Update with Convex setup instructions

## Debug Log (for Dev use)
*Development issues and solutions will be documented here*

## Completion Notes (for Dev)
*Implementation notes and architectural decisions will be documented here*

## QA Review Notes (if requested)
*Space for QA agent notes if review is requested.*

---

**Next Story:** 1.3 - Authentication Integration & User Management  
**Previous Story:** 1.1 - Project Scaffolding & Initial Deployment  

**Dependencies:** Story 1.1 must be complete  
**Blockers:** None