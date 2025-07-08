# AI-Accelerated Starter Template - Testing Strategy

This strategy includes a standard testing pyramid and a specialized AI agent for enhancing test coverage.

## Testing Approach

* **Testing Pyramid:** A broad base of unit tests, a smaller layer of integration tests, and a few critical E2E tests.
* **Test Organization:** Unit tests are co-located, backend tests are in `convex/tests/`, and E2E tests are in a root `e2e/` folder.
* **Autonomous Test Coverage Enhancement:** A specialized AI agent will be employed to semi-autonomously analyze code, measure coverage, and generate new tests for edge cases and uncovered logic, submitting them for human review.

## Security and Performance

*This section would contain the `Security Requirements` and `Performance Optimization` strategies as previously discussed.*

## Coding Standards

*This section would contain the `Critical Fullstack Rules` and `Naming Conventions` table as previously discussed.*

## Error Handling Strategy

Our strategy utilizes two distinct workflows for production and local development to ensure robustness and a fast feedback loop.

* **Production Error Workflow:** Errors captured by Sentry trigger a webhook to an **n8n** instance. N8n orchestrates context gathering from Logflare and PostHog, creates a detailed GitHub issue, and uses a "Triage" AI agent to add an initial analysis to the issue.
* **Local Development Workflow:** Errors are piped directly to a **local Bun server** endpoint. This server calls the Claude Code SDK for real-time analysis, which is then printed directly to the developer's terminal for immediate feedback.
