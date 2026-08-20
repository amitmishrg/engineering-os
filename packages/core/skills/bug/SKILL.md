---
name: bug
description: Investigate and fix bugs with memory search first, repro gate, and knowledge capture after fix.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /bug — Fix a bug

## Process

1. **historical-context** — search `.ai/memory/bugs/` first
2. Reproduce with a named command — show output
3. 3–5 falsifiable hypotheses before code changes
4. Smallest safe fix + **regression-test**
5. **knowledge-capture** — BUG-* record with branch, owner, affected_files

## Hard gates

- No fix without reproduction
- No skip regression test at correct seam

