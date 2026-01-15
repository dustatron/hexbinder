---
description: Plan a new feature with architect review and create beads for implementation
argument-hint: [feature-name]
allowed-tools: Bash(bd *), Bash(mkdir *), Read, Write, Edit, Glob, Grep, Task
---

# New Feature Planning Workflow

Guide the user through a structured feature planning process for Second Brain / Matrix bot.

## Phase 1: Feature Discovery

Start by asking the user to explain the feature they want to build. Use the following questions to gather context:

1. **What does this feature do?** Get a clear description.
2. **What problem does it solve?** Why is this needed?
3. **Who uses it and how?** Matrix command? Automatic? Scheduled?

Ask clarifying questions until you fully understand the requirements. Don't proceed until you have clarity.

## Phase 2: Technical Planning

Once requirements are clear, explore the codebase to understand:
- Which files will need changes
- Existing patterns to follow
- Database schema impacts
- Integration points (Matrix commands, LLM classification, etc.)

Use the Explore agent to investigate the codebase as needed.

## Phase 3: Create Feature Plan Document

Create a feature plan document at `features/<feature-name>.md` with:

```markdown
# Feature: <Name>

## Overview
<1-2 sentence description>

## Problem
<What problem this solves>

## User Story
<How users will interact with this feature>

## Technical Design

### Files to Create
- <list new files>

### Files to Modify
- <list existing files and what changes>

### Database Changes
- <new tables, columns, migrations needed>

### Matrix Commands
- <new commands if any>

### LLM/Classification Changes
- <prompt updates if any>

## Implementation Steps
1. <step 1>
2. <step 2>
...

## Testing Plan
- <how to verify the feature works>
```

## Phase 4: Architect Review

Use the api-architect agent to review the plan:
- Validate the technical approach
- Check for consistency with existing patterns
- Identify potential issues or improvements
- Update the plan based on feedback

## Phase 5: User Approval

Present the final plan to the user and ask for approval before proceeding.

## Phase 6: Create Beads

Once the plan is approved, create beads (issues) for each implementation step:

```bash
bd create "<step description>"
```

Create one bead per logical implementation unit. Tag them appropriately.

After creating beads, run `bd list` to show the user their new issues.

## Important Notes

- Always ask clarifying questions before planning
- Follow existing code patterns in the Second Brain codebase
- Reference CLAUDE.md for project conventions
- Keep the feature plan document concise but complete
- Each bead should be a single, completable unit of work