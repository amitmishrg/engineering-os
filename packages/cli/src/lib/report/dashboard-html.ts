/**
 * Generate main engineering report dashboard HTML from memory records.
 */

import type { MemoryRecord } from "../memory-records.js";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inDateRange(dateStr: unknown, from?: string, to?: string): boolean {
  if (!dateStr) return false;
  const d = String(dateStr);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export function generateDashboardHtml(
  records: MemoryRecord[],
  options: { from?: string; to?: string; release?: string } = {}
): string {
  const { from, to, release } = options;

  const filterByDate = (r: MemoryRecord, field: string) => {
    if (release && r.frontmatter.release !== release) return false;
    if (!from && !to) return true;
    return inDateRange(r.frontmatter[field], from, to);
  };

  const features = records.filter((r) => r.kind === "features" && filterByDate(r, "shipped_at"));
  const bugs = records.filter((r) => r.kind === "bugs" && filterByDate(r, "resolved_at"));
  const perf = records.filter((r) => r.kind === "performance" && filterByDate(r, "resolved_at"));

  const owners = new Map<string, { features: number; bugs: number; perf: number }>();
  for (const r of [...features, ...bugs, ...perf]) {
    const owner = String(r.frontmatter.owner ?? "unknown");
    const entry = owners.get(owner) ?? { features: 0, bugs: 0, perf: 0 };
    if (r.kind === "features") entry.features++;
    if (r.kind === "bugs") entry.bugs++;
    if (r.kind === "performance") entry.perf++;
    owners.set(owner, entry);
  }

  const featureRows = features
    .map(
      (r) =>
        `<tr><td>${esc(r.id)}</td><td>${esc(r.frontmatter.title)}</td><td>${esc(r.frontmatter.why)}</td><td>${esc(r.frontmatter.owner)}</td><td>${esc(r.frontmatter.branch)}</td><td>${esc(r.frontmatter.status)}</td></tr>`
    )
    .join("\n");

  const bugRows = bugs
    .map(
      (r) =>
        `<tr><td>${esc(r.id)}</td><td>${esc(r.frontmatter.title)}</td><td>${esc(r.frontmatter.root_cause)}</td><td>${esc(r.frontmatter.owner)}</td><td>${esc(r.frontmatter.branch)}</td></tr>`
    )
    .join("\n");

  const perfRows = perf
    .map((r) => {
      const comparison = (r.frontmatter.reports as { comparison?: string } | undefined)?.comparison;
      const link = comparison ? `<a href="${esc(comparison)}">view</a>` : "—";
      return `<tr><td>${esc(r.id)}</td><td>${esc(r.frontmatter.title)}</td><td>${esc(r.frontmatter.type)}</td><td>${esc(r.frontmatter.owner)}</td><td>${link}</td></tr>`;
    })
    .join("\n");

  const contribRows = [...owners.entries()]
    .map(
      ([name, c]) =>
        `<tr><td>${esc(name)}</td><td>${c.features}</td><td>${c.bugs}</td><td>${c.perf}</td><td>${c.features + c.bugs + c.perf}</td></tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Engineering OS Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; max-width: 1100px; }
    h1 { font-size: 1.75rem; }
    .cards { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem 1.25rem; min-width: 140px; }
    .card strong { font-size: 1.75rem; display: block; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0 2rem; font-size: 0.9rem; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    section { margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>Engineering OS Report</h1>
  <p>Generated ${new Date().toISOString().slice(0, 10)}${release ? ` · release ${esc(release)}` : ""}</p>

  <div class="cards">
    <div class="card"><strong>${features.length}</strong>Features</div>
    <div class="card"><strong>${bugs.length}</strong>Bug fixes</div>
    <div class="card"><strong>${perf.length}</strong>Performance</div>
    <div class="card"><strong>${owners.size}</strong>Contributors</div>
  </div>

  <section>
    <h2>Contributions</h2>
    <table>
      <thead><tr><th>Owner</th><th>Features</th><th>Bugs</th><th>Perf</th><th>Total</th></tr></thead>
      <tbody>${contribRows || "<tr><td colspan=5>No records</td></tr>"}</tbody>
    </table>
  </section>

  <section>
    <h2>Features</h2>
    <table>
      <thead><tr><th>ID</th><th>Title</th><th>Why</th><th>Owner</th><th>Branch</th><th>Status</th></tr></thead>
      <tbody>${featureRows || "<tr><td colspan=6>No features</td></tr>"}</tbody>
    </table>
  </section>

  <section>
    <h2>Bug fixes</h2>
    <table>
      <thead><tr><th>ID</th><th>Title</th><th>Root cause</th><th>Owner</th><th>Branch</th></tr></thead>
      <tbody>${bugRows || "<tr><td colspan=5>No bugs</td></tr>"}</tbody>
    </table>
  </section>

  <section>
    <h2>Performance</h2>
    <table>
      <thead><tr><th>ID</th><th>Title</th><th>Type</th><th>Owner</th><th>Report</th></tr></thead>
      <tbody>${perfRows || "<tr><td colspan=5>No performance records</td></tr>"}</tbody>
    </table>
  </section>
</body>
</html>`;
}
