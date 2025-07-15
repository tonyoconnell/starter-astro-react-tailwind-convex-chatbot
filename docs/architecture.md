# AI-Accelerated Starter Template Fullstack Architecture Document

## **Introduction**

This document outlines the complete fullstack architecture for the AI-Accelerated Starter Template, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

**Related Documents:**
* [[project-brief]] - Strategic foundation and problem definition
* [[prd]] - Product requirements and feature breakdown

##### **Starter Template or Existing Project**
This project's goal is to create a new, opinionated starter template from scratch. It is not based on a pre-existing public starter like 'Create React App' or 'T3 Stack'. The architecture defined in this document will serve as the blueprint for that new template.

##### **Change Log**
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| July 8, 2025 | 1.0 | Initial draft of the architecture document. | Winston (Architect) |

---
###**High Level Architecture**

##### **Technical Summary**

This project utilizes a modern, serverless architecture designed for performance, scalability, and an exceptional developer experience. The frontend is a content-driven Astro application enhanced with interactive React islands. The backend is powered by Convex, which provides a real-time database and serverless functions in a unified platform. This is all deployed on Cloudflare's edge network for global low latency. This architecture directly supports the project's goal of rapid, AI-driven development by providing a pre-configured, low-maintenance, and highly integrated foundation, allowing the developer to focus on application logic and context engineering.

##### **Platform and Infrastructure Choice**

The application will be deployed to the **Cloudflare ecosystem**. The frontend will be served via **Cloudflare Pages**, and any custom server-side logic (like the production log ingestor) will be built and deployed as **Cloudflare Workers**. The Convex backend operates on its own managed infrastructure but integrates seamlessly with this Cloudflare-native environment.

* **Platform:** Cloudflare
* **Key Services:** Pages, Workers, R2 (for future storage needs)
* **Deployment Host and Regions:** Cloudflare's Global Edge Network

##### **Repository Structure**

A **Monorepo** structure is recommended to co-locate the frontend, backend, and shared code, which simplifies dependency management and promotes type-safety across the stack.

* **Structure:** Monorepo
* **Monorepo Tool:** **Turborepo** is recommended for its high-performance task running and simplified dependency management.
* **Package Organization:** The monorepo will contain an `apps` directory for runnable applications (like the Astro web app) and a `packages` directory for shared code (UI components, configs, types).

##### **High Level Architecture Diagram**

