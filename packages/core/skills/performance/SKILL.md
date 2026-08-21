---
name: performance
description: Evidence-driven performance investigation with before/after measurements.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /performance — Performance investigation

## Process

1. **historical-context** — search `.ai/memory/performance/`
2. Capture **before** metrics (Chrome DevTools, Lighthouse, or your team's tooling)
3. Diagnose from evidence (heap, CPU, Web Vitals)
4. Fix + capture **after** metrics (same scenario)
5. **knowledge-capture** — PERF-* record with metrics and evidence links

Never claim a leak or regression fix without before/after measurements.
