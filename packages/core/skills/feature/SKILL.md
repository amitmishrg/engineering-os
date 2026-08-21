---
name: feature
description: Build a feature with intake (why, PRD, Figma), planning gate, DS compliance, and docs at ship.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /feature — Build a feature

## First message behavior

When the user invokes `/feature`, **do not write or change application code** until intake is complete.

Your **first** actions:

1. Run **feature-intake** (read that skill and follow every step).
2. Ask for **Why, PRD, Figma/design, success criteria, out of scope** — wait for answers.
3. Create a **new** `.ai/memory/features/FEAT-YYYY-NNNN-slug.md` (see feature-intake — never overwrite other features).

Only after the user confirms intake → run **historical-context** + **design-system-check** → propose a plan.

## Hard gates (order)

1. **feature-intake** — questions answered, **new** FEAT record, user confirmed
2. **historical-context** + **design-system-check**
3. **requirement-grill** — only unresolved product/tech decisions (not repo facts)
4. User confirms plan before implementation
5. **verify** + **feature-doc-update** + **knowledge-capture** at ship

## Memory rules

- **One feature = one file.** Second feature → second file with next `FEAT-YYYY-NNNN` id.
- At ship: **update the same file** you created at intake (match `id` in frontmatter).
- **Never** delete or replace another feature's memory file.

## Do not

- Skip PRD / Figma / design questions because the task looks small
- Ask humans for facts the repo can answer (paths, existing components)
- Create UI primitives without **design-system-check** and proof reuse failed
- Start coding before intake confirmation
