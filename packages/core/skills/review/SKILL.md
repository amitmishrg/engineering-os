---
name: review
description: Multi-axis code review against project standards and .ai/memory patterns.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /review — Code review

Check: correctness, architecture, design-system compliance, security, a11y, tests.

Read `.ai/conventions.md`, `.ai/design-system.md`, and search memory for related bugs/patterns.

Output: findings by severity with file references.

