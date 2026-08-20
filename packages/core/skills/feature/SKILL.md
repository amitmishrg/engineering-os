---
name: feature
description: Build a feature with intake (why, PRD, Figma), planning gate, DS compliance, and docs at ship.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /feature — Build a feature

## Hard gates

1. **feature-intake** — why, PRD, Figma, FEAT-* record + branch + owner
2. **historical-context** + **design-system-check**
3. **requirement-grill** — only unresolved decisions
4. User confirms plan before implementation
5. **verify** + **feature-doc-update** + **knowledge-capture** at ship

## Do not

- Ask humans for facts the repo can answer
- Create UI primitives without proving reuse impossible

