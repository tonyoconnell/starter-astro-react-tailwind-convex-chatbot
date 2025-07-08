# Epic 4: In-App Code Generation & Context Framework

**Goal:** To deliver the template's most advanced capability: a proof-of-concept for in-app, AI-driven code generation, supported by a formal set of "best practice" documents.

## Stories

### Story 4.1: Implement In-App Code Generation (Proof of Concept)
**As a** Context Engineer, **I want** a UI control to trigger the Claude Code SDK, **so that** I can prove the viability of the application generating its own code.

*Acceptance Criteria:*
1. A UI control (e.g., chat command `/generate`) triggers a Convex action.
2. The action successfully calls the Claude Code SDK with a predefined prompt.
3. A new file is successfully created in the correct local directory.
4. A success/failure message is displayed in the UI.

### Story 4.2: Create Initial Context Engineering Documents
**As a** Context Engineer, **I want** initial "best practice" documents for key artifacts, **so that** I have a template for how to guide the AI coder.

*Acceptance Criteria:*
1. A `docs/best-practices/` directory is created.
2. `creating-components.md` and `creating-convex-functions.md` are created with standard structures and conventions.
3. The prompt in Story 4.1 is updated to reference these documents.
