# HELIOS_DECK — AI Usage Log

## Policy

AI is a collaborator, not a replacement for understanding.

Rules that apply to every session:

1. **Every significant prompt is logged here.** This file is part of the technical evaluation.
2. **Every AI-generated code block must be reviewed line by line before committing.** If you cannot explain what a line does and why it is there, it does not get committed.
3. **AI does not make architectural decisions.** Decisions are documented in `docs/decisions.md` after human review.
4. **AI output is a starting point, not a final product.** Expect to modify, simplify, or reject suggestions.
5. **No secrets, API keys, or personal data are ever included in prompts.**

---

## Session Log

---

### Session 001 — 2025-04-29

**Tool:** Claude Code (claude-sonnet-4-6)
**Phase:** 0 — Documentation and Architecture

**Prompt summary:**
Requested full Phase 0 initialization of an empty repository: git init, documentation structure (`docs/`), CLAUDE.md, README.md, .gitignore, and content for each file including data contract, API source comparison, architecture diagram, decision log, project plan, rubric checklist, and AI usage policy.

**What was generated:**
- `docs/plan.md` — 6-phase project plan with deliverables per phase
- `docs/architecture.md` — layer diagram, component tree, DB schema, data ingestion flow
- `docs/data-contract.md` — `SignalRecord` shape with field rules and validation helper
- `docs/api-sources.md` — comparison of 5 API sources with MVP 1 recommendation (NOAA SWPC)
- `docs/decisions.md` — 8 ADRs covering framework, language, DB, and library choices
- `docs/ai-usage.md` — this file
- `docs/rubric-checklist.md` — quality checklist per evaluation category
- `CLAUDE.md` — rules for future Claude sessions
- `README.md` — project overview
- `.gitignore` — Node/build/env/security patterns

**Human review notes:**
All content reviewed and accepted. Architecture diagram and data contract match the intended design. API source recommendation (NOAA SWPC) aligns with project constraints. Decision log reflects actual reasoning, not AI boilerplate.

**What was modified from AI output:**
No structural changes for Phase 0. Content accepted as written basis; will be updated as development progresses.

---

<!-- 
Template for future entries:

### Session NNN — YYYY-MM-DD

**Tool:** Claude Code (model)
**Phase:** N — Name

**Prompt summary:**
[What you asked for]

**What was generated:**
[Files or code produced]

**Human review notes:**
[What you checked, what looked correct, what seemed off]

**What was modified from AI output:**
[Changes made before committing — be honest and specific]
-->
