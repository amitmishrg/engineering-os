---
name: performance
description: Evidence-driven performance investigation with before/after CDP profiles and Web Vitals.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /performance — Performance investigation

## Process

1. **historical-context** — search `.ai/memory/performance/`
2. `engineering-os profile run --phase before --url ...`
3. Diagnose from evidence (heap, CPU, Web Vitals)
4. Fix + `engineering-os profile run --phase after` (same scenario)
5. `engineering-os profile compare PERF-*`
6. **knowledge-capture** — PERF-* record with metrics + report paths

Never claim a leak without before/after measurements.

