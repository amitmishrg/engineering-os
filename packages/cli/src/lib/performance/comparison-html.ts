/**
 * Generate before/after comparison HTML for a performance investigation.
 */

import type { ProfileSnapshot } from "./types.js";
import { rateVital } from "./types.js";

function row(label: string, before: number | null, after: number | null, unit: string): string {
  const b = before ?? 0;
  const a = after ?? 0;
  const delta = after !== null && before !== null ? a - b : null;
  const deltaStr = delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}${unit}`;
  return `<tr><td>${label}</td><td>${before ?? "—"}${before !== null ? unit : ""}</td><td>${after ?? "—"}${after !== null ? unit : ""}</td><td>${deltaStr}</td></tr>`;
}

export function generateComparisonHtml(options: {
  perfId: string;
  title: string;
  before: ProfileSnapshot;
  after: ProfileSnapshot;
}): string {
  const { perfId, title, before, after } = options;
  const b = before.webVitals;
  const a = after.webVitals;

  const vitalsRows = [
    row("LCP", b.lcp_ms, a.lcp_ms, "ms"),
    row("INP", b.inp_ms, a.inp_ms, "ms"),
    row("CLS", b.cls, a.cls, ""),
    row("TTFB", b.ttfb_ms, a.ttfb_ms, "ms"),
    row("FCP", b.fcp_ms, a.fcp_ms, "ms"),
  ].join("\n");

  const heapDelta = after.memory.heap_used_mb - before.memory.heap_used_mb;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${perfId} — Performance comparison</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; }
    h1 { font-size: 1.5rem; }
    table { border-collapse: collapse; width: 100%; max-width: 720px; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f5f5f5; }
    .good { color: #0a7; } .poor { color: #c33; }
    .section { margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p><strong>${perfId}</strong> · ${before.url}</p>

  <div class="section">
    <h2>Web Vitals (before → after)</h2>
    <table>
      <thead><tr><th>Metric</th><th>Before</th><th>After</th><th>Δ</th></tr></thead>
      <tbody>${vitalsRows}</tbody>
    </table>
    <p>After LCP rating: <span class="${rateVital("lcp_ms", a.lcp_ms)}">${rateVital("lcp_ms", a.lcp_ms)}</span></p>
  </div>

  <div class="section">
    <h2>Memory</h2>
    <table>
      <tr><th></th><th>Before</th><th>After</th><th>Δ</th></tr>
      <tr><td>Heap used (MB)</td><td>${before.memory.heap_used_mb}</td><td>${after.memory.heap_used_mb}</td><td>${heapDelta > 0 ? "+" : ""}${heapDelta}</td></tr>
      <tr><td>DOM nodes</td><td>${before.memory.nodes_count}</td><td>${after.memory.nodes_count}</td><td>${after.memory.nodes_count - before.memory.nodes_count}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>CPU</h2>
    <table>
      <tr><th></th><th>Before</th><th>After</th></tr>
      <tr><td>Long tasks</td><td>${before.cpu.long_tasks}</td><td>${after.cpu.long_tasks}</td></tr>
    </table>
  </div>

  <p><em>Observed metrics from CDP — interpret with context. Not a guarantee of production behavior.</em></p>
</body>
</html>`;
}

export function generateSnapshotHtml(snapshot: ProfileSnapshot, title: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>${title} — ${snapshot.phase}</title></head>
<body>
<h1>${title} (${snapshot.phase})</h1>
<p>URL: ${snapshot.url}</p>
<pre>${JSON.stringify(snapshot, null, 2)}</pre>
</body></html>`;
}
