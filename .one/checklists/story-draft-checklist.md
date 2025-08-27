# Story Draft Checklist

This checklist validates that user stories are properly prepared for development with complete acceptance criteria, tasks, dependencies, and technical notes.

## Story Completeness Validation

### ✅ Basic Story Information

- [ ] Story ID present and follows naming convention (STORY-X.Y)
- [ ] Mission reference provided
- [ ] Title is clear and specific
- [ ] Type specified (Feature Implementation, Bug Fix, etc.)
- [ ] Priority level assigned
- [ ] Estimate provided in points

### ✅ Problem Statement

- [ ] Problem clearly defined
- [ ] Business context provided
- [ ] User impact explained
- [ ] Success criteria implied or stated

### ✅ Acceptance Criteria

- [ ] Minimum 3 acceptance criteria defined
- [ ] Criteria are testable and measurable
- [ ] Criteria cover happy path scenarios
- [ ] Edge cases and error conditions addressed
- [ ] Quality gates specified (where applicable)
- [ ] Format/output requirements specified

### ✅ Task Breakdown

- [ ] Minimum 5 implementation tasks listed
- [ ] Tasks are actionable and specific
- [ ] Tasks follow logical sequence
- [ ] Testing tasks included
- [ ] Documentation tasks included (if needed)

### ✅ Development Notes

- [ ] Technical approach outlined
- [ ] File paths and structures specified
- [ ] API/interface requirements defined
- [ ] Configuration details provided
- [ ] Integration points identified

### ✅ Testing Strategy

- [ ] Unit test requirements specified
- [ ] Integration test scenarios defined
- [ ] Performance/load testing considered
- [ ] Quality validation methods outlined
- [ ] Test data requirements identified

### ✅ Dependencies

- [ ] Internal dependencies listed
- [ ] External dependencies identified
- [ ] Required tools/libraries specified
- [ ] Order dependencies clarified
- [ ] Blocking dependencies highlighted

### ✅ Dev Agent Record

- [ ] Status tracking checkboxes present
- [ ] Agent model field available
- [ ] Debug log references section included
- [ ] Completion notes section available
- [ ] File list tracking prepared
- [ ] Change log initialized

## Quality Gates

### 🎯 Story Readiness Score

Rate each section (0-2 points):

- Basic Information: \_\_/2
- Problem Statement: \_\_/2
- Acceptance Criteria: \_\_/2
- Task Breakdown: \_\_/2
- Development Notes: \_\_/2
- Testing Strategy: \_\_/2
- Dependencies: \_\_/2
- Dev Agent Record: \_\_/2

**Total Score: \_\_/16**

### ✅ Readiness Thresholds

- **Ready for Development**: 14+/16 points
- **Needs Minor Updates**: 12-13/16 points
- **Requires Major Revision**: <12/16 points

## Common Issues Checklist

### ❌ Red Flags

- [ ] Vague or unclear acceptance criteria
- [ ] Missing technical implementation details
- [ ] No testing strategy defined
- [ ] Dependencies not identified
- [ ] Tasks too high-level or generic
- [ ] No quality validation specified
- [ ] Missing file/component specifications

### ⚠️ Warning Signs

- [ ] Estimate seems too low for complexity
- [ ] Limited error handling consideration
- [ ] Integration points not well defined
- [ ] Performance requirements unclear
- [ ] Security considerations missing
- [ ] Rollback strategy not specified

## Validation Comments

Use this section to note specific improvements needed for each story.

---

## Usage Instructions

1. Review each story against this checklist
2. Score each section (0-2 points)
3. Calculate total readiness score
4. Document specific improvement recommendations
5. Mark story as Ready/Needs Updates/Requires Revision
6. Track improvements in story change log
