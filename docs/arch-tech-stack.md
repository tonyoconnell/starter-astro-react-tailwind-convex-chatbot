# AI-Accelerated Starter Template - Technology Stack

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
