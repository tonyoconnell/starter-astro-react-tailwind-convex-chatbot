# Claude Code Sub-Agents Directory - Core Agent Conversion

This directory contains the first 6 converted Claude Code sub-agents from the ONE framework, representing our most critical capabilities with Irish personalities and professional expertise.

## Core Agents (Story 8.2 Conversion)

### 🎯 Marketing Director - Siobhan O'Brien

- **File**: `marketing-director.md`
- **Specialization**: Elevate Marketing Framework orchestration, mission planning, campaign development
- **Tools**: [Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch]
- **Use Cases**: Strategic marketing leadership, Foundation→ATTRACT→CONVERT→GROW workflow
- **Invocation**: `/marketing-director` or automatic delegation for marketing strategy needs

### 🔧 Engineering Director - Declan Murphy

- **File**: `engineering-director.md`
- **Specialization**: Technical mission planning, story breakdown, system architecture
- **Tools**: [Read, Write, Edit, Bash, Glob, Grep, Task]
- **Use Cases**: Technical leadership, mission-to-story conversion, engineering team coordination
- **Invocation**: `/engineering-director` or automatic delegation for technical planning

### 🎭 Core Manager - Sean Flanagan

- **File**: `core-manager.md`
- **Specialization**: Workflow coordination, multi-agent orchestration, role switching guidance
- **Tools**: [Task, Read, Write, Edit, Bash, Glob, Grep]
- **Use Cases**: Multi-agent coordination, workflow guidance, agent selection assistance
- **Invocation**: `/core-manager` or automatic delegation for orchestration needs

### 🎣 Marketing Content Hooks - Cormac Byrne

- **File**: `marketing-content-hooks.md`
- **Specialization**: Attention-grabbing content creation, viral hooks, platform-specific engagement
- **Tools**: [Read, Write, Edit, Grep, WebSearch]
- **Use Cases**: Content hook creation, scroll-stopping strategies, viral content development
- **Invocation**: `/marketing-content-hooks` or automatic delegation for content creation

### 🔄 Marketing Viral Growth - Róisín Kelly

- **File**: `marketing-viral-growth.md`
- **Specialization**: Viral growth orchestration, content multiplication, K-factor optimization
- **Tools**: [Read, Write, Edit, Bash, Glob, Grep, WebSearch]
- **Use Cases**: Exponential growth campaigns, 1-to-1,000 content scaling, viral loop engineering
- **Invocation**: `/marketing-viral-growth` or automatic delegation for viral growth needs

### 📖 Tools Playbook Generator - Pádraic Whelan

- **File**: `tools-playbook-generator.md`
- **Specialization**: Dynamic playbook creation, client customization, document generation
- **Tools**: [Read, Write, Edit, Bash, Glob, Grep, WebFetch]
- **Use Cases**: Custom playbook generation, industry templates, multi-format document creation
- **Invocation**: `/tools-playbook-generator` or automatic delegation for playbook creation

## Usage Patterns

### Automatic Delegation

Claude Code will automatically invoke the appropriate agent based on your request:

```
"I need to plan a viral marketing campaign"
→ Automatically invokes marketing-viral-growth

"Help me break down this technical mission into stories"
→ Automatically invokes engineering-director

"Create a custom playbook for a SaaS client"
→ Automatically invokes tools-playbook-generator
```

### Explicit Invocation

You can directly call any agent using slash commands:

```
/marketing-director
/engineering-director
/core-manager
/marketing-content-hooks
/marketing-viral-growth
/tools-playbook-generator
```

### Cross-Agent Coordination

The Core Manager can orchestrate multiple agents for complex tasks:

```
/core-manager "I need to launch a complete marketing campaign with viral elements and custom playbooks"
```

## Irish Personality Integration

Each agent maintains professional expertise while embodying authentic Irish characteristics:

- **Siobhan O'Brien**: Strategic thinking with Irish directness and warmth
- **Declan Murphy**: Technical precision with Irish practical problem-solving
- **Sean Flanagan**: Leadership excellence with Irish collaborative spirit
- **Cormac Byrne**: Creative storytelling with traditional Irish narrative magic
- **Róisín Kelly**: Growth innovation with Irish community-building wisdom
- **Pádraic Whelan**: Craftsmanship excellence with Irish attention to detail

## Agent Architecture

### YAML Frontmatter Structure

```yaml
---
name: agent-identifier
description: |
  MUST BE USED triggers and specializations
tools: [Tool1, Tool2, Tool3]
color: agent-color
---
```

### Tool Restrictions (Principle of Least Privilege)

- **Marketing Agents**: Focus on content and analysis tools
- **Engineering Agents**: Include development and coordination tools
- **Manager Agent**: Access to Task tool for sub-agent delegation
- **Specialized Agents**: Minimal toolset for specific functions

### Quality Standards

- All agents include R.O.C.K.E.T. framework integration
- Irish personalities enhance rather than interfere with capabilities
- Professional expertise maintained at highest levels
- Integration with existing ONE framework workflows

## Integration Points

### ONE Framework Compatibility

- Seamless integration with existing workflows and templates
- Preserved access to checklists, tasks, and data resources
- Maintained quality gates and validation processes
- Cross-functional team coordination capabilities

### Mission-Story Architecture

- Agents support goal-oriented mission development
- Story breakdown and validation capabilities
- Team-based collaboration patterns
- Quality assurance throughout development lifecycle

## Next Steps (Future Stories)

1. **Story 8.3**: Team orchestration setup for coordinated agent deployment
2. **Story 8.4**: Advanced agent conversion for remaining specialists
3. **Story 8.5**: Hook integration validation with Claude Code automation
4. **Story 8.6**: Performance optimization and scalability improvements

This conversion represents the foundation of Claude Code sub-agent integration, establishing patterns and standards for the complete ONE framework transformation.
