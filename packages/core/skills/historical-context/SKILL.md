---
name: historical-context
description: >-
  Search .ai/memory and project docs before any bug fix, feature, or review.
  Use when starting work that might overlap past bugs, features, or decisions.
version: 0.1.0
compatible: [cursor, claude]
---

# Historical context

## Purpose

Stop the agent from exploring the entire repo when similar work already exists in `.ai/memory/`.

## When to activate

- Before `/bug`, `/feature`, `/review`, or `/performance`
- When the user mentions symptoms that might match a past issue

## Process

1. Classify the task (bug | feature | review | performance)
2. Extract keywords (components, routes, error codes, symptoms)
3. Search `.ai/index/*.md` and `.ai/memory/**`
4. Read relevant `.ai/project.md`, `architecture.md`, `design-system.md`
5. Emit a **Context Brief** (max ~80 lines)

## Output

A short brief listing: matching memory records, affected files from past fixes, applicable ADRs/patterns.

## Acceptance

It's working if the agent cites specific BUG/FEAT/PERF records before grepping the whole codebase.
