# Task: Create Mission Brief

**Task ID:** create-mission-brief
**Assigned Agent:** mission (Sean Flanagan)
**Priority:** High
**Estimated Duration:** 30-45 minutes

## 🎯 Objective

Create a comprehensive mission brief with clear objectives, success criteria, and coordinated team assignments using the Mission → Story → Task → Agent cascading workflow.

## 📋 Task Description

Guide the user through creating a structured mission document that serves as the foundation for multi-agent coordination and systematic execution. The mission brief becomes the strategic anchor for spawning stories and coordinating teams.

## ⚡ Execution Steps

### 1. Mission Discovery & Definition
- **Elicit Mission Type:** Identify the category (Product Launch, Growth, Optimization, Content, Marketing, Technical, Custom)
- **Define Core Objective:** Establish clear, measurable business goal
- **Success Definition:** What does "mission accomplished" look like?

### 2. Success Metrics & Validation
- **Quantifiable Metrics:** Revenue, users, completion rates, etc.
- **Quality Gates:** How will we validate progress?
- **Timeline Boundaries:** Start date, target completion, milestones

### 3. Team & Resource Planning
- **Lead Agent Assignment:** Who orchestrates this mission?
- **Team Coordination:** Which specialist teams are needed?
- **Story Spawning:** How will this mission break into stories?

### 4. Mission Document Creation
- **Use Template:** Apply `mission-tmpl.yaml` structure
- **File Creation:** Generate `missions/mission-{num}-{title}.md`
- **Validation:** Ensure all required fields are complete

## 🔧 Dependencies

### Templates Required
- `mission-tmpl.yaml` - Core mission document structure
- `workflow-plan-tmpl.yaml` - Execution planning template
- `success-criteria-tmpl.yaml` - Metrics definition template

### Data Sources
- `mission-frameworks.md` - Mission type definitions and patterns
- `orchestration-patterns.md` - Multi-agent coordination strategies
- `irish-project-management.md` - Systematic execution approaches

## 📊 Quality Validation

### Mission Brief Checklist
- [ ] Clear, measurable objective defined
- [ ] Success criteria with quantifiable metrics
- [ ] Timeline with start/target dates established
- [ ] Lead agent and teams assigned
- [ ] Story spawning strategy outlined
- [ ] Quality gates identified
- [ ] Mission document created in proper format

### Success Metrics
- **Clarity Score:** Objective understandable by all team members (8+/10)
- **Completeness:** All required fields populated (100%)
- **Actionability:** Clear next steps for story creation identified

## 🔄 Next Actions

After mission brief creation:
1. **Validate Mission:** Ensure all stakeholders understand objective
2. **Spawn Stories:** Use `*spawn-stories` to create mission breakdown
3. **Team Coordination:** Assign specialists using `*coordinate-teams`
4. **Launch Execution:** Begin story development and task assignment

## 💡 Irish Project Management Principles

*"Ní neart go cur le chéile"* - There is no strength without unity.

- **Collaborative Planning:** Every mission requires cross-functional input
- **Systematic Breakdown:** Complex objectives become manageable stories
- **Clear Communication:** All team members understand their role
- **Quality Focus:** Better to build right than rebuild later
- **Adaptive Execution:** Plans evolve but objectives remain constant

## 🚀 Expected Outcomes

- **Mission Document:** Complete, validated mission brief
- **Team Alignment:** All stakeholders understand objective and their role
- **Execution Readiness:** Clear path to story creation and task assignment
- **Quality Foundation:** Strong base for cascading workflow success
- **Coordination Framework:** Structure for multi-agent orchestration

---

**Completion Criteria:** Mission brief created, validated, and ready for story spawning with all team assignments confirmed.