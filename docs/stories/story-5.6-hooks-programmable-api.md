# Story 5.6: Programmable Hooks API and Engineering Primitives

## Status
To Do

## Story
**As a** developer building systems that integrate with Claude Code,
**I want** a programmable API for managing hooks and using Claude Code as an engineering primitive,
**So that** I can compose Claude Code into larger automated workflows, create dynamic hook behaviors, and build sophisticated development toolchains

## Acceptance Criteria
1. Programmable hook management API allows runtime registration, modification, and removal of hooks
2. Single-file script utilities support self-contained hooks with inline dependencies (UV/Bun)
3. Hook composition patterns enable complex behaviors through hook chaining and aggregation
4. External webhook integration allows Claude Code events to trigger third-party services
5. Engineering primitive patterns demonstrate Claude Code as a building block for larger systems
6. Dynamic hook configuration supports environment-specific and context-aware behaviors
7. Hook marketplace/registry enables sharing and discovery of reusable hooks
8. Security model ensures safe execution of dynamically loaded hooks

## Tasks / Subtasks
- [ ] Create Programmable Hooks API (AC: 1, 6)
  - [ ] Implement hook registry with CRUD operations
  - [ ] Add runtime hook loading/unloading capabilities
  - [ ] Create hook versioning and dependency management
  - [ ] Build hook context injection system
- [ ] Develop Single-file Script Utilities (AC: 2)
  - [ ] Create UV script template for Python hooks
  - [ ] Create Bun script template for TypeScript hooks
  - [ ] Implement inline dependency resolution
  - [ ] Add script validation and sandboxing
  - [ ] Create utilities directory structure for shared components
- [ ] Build Hook Composition Framework (AC: 3)
  - [ ] Implement hook pipeline/chain patterns
  - [ ] Create hook aggregator for parallel execution
  - [ ] Add conditional hook execution logic
  - [ ] Build hook result transformation utilities
  - [ ] Support multi-command execution patterns
- [ ] Implement External Integration Layer (AC: 4)
  - [ ] Create webhook dispatcher for hook events
  - [ ] Add retry logic and circuit breakers
  - [ ] Implement event batching for efficiency
  - [ ] Build webhook security (signatures, auth)
- [ ] Create Engineering Primitive Examples (AC: 5)
  - [ ] Build CI/CD integration example
  - [ ] Create code review automation example
  - [ ] Implement documentation generator example
  - [ ] Develop test generator primitive
- [ ] Build Hook Marketplace Infrastructure (AC: 7)
  - [ ] Create hook package format specification
  - [ ] Implement hook discovery and search
  - [ ] Add hook rating and review system
  - [ ] Build hook installation CLI
- [ ] Implement Security Model (AC: 8)
  - [ ] Create hook permission system
  - [ ] Add hook execution sandboxing
  - [ ] Implement hook signing and verification
  - [ ] Build audit logging for hook execution

## Dev Notes

### Programmable Hooks API

The API enables dynamic hook management through a programmatic interface:

```typescript
// Hook Registry API
interface HookRegistry {
  // Register a new hook at runtime
  register(hook: Hook): Promise<string>;
  
  // Update existing hook configuration
  update(id: string, updates: Partial<Hook>): Promise<void>;
  
  // Remove a hook from the registry
  unregister(id: string): Promise<void>;
  
  // Query hooks by criteria
  find(query: HookQuery): Promise<Hook[]>;
  
  // Enable/disable hooks dynamically
  toggle(id: string, enabled: boolean): Promise<void>;
}

// Example: Dynamic hook registration
const securityHook = await hookRegistry.register({
  name: "dynamic-security-check",
  events: ["PreToolUse"],
  filter: { tools: ["Edit", "Write"] },
  handler: async (event) => {
    if (await isHighRiskFile(event.file)) {
      return { allow: false, reason: "High-risk file modification" };
    }
  }
});
```

### Single-file Script Templates

#### UV Python Script Template
```python
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "httpx",
#   "rich",
#   "pydantic"
# ]
# ///

import asyncio
import json
from pathlib import Path
from typing import Dict, Any
import httpx
from rich.console import Console
from pydantic import BaseModel

class HookEvent(BaseModel):
    tool: str
    file: str
    metadata: Dict[str, Any]

async def handle_hook(event: HookEvent) -> Dict[str, Any]:
    """Single-file Python hook with inline dependencies"""
    console = Console()
    
    # Validate file changes
    if event.tool == "Edit" and event.file.endswith(".py"):
        console.print(f"[blue]Checking Python file: {event.file}[/blue]")
        
        # Make external API call
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.example.com/validate",
                json={"file": event.file}
            )
            
        if response.status_code == 200:
            return {"allow": True}
    
    return {"allow": True}

if __name__ == "__main__":
    # Hook entry point
    event_data = json.loads(Path("/dev/stdin").read_text())
    event = HookEvent(**event_data)
    result = asyncio.run(handle_hook(event))
    print(json.dumps(result))
```