```mermaid
graph TD
    subgraph Internet
        User[👩‍💻 User]
    end

    subgraph "Cloudflare Network"
        CDN[Cloudflare Pages/CDN]
        Worker[Cloudflare Worker<br><i>(e.g., Logging)</i>]
    end

    subgraph "Convex Platform"
        Convex_API[Convex Functions<br><i>(Queries, Mutations, Actions)</i>]
        Convex_DB[(Convex Database<br><i>Real-time & Persistent</i>)]
    end
    
    subgraph "External Services"
        LLM[LLM Provider<br><i>(OpenRouter/Requesty.AI)</i>]
        ClaudeSDK[Claude Code SDK]
    end

    User -->|HTTPS Request| CDN
    CDN -->|Serves App| User
    CDN -.->|Client-side API Calls| Convex_API
    CDN -.->|Client-side Logs| Worker
    
    Convex_API --> Convex_DB
    Convex_API -->|External API Calls| LLM
    Convex_API -->|Code Gen Tasks| ClaudeSDK
    
    Worker -->|Forwards Logs| Logflare((Logflare))
````

##### **Architectural Patterns**

  * **Serverless Architecture:** By leveraging Convex for the backend and Cloudflare Workers for custom logic, we eliminate the need to manage or provision traditional servers. *Rationale: This provides automatic scaling, reduces operational overhead, and aligns with the project's cost-efficiency goals.*
  * **Component-Based UI (Islands Architecture):** Using Astro for static content with interactive "islands" of React. *Rationale: This pattern delivers excellent performance by default (shipping minimal JavaScript) while allowing for rich, dynamic user experiences where needed.*
  * **Monorepo:** A single repository for all project code, managed with Turborepo. *Rationale: This simplifies dependency management, enables robust type-sharing between the frontend and backend (Convex), and streamlines the CI/CD process.*
  * **API Layer via Backend-as-a-Service (BaaS):** Using Convex as the primary API layer. *Rationale: This drastically reduces the time spent writing boilerplate CRUD APIs and provides powerful real-time capabilities out of the box, directly supporting the "fast feel" requirement.*

-----

## **Tech Stack**

This table is the single source of truth for all technologies to be used in the project.

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | `~5.4` | Primary language for type-safety | Strict mode ensures code quality and robustness. |
| **Frontend Framework** | Astro | `~4.5` | Content-rich sites with React islands | Excellent performance (MPA) with component-based interactivity. |
| **UI Framework** | React | `~18.2` | Interactive UI components (islands) | The standard for interactive UI, works seamlessly with Astro. |
| **UI Component Lib** | ShadCN + Radix UI | `latest` | Headless UI components | Provides accessible, unstyled primitives for a custom design. |
| **CSS Framework** | TailwindCSS | `~3.4` | Utility-first CSS styling | Rapidly builds modern designs without leaving HTML. |
| **State Management**| NanoStores | `latest` | Lightweight, shared state | Simple and effective for Astro's island architecture. |
| **Backend Platform**| Convex | `~1.11` | Backend logic, DB, and functions | Unified platform simplifies backend dev, offers real-time. |
| **API Style** | Convex Functions | `~1.11` | Queries, Mutations, Actions | Type-safe, serverless functions co-located with the schema. |
| **Database** | Convex DB | `~1.11` | Real-time document database | Integrated, transactional, and provides real-time updates. |
| **File Storage** | Cloudflare R2 | `N/A` | S3-compatible object storage | Seamless and cost-effective integration with the Cloudflare ecosystem. |
| **Authentication** | BetterAuth | `TBD` | User authentication & management | Chosen solution, pending final due diligence during implementation. |
| **Unit/Integration Testing** | Vitest | `~1.4` | Test runner for FE and BE | Fast, modern test framework that works well with Vite/Astro/Convex. |
| **E2E Testing** | Playwright | `~1.42` | End-to-end browser testing | Recommended for its modern features, reliability, and tracing. |
| **Build Tool** | Astro CLI / Vite | `~5.2` | Building, bundling, and dev server | Native tooling for the Astro framework. |
| **IaC / Deployment** | Wrangler CLI | `~3.47`| Infrastructure-as-Code for CF | Native tool for managing and deploying to the Cloudflare ecosystem. |
| **CI/CD** | GitHub Actions | `N/A` | Automated build, test, deploy | Integrates directly with the project repository for automation. |
| **Monitoring** | PostHog / Sentry | `latest` | Product analytics & error tracking | A powerful combination for user behavior and issue diagnosis. |
| **Logging** | Logflare | `latest` | Centralized log management | Chosen for its ability to aggregate logs from various sources. |

-----

## **Data Models**

See [[architecture/database-schema]] for detailed data model definitions.

-----

## **API Specification**

See [[architecture/api-specification]] for detailed Convex Function definitions.

-----

## **Components**

See [[architecture/overview]] for logical component descriptions and interaction diagrams.

-----

## **External APIs**

See [[architecture/overview]] for detailed breakdown of external service integrations.

-----

## **Core Workflows**

See [[architecture/overview]] for Mermaid sequence diagrams of key user flows.

-----

## **Database Schema**

This schema will be defined in `convex/schema.ts` and uses BetterAuth for user management.

```typescript
// Path: convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Note: Using the custom 'BetterAuth' solution.
// Schema definitions for Message Parts (TextPart, etc.) would be here...
const TextPart = v.object({ type: v.literal("text"), text: v.string() });
const MessagePart = v.union(TextPart /*, ... other parts */);

