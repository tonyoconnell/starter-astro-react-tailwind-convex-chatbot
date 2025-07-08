# Epic 3: Conversational AI Implementation

**Goal:** To implement a fully functional, end-to-end conversational chat feature that connects to a live LLM, providing the core interactive AI experience for the template.

## Stories

### Story 3.1: Implement Conversational Chat UI
**As a** Context Engineer, **I want** a functional chat interface, **so that** I have a foundation for building conversational applications.

*Acceptance Criteria:*
1. A chat page displays messages from the `messages` table.
2. The UI includes an input, send button, and scrollable message history.
3. User and assistant messages are styled differently.

### Story 3.2: Integrate LLM for AI Responses
**As a** Context Engineer, **I want** user messages to be sent to an LLM, with the response displayed in the chat, **so that** the app has a working AI conversation loop.

*Acceptance Criteria:*
1. The `processUserMessage` Convex action is implemented.
2. The action successfully calls the OpenRouter/Requesty.AI API.
3. The LLM's response is saved to the `messages` table and appears in the UI instantly.
4. API keys are managed securely as environment variables.