#### Bun TypeScript Script Template
```typescript
#!/usr/bin/env bun

// Single-file Bun hook with inline imports
import { z } from "zod";
import { Hono } from "hono";
import chalk from "chalk";

const HookEventSchema = z.object({
  tool: z.string(),
  file: z.string(),
  metadata: z.record(z.any())
});

type HookEvent = z.infer<typeof HookEventSchema>;

async function handleHook(event: HookEvent) {
  const parsed = HookEventSchema.parse(event);
  
  // Complex hook logic with external dependencies
  if (parsed.tool === "Edit" && parsed.file.endsWith(".ts")) {
    console.log(chalk.blue(`Validating TypeScript file: ${parsed.file}`));
    
    // Call external service
    const response = await fetch("https://api.example.com/validate", {
      method: "POST",
      body: JSON.stringify({ file: parsed.file })
    });
    
    if (!response.ok) {
      return { allow: false, reason: "Validation failed" };
    }
  }
  
  return { allow: true };
}

// Hook entry point
const event = await Bun.stdin.json();
const result = await handleHook(event);
console.log(JSON.stringify(result));
```

### Hook Composition Patterns

```typescript
// Hook Pipeline - Sequential execution
const formattingPipeline = createPipeline([
  prettierHook,
  eslintHook,
  importSortHook
]);

// Hook Aggregator - Parallel execution
const securityAggregator = createAggregator([
  gitSecretsHook,
  dependencyCheckHook,
  codeQLHook
], { mode: "all-must-pass" });

// Conditional Hook Execution
const contextualHook = createConditional({
  condition: (event) => event.metadata.branch === "main",
  hook: productionValidationHook,
  fallback: developmentHook
});

// Hook Result Transformation
const enrichedHook = createTransformer(
  baseHook,
  (result) => ({
    ...result,
    timestamp: Date.now(),
    metrics: calculateMetrics(result)
  })
);
```

### External Webhook Integration

```typescript
// Webhook configuration
{
  "webhooks": {
    "github": {
      "url": "https://api.github.com/repos/owner/repo/dispatches",
      "events": ["PostToolUse"],
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
      },
      "payload": {
        "event_type": "claude-code-hook",
        "client_payload": {
          "tool": "{{event.tool}}",
          "file": "{{event.file}}",
          "timestamp": "{{event.timestamp}}"
        }
      }
    },
    "slack": {
      "url": "https://hooks.slack.com/services/xxx/yyy/zzz",
      "events": ["Stop", "Error"],
      "payload": {
        "text": "Claude Code session {{event.type}}: {{event.summary}}"
      }
    }
  }
}
```

### Engineering Primitive Examples

#### CI/CD Integration Primitive
```typescript
// claude-code-ci.ts - Use Claude Code as a CI step
export class ClaudeCodeCI {
  async runCodeReview(pr: PullRequest): Promise<ReviewResult> {
    const session = await claudeCode.createSession({
      hooks: [
        codeQualityHook,
        securityScanHook,
        performanceAnalysisHook
      ]
    });
    
    const results = await session.analyze(pr.files);
    return this.formatAsGitHubReview(results);
  }
}
```

#### Documentation Generator Primitive
```typescript
// claude-code-docs.ts - Automated documentation generation
export class ClaudeCodeDocs {
  async generateDocs(codebase: string): Promise<Documentation> {
    const session = await claudeCode.createSession({
      hooks: [
        jsdocExtractionHook,
        markdownFormatterHook,
        diagramGeneratorHook
      ]
    });
    
    return session.execute("Generate comprehensive documentation");
  }
}
```

### Hook Marketplace Format

```json
{
  "name": "security-scanner-hook",
  "version": "1.2.0",
  "description": "Comprehensive security scanning for Claude Code",
  "author": "security-team",
  "license": "MIT",
  "claudeCode": {
    "events": ["PreToolUse", "PostToolUse"],
    "requiredPermissions": ["file:read", "network:external"],
    "configuration": {
      "scanLevel": {
        "type": "string",
        "enum": ["basic", "standard", "paranoid"],
        "default": "standard"
      }
    }
  },
  "dependencies": {
    "semgrep": "^1.0.0",
    "gitleaks": "^8.0.0"
  },
  "scripts": {
    "install": "bun install",
    "test": "bun test"
  }
}
```

### Security Model

```typescript
// Hook permission system
interface HookPermissions {
  file: {
    read: string[];  // Glob patterns for readable files
    write: string[]; // Glob patterns for writable files
  };
  network: {
    internal: boolean;  // Can make internal network calls
    external: string[]; // Allowed external domains
  };
  system: {
    env: string[];      // Accessible environment variables
    commands: string[]; // Allowed system commands
  };
}

// Hook execution sandbox
class HookSandbox {
  async execute(hook: Hook, event: HookEvent): Promise<HookResult> {
    const sandbox = {
      permissions: hook.permissions,
      timeout: hook.timeout || 30000,
      memory: hook.memoryLimit || "512MB"
    };
    
    return this.isolate.run(hook.handler, event, sandbox);
  }
}
```

### Dynamic Hook Configuration

