# Performance Lab

CDP profiling via Puppeteer: memory, CPU signals, Web Vitals.

Implemented in `packages/cli/src/lib/performance/`:

- `run-profile.ts` — connect Chrome, run scenario, capture metrics
- `comparison-html.ts` — before/after dashboard
- `types.ts` — shared types + vital rating thresholds

CLI:

```bash
engineering-os profile run --url ... --phase before --perf-id PERF-2026-001
engineering-os profile compare PERF-2026-001 --open
```

Requires Chrome locally (`CHROME_PATH` optional).
