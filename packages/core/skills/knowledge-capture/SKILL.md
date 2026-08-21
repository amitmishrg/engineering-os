---
name: knowledge-capture
description: After significant work, write or update bug/feature/perf/ADR/pattern records and rebuild index.
version: 0.1.0
compatible: [cursor, claude]
---

# knowledge-capture

## Decide record type

bug record | feature **update** | PERF record | ADR | pattern | skip

## File rules (critical)

| Type               | Rule                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| **New bug**        | New file `.ai/memory/bugs/BUG-YYYY-NNNN-slug.md` — never overwrite other bugs |
| **New feature**    | Created at **feature-intake** — at ship, **update that same file only**       |
| **Second feature** | Must be a **second file** with next ID — never replace the first FEAT file    |

Before writing:

1. List existing files in the target folder (`features/`, `bugs/`, etc.).
2. Confirm you are editing the **correct** file (match `id` in frontmatter to current task).
3. **Never** delete, rename, or overwrite unrelated memory files.

## Required fields

id, title, branch, owner, dates (created_at; shipped_at / resolved_at when done)

## After writing

```bash
engineering-os memory index
engineering-os validate
```

## Feature ship checklist

When closing a feature, update **only** its FEAT file:

- `status: shipped` (or `cancelled`)
- `shipped_at: YYYY-MM-DD`
- `docs_updated: [...]` if docs changed

Do not create a second FEAT file for the same feature at ship time.
