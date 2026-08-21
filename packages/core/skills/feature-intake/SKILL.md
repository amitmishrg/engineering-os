---
name: feature-intake
description: >-
  Mandatory intake before any feature code — ask why, PRD, Figma/design, success criteria;
  allocate a new FEAT-* file (never overwrite existing records).
version: 0.1.0
compatible: [cursor, claude]
---

# feature-intake

Run this **before planning or writing feature code**. Do not skip questions because the task seems small.

## Step 1 — Allocate a new record (never overwrite)

1. List **all** files in `.ai/memory/features/` (glob `FEAT-*.md`).
2. Parse existing IDs (`FEAT-YYYY-NNNN`). Pick the **next** sequence number for the current year.
   - Example: if `FEAT-2026-0001` and `FEAT-2026-0002` exist → use `FEAT-2026-0003`.
3. Choose a **unique slug** from the feature title (kebab-case).
4. Target path: `.ai/memory/features/FEAT-YYYY-NNNN-slug.md`

**Hard rules**

- **Create a new file** for every new feature.
- **Never** edit, rename, or delete a **different** feature's file.
- **Never** reuse an ID that already exists.
- If updating an **in-progress** feature the user already started, edit **only** that feature's file (match by id in frontmatter) — do not create a duplicate.

## Step 2 — Ask the user (mandatory)

Ask these in one message (or a short form). **Wait for answers** before planning or coding.

| Question                      | Required            | Notes                                                                       |
| ----------------------------- | ------------------- | --------------------------------------------------------------------------- |
| **Why** are we building this? | Yes                 | Product/user value — not optional                                           |
| **PRD** link or doc           | Yes                 | URL, Notion, Jira epic, or user says **N/A** with one-line reason           |
| **Figma** or design link      | Yes for UI features | Figma URL, screenshot path, or user says **N/A** with how design is decided |
| **Success criteria**          | Yes                 | 2–5 testable outcomes                                                       |
| **Out of scope**              | Yes                 | What must **not** change                                                    |
| **Stakeholders**              | If known            | PM, design, QA                                                              |

For **UI features**, if there is no Figma link, ask at least one of:

- Link to mockup / screenshot
- Reference existing screen to extend
- Explicit "build to spec below" with bullet layout

Do **not** infer PRD/Figma from the codebase. Do **not** leave `prd_links` / `figma_links` empty without user saying N/A.

## Step 3 — Auto-fill from repo

Run or infer:

- `engineering-os git branch` → `branch`
- `git config user.name` → `owner` (or ask)
- Today → `created_at`
- `status: in-progress`

## Step 4 — Write the record

Copy structure from `.ai/templates/memory/feature.md` (or `.ai/memory/features/` examples).

Frontmatter must include:

```yaml
id: FEAT-YYYY-NNNN
title: ...
branch: ...
owner: ...
created_at: YYYY-MM-DD
why: ...
success_criteria: [...]
prd_links: [...] # [] only if user said N/A
figma_links: [...] # [] only if user said N/A for non-UI, or N/A documented in why
status: in-progress
```

Fill **Why we are building this**, **Scope**, and leave **Plan** for after user confirms approach.

## Step 5 — Confirm with user

Show:

- Full path of the **new** file
- Summary of why / PRD / design / success criteria
- Ask: **"Proceed to plan and implementation?"**

**Block** until user confirms or corrects intake answers.

## Acceptance

Intake is done only when:

1. A **new** `FEAT-*.md` exists (or the correct in-progress file was updated intentionally)
2. `why` and `success_criteria` are filled
3. PRD and design were **asked** and recorded (links or documented N/A)
4. User confirmed proceeding
