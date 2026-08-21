/**
 * Shared report filtering and aggregation from memory records.
 */

import type { MemoryRecord } from "../memory-records.js";

export type ReportOptions = {
  from?: string;
  to?: string;
  release?: string;
};

export type OwnerCounts = {
  features: number;
  bugs: number;
  perf: number;
};

export type ReportData = {
  features: MemoryRecord[];
  bugs: MemoryRecord[];
  perf: MemoryRecord[];
  owners: Map<string, OwnerCounts>;
  periodLabel: string;
};

function inDateRange(dateStr: unknown, from?: string, to?: string): boolean {
  if (!dateStr) return false;
  const d = String(dateStr);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function filterByDate(r: MemoryRecord, field: string, options: ReportOptions): boolean {
  if (options.release && r.frontmatter.release !== options.release) return false;
  if (!options.from && !options.to) return true;
  return inDateRange(r.frontmatter[field], options.from, options.to);
}

function buildPeriodLabel(options: ReportOptions): string {
  if (options.release) return `release ${options.release}`;
  if (options.from && options.to) return `${options.from} → ${options.to}`;
  if (options.from) return `from ${options.from}`;
  if (options.to) return `until ${options.to}`;
  return "all time";
}

export function buildReportData(records: MemoryRecord[], options: ReportOptions = {}): ReportData {
  const features = records.filter(
    (r) => r.kind === "features" && filterByDate(r, "shipped_at", options)
  );
  const bugs = records.filter((r) => r.kind === "bugs" && filterByDate(r, "resolved_at", options));
  const perf = records.filter(
    (r) => r.kind === "performance" && filterByDate(r, "resolved_at", options)
  );

  const owners = new Map<string, OwnerCounts>();
  for (const r of [...features, ...bugs, ...perf]) {
    const owner = String(r.frontmatter.owner ?? "unknown");
    const entry = owners.get(owner) ?? { features: 0, bugs: 0, perf: 0 };
    if (r.kind === "features") entry.features++;
    if (r.kind === "bugs") entry.bugs++;
    if (r.kind === "performance") entry.perf++;
    owners.set(owner, entry);
  }

  return {
    features,
    bugs,
    perf,
    owners,
    periodLabel: buildPeriodLabel(options),
  };
}
