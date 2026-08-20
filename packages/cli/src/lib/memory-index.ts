/**
 * Rebuild .ai/index/*.md tables from memory records.
 */

import path from "node:path";
import { writeText } from "./fs.js";
import type { MemoryRecord } from "./memory-records.js";
import type { ProjectPaths } from "./paths.js";

function cell(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function writeBugsIndex(indexDir: string, records: MemoryRecord[]): void {
  const bugs = records.filter((r) => r.kind === "bugs");
  const lines = [
    "# Bug index",
    "",
    "| ID | Title | Branch | Owner | Resolved |",
    "|----|-------|--------|-------|----------|",
    ...bugs.map(
      (r) =>
        `| ${cell(r.id)} | ${cell(r.frontmatter.title)} | ${cell(r.frontmatter.branch)} | ${cell(r.frontmatter.owner)} | ${cell(r.frontmatter.resolved_at)} |`
    ),
    "",
  ];
  writeText(path.join(indexDir, "bugs.md"), lines.join("\n"));
}

function writeFeaturesIndex(indexDir: string, records: MemoryRecord[]): void {
  const feats = records.filter((r) => r.kind === "features");
  const lines = [
    "# Feature index",
    "",
    "| ID | Title | Branch | Owner | Status |",
    "|----|-------|--------|-------|--------|",
    ...feats.map(
      (r) =>
        `| ${cell(r.id)} | ${cell(r.frontmatter.title)} | ${cell(r.frontmatter.branch)} | ${cell(r.frontmatter.owner)} | ${cell(r.frontmatter.status)} |`
    ),
    "",
  ];
  writeText(path.join(indexDir, "features.md"), lines.join("\n"));
}

function writePerformanceIndex(indexDir: string, records: MemoryRecord[]): void {
  const perf = records.filter((r) => r.kind === "performance");
  const lines = [
    "# Performance index",
    "",
    "| ID | Title | Branch | Owner | Type |",
    "|----|-------|--------|-------|------|",
    ...perf.map(
      (r) =>
        `| ${cell(r.id)} | ${cell(r.frontmatter.title)} | ${cell(r.frontmatter.branch)} | ${cell(r.frontmatter.owner)} | ${cell(r.frontmatter.type)} |`
    ),
    "",
  ];
  writeText(path.join(indexDir, "performance.md"), lines.join("\n"));
}

function writeDecisionsIndex(indexDir: string, records: MemoryRecord[]): void {
  const adrs = records.filter((r) => r.kind === "decisions");
  const lines = [
    "# Decision index (ADRs)",
    "",
    "| ID | Title |",
    "|----|-------|",
    ...adrs.map((r) => `| ${cell(r.id)} | ${cell(r.frontmatter.title)} |`),
    "",
  ];
  writeText(path.join(indexDir, "decisions.md"), lines.join("\n"));
}

function writePatternsIndex(indexDir: string, records: MemoryRecord[]): void {
  const pats = records.filter((r) => r.kind === "patterns");
  const lines = [
    "# Pattern index",
    "",
    "| ID | Title |",
    "|----|-------|",
    ...pats.map((r) => `| ${cell(r.id)} | ${cell(r.frontmatter.title)} |`),
    "",
  ];
  writeText(path.join(indexDir, "patterns.md"), lines.join("\n"));
}

export function rebuildMemoryIndexes(paths: ProjectPaths, records: MemoryRecord[]): void {
  writeBugsIndex(paths.indexDir, records);
  writeFeaturesIndex(paths.indexDir, records);
  writePerformanceIndex(paths.indexDir, records);
  writeDecisionsIndex(paths.indexDir, records);
  writePatternsIndex(paths.indexDir, records);
}