```typescript
// Environment-aware hooks
const deploymentHook = createDynamicHook({
  development: {
    handler: devValidationHook,
    config: { strict: false }
  },
  staging: {
    handler: stagingValidationHook,
    config: { strict: true, notify: "slack" }
  },
  production: {
    handler: productionValidationHook,
    config: { strict: true, notify: "pagerduty", block: true }
  }
});

// Context-aware hook loading
async function loadContextualHooks(context: Context): Promise<Hook[]> {
  const hooks = [];
  
  // Load project-specific hooks
  if (context.project.type === "web") {
    hooks.push(await loadHook("web-optimizer"));
  }
  
  // Load team-specific hooks
  if (context.team === "security") {
    hooks.push(await loadHook("security-scanner"));
  }
  
  // Load time-based hooks
  if (isBusinessHours()) {
    hooks.push(await loadHook("collaboration-notifier"));
  }
  
  return hooks;
}
```

### Usage with `claude -p` Command

```bash
# Run Claude Code with programmatic hooks
claude -p ./my-automation-script.ts "Refactor the authentication module"

# Use Claude Code as part of a larger pipeline
git diff --name-only | claude -p ./code-reviewer.js | gh pr comment --body-file -

# Compose multiple Claude Code instances
claude -p ./analyzer.py "Analyze codebase" | \
  claude -p ./optimizer.ts "Optimize based on analysis" | \
  claude -p ./documenter.js "Document changes"
```

## Dependencies
- Stories 5.1-5.5 must be completed (full hooks infrastructure)
- UV for Python script execution
- Bun for TypeScript script execution
- Webhook libraries (httpx, fetch API)
- Sandboxing technology (VM, Worker threads)
- Package registry infrastructure

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-09 | 1.0 | Initial story creation | Claude (Assistant) |

## Dev Agent Record

### Agent Model Used
Claude 4 Opus (Story Creation)

### Debug Log References
_To be filled during implementation_

### Completion Notes List
_To be filled upon completion_

### File List
_To be updated during implementation_

## QA Results

**QA Status: ⚠️ NOT YET IMPLEMENTED**  
**Reviewed By:** Quinn (Senior Developer & QA Architect)  
**Review Date:** 2025-07-09  

### Story Quality Assessment: EXCELLENT
- **Vision Alignment**: Perfectly captures Claude Code as "programmable engineering primitive"
- **API Design**: Well-structured TypeScript interfaces for hook registry and management
- **Composition Patterns**: Sophisticated hook chaining, aggregation, and conditional execution
- **Engineering Primitive Examples**: Concrete use cases showing Claude Code integration into larger systems

### Acceptance Criteria Quality: VERY GOOD
- **Comprehensive Scope**: 8 acceptance criteria covering all aspects of programmable hooks
- **Technical Depth**: Proper specification of APIs, security models, and marketplace infrastructure
- **Real-World Applications**: Practical examples of CI/CD, documentation, and code review automation
- **Security Considerations**: Appropriate sandboxing and permission models

### Technical Architecture Assessment: EXCELLENT
- **Hook Registry API**: Clean CRUD operations with proper TypeScript typing
- **Single-file Scripts**: Elegant UV/Bun templates with inline dependency management
- **Composition Framework**: Sophisticated patterns for pipeline, aggregation, and conditional logic
- **Security Model**: Comprehensive permission system with proper sandboxing

### Implementation Complexity: HIGH
- **Multiple Technologies**: Requires UV, Bun, webhook infrastructure, and sandboxing
- **Security Challenges**: Hook execution sandboxing requires careful implementation
- **Marketplace Infrastructure**: Package registry and discovery system is complex
- **Cross-Platform Compatibility**: Single-file script execution across different platforms

### Key Strengths
1. **Engineering Primitive Vision**: Transforms Claude Code from tool to platform component
2. **Composition Patterns**: Sophisticated hook chaining enables complex workflows
3. **Developer Experience**: Single-file scripts make hook creation accessible
4. **Integration Examples**: Clear patterns for CI/CD, documentation, and automation

### Technical Risk Assessment: MODERATE
- **Security Sandboxing**: Complex to implement safely across platforms
- **Performance Impact**: Dynamic hook loading could affect system performance
- **Dependency Management**: UV/Bun dependency resolution needs careful handling
- **Webhook Reliability**: External integration requires robust error handling

### Recommended Implementation Approach
1. **Phase 1**: Core hook registry API and basic single-file script support
2. **Phase 2**: Composition patterns and webhook integration
3. **Phase 3**: Security sandboxing and permission model
4. **Phase 4**: Marketplace infrastructure and discovery

### Pre-Implementation Requirements
- **Security Review**: Comprehensive security audit of sandboxing approach
- **Performance Testing**: Ensure dynamic hook loading doesn't impact core performance
- **Documentation**: Extensive developer documentation for hook creation patterns
- **Testing Strategy**: Robust testing framework for dynamic hook execution

### Recommendation: ✅ APPROVED FOR IMPLEMENTATION
This story represents the pinnacle of the hooks system - transforming Claude Code into a true engineering primitive. Implementation should proceed with careful attention to security and performance.