---
name: context
description: Understand a codebase area using .ai/memory and project docs before acting.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /context — Understand an area

## Process

1. Invoke **historical-context** for the area or symptom
2. Read `.ai/architecture.md` and relevant source
3. Summarize: what exists, past bugs/features, open questions

## Output

Context Brief (max 80 lines) — no code changes unless asked.

