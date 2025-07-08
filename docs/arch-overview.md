# AI-Accelerated Starter Template - Architecture Overview

## Introduction

This document outlines the complete fullstack architecture for the AI-Accelerated Starter Template, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project
This project's goal is to create a new, opinionated starter template from scratch. It is not based on a pre-existing public starter like 'Create React App' or 'T3 Stack'. The architecture defined in this document will serve as the blueprint for that new template.

### Change Log
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| July 8, 2025 | 1.0 | Initial draft of the architecture document. | Winston (Architect) |

## High Level Architecture

### Technical Summary

This project utilizes a modern, serverless architecture designed for performance, scalability, and an exceptional developer experience. The frontend is a content-driven Astro application enhanced with interactive React islands. The backend is powered by Convex, which provides a real-time database and serverless functions in a unified platform. This is all deployed on Cloudflare's edge network for global low latency. This architecture directly supports the project's goal of rapid, AI-driven development by providing a pre-configured, low-maintenance, and highly integrated foundation, allowing the developer to focus on application logic and context engineering.

### Platform and Infrastructure Choice

The application will be deployed to the **Cloudflare ecosystem**. The frontend will be served via **Cloudflare Pages**, and any custom server-side logic (like the production log ingestor) will be built and deployed as **Cloudflare Workers**. The Convex backend operates on its own managed infrastructure but integrates seamlessly with this Cloudflare-native environment.

* **Platform:** Cloudflare
* **Key Services:** Pages, Workers, R2 (for future storage needs)
* **Deployment Host and Regions:** Cloudflare's Global Edge Network

### Repository Structure

A **Monorepo** structure is recommended to co-locate the frontend, backend, and shared code, which simplifies dependency management and promotes type-safety across the stack.

* **Structure:** Monorepo
* **Monorepo Tool:** **Turborepo** is recommended for its high-performance task running and simplified dependency management.
* **Package Organization:** The monorepo will contain an `apps` directory for runnable applications (like the Astro web app) and a `packages` directory for shared code (UI components, configs, types).

### High Level Architecture Diagram


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
```


### Architectural Patterns

* **Serverless Architecture:** By leveraging Convex for the backend and Cloudflare Workers for custom logic, we eliminate the need to manage or provision traditional servers. *Rationale: This provides automatic scaling, reduces operational overhead, and aligns with the project's cost-efficiency goals.*
* **Component-Based UI (Islands Architecture):** Using Astro for static content with interactive "islands" of React. *Rationale: This pattern delivers excellent performance by default (shipping minimal JavaScript) while allowing for rich, dynamic user experiences where needed.*
* **Monorepo:** A single repository for all project code, managed with Turborepo. *Rationale: This simplifies dependency management, enables robust type-sharing between the frontend and backend (Convex), and streamlines the CI/CD process.*
* **API Layer via Backend-as-a-Service (BaaS):** Using Convex as the primary API layer. *Rationale: This drastically reduces the time spent writing boilerplate CRUD APIs and provides powerful real-time capabilities out of the box, directly supporting the "fast feel" requirement.*