export default defineSchema({
  // Self-managed users table for BetterAuth
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // Unique ID from the BetterAuth provider
  }).index("by_token", ["tokenIdentifier"]),

  // Table for chat sessions
  chats: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Table for individual messages
  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    parts: v.optional(v.array(MessagePart)),
    content: v.string(), // For search compatibility
    metadata: v.optional(v.object({ /* ... as defined ... */ })),
  })
  .index("by_chat_and_created", ["chatId", "createdAt"])
  .searchIndex("by_user_content", { searchField: "content", filterFields: ["userId", "chatId"] }),

  // Table for file attachments
  chat_attachments: defineTable({
    userId: v.id("users"),
    chatId: v.id("chats"),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  }).index("by_chatId", ["chatId"]),
});
```

-----

## **Unified Project Structure**

```plaintext
ai-starter-template/
├── apps/
│   └── web/                # The Astro frontend application
│       ├── ...
│       └── package.json
│
├── packages/
│   ├── config/             # Shared configurations (ESLint, TSConfig, etc.)
│   ├── lib/                # Shared utilities & types
│   └── ui/                 # Shared React UI components
│
├── convex/                 # The Convex backend
│   ├── ...
│   └── schema.ts
│
├── docs/                   # CONTEXT ENGINEERING DOCS GO HERE
│   ├── brief.md
│   ├── architecture.md
│   └── ... (Best practice guides, etc.)
│
├── .gitignore
├── package.json            # Root package.json with workspaces config
├── README.md
└── turbo.json              # Turborepo configuration
```

-----

## **Development Workflow**

*This section would contain the `Local Development Setup` and `Environment Configuration` details as previously discussed.*

-----

## **Deployment Architecture**

*This section would contain the `Deployment Strategy`, `CI/CD Pipeline`, and `Environments` table as previously discussed.*

-----

## **Security and Performance**

*This section would contain the `Security Requirements` and `Performance Optimization` strategies as previously discussed.*

-----

## **Testing Strategy**

This strategy includes a standard testing pyramid and a specialized AI agent for enhancing test coverage.

  * **Testing Pyramid:** A broad base of unit tests, a smaller layer of integration tests, and a few critical E2E tests.
  * **Test Organization:** Unit tests are co-located, backend tests are in `convex/tests/`, and E2E tests are in a root `e2e/` folder.
  * **Autonomous Test Coverage Enhancement:** A specialized AI agent will be employed to semi-autonomously analyze code, measure coverage, and generate new tests for edge cases and uncovered logic, submitting them for human review.

-----

## **Coding Standards**

*This section would contain the `Critical Fullstack Rules` and `Naming Conventions` table as previously discussed.*

-----

## **Error Handling Strategy**

Our strategy utilizes two distinct workflows for production and local development to ensure robustness and a fast feedback loop.

  * **Production Error Workflow:** Errors captured by Sentry trigger a webhook to an **n8n** instance. N8n orchestrates context gathering from Logflare and PostHog, creates a detailed GitHub issue, and uses a "Triage" AI agent to add an initial analysis to the issue.
  * **Local Development Workflow:** Errors are piped directly to a **local Bun server** endpoint. This server calls the Claude Code SDK for real-time analysis, which is then printed directly to the developer's terminal for immediate feedback.

-----

## **Checklist Results Report**

*This section will be populated after the architect-checklist has been executed against this document.*

-----

## **Next Steps**

With the architecture defined, the next step is to begin the development sprints. This document should be handed off to the **Scrum Master (Bob)**, who will use the epics defined in [[prd]] and the technical details herein to create the first actionable story for the development agent.

**Implementation Progress:**
* [[story-1.1-project-scaffolding]] - ✅ COMPLETED
* [[story-1.2-convex-backend-setup]] - In Progress
* [[story-1.3-authentication-integration]] - Planned

**Related Implementation Documents:**
* [[epic-1]] - Foundation & Core Setup
* [[oauth-setup-guide]] - OAuth configuration instructions

```
```