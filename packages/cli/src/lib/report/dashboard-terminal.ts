/**
 * Print engineering report as interactive terminal tables.
 */

import type { MemoryRecord } from "../memory-records.js";
import { printBorderedTable } from "../terminal-table.js";
import type { ReportData } from "./report-data.js";

export type ReportSection = "contributions" | "features" | "bugs" | "performance";

export const REPORT_SECTIONS: ReportSection[] = [
  "contributions",
  "features",
  "bugs",
  "performance",
];

const SECTION_LABELS: Record<ReportSection, string> = {
  contributions: "Contributions",
  features: "Features",
  bugs: "Bug fixes",
  performance: "Performance",
};

function perfResolvedAt(r: MemoryRecord): string {
  const value = r.frontmatter.resolved_at;
  return value ? String(value) : "—";
}

export function printReportSummary(data: ReportData): void {
  printBorderedTable(
    "Summary",
    ["Metric", "Value"],
    [
      ["Period", data.periodLabel],
      ["Features", String(data.features.length)],
      ["Bug fixes", String(data.bugs.length)],
      ["Performance", String(data.perf.length)],
      ["Contributors", String(data.owners.size)],
    ],
    { colWidths: [14, 36], align: ["left", "left"] }
  );
}

export function printReportSection(data: ReportData, section: ReportSection): void {
  switch (section) {
    case "contributions": {
      const rows = [...data.owners.entries()]
        .sort(
          (a, b) => b[1].features + b[1].bugs + b[1].perf - (a[1].features + a[1].bugs + a[1].perf)
        )
        .map(([name, c]) => [
          name,
          String(c.features),
          String(c.bugs),
          String(c.perf),
          String(c.features + c.bugs + c.perf),
        ]);
      printBorderedTable(
        SECTION_LABELS.contributions,
        ["Owner", "Features", "Bugs", "Perf", "Total"],
        rows,
        {
          colWidths: [16, 10, 8, 8, 8],
          align: ["left", "right", "right", "right", "right"],
        }
      );
      break;
    }
    case "features": {
      const rows = data.features.map((r) => [
        r.id,
        String(r.frontmatter.title ?? ""),
        String(r.frontmatter.owner ?? ""),
        String(r.frontmatter.status ?? ""),
        String(r.frontmatter.branch ?? ""),
      ]);
      printBorderedTable(
        SECTION_LABELS.features,
        ["ID", "Title", "Owner", "Status", "Branch"],
        rows,
        { colWidths: [18, 28, 14, 12, 16] }
      );
      break;
    }
    case "bugs": {
      const rows = data.bugs.map((r) => [
        r.id,
        String(r.frontmatter.title ?? ""),
        String(r.frontmatter.root_cause ?? ""),
        String(r.frontmatter.owner ?? ""),
        String(r.frontmatter.branch ?? ""),
      ]);
      printBorderedTable(
        SECTION_LABELS.bugs,
        ["ID", "Title", "Root cause", "Owner", "Branch"],
        rows,
        { colWidths: [18, 24, 24, 14, 16] }
      );
      break;
    }
    case "performance": {
      const rows = data.perf.map((r) => [
        r.id,
        String(r.frontmatter.title ?? ""),
        String(r.frontmatter.type ?? ""),
        String(r.frontmatter.owner ?? ""),
        perfResolvedAt(r),
      ]);
      printBorderedTable(
        SECTION_LABELS.performance,
        ["ID", "Title", "Type", "Owner", "Resolved"],
        rows,
        { colWidths: [18, 24, 12, 14, 28] }
      );
      break;
    }
  }
}

export function printReport(data: ReportData, sections: ReportSection[]): void {
  printReportSummary(data);
  for (const section of sections) {
    printReportSection(data, section);
  }
  console.log("");
}

export function sectionLabel(section: ReportSection): string {
  return SECTION_LABELS[section];
}
