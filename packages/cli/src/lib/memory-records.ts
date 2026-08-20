/**
 * Load all memory records from .ai/memory subdirectories.
 */

import fs from "node:fs";
import path from "node:path";
import { parseMarkdownFile, type ParsedMarkdown } from "./frontmatter.js";
import { readText, exists } from "./fs.js";
import type { ProjectPaths } from "./paths.js";

export type MemoryKind =
  "bugs" | "features" | "performance" | "decisions" | "patterns" | "incidents";

export type MemoryRecord = ParsedMarkdown & {
  kind: MemoryKind;
  id: string;
};

const KINDS: MemoryKind[] = [
  "bugs",
  "features",
  "performance",
  "decisions",
  "patterns",
  "incidents",
];

export function loadMemoryRecords(paths: ProjectPaths): MemoryRecord[] {
  const records: MemoryRecord[] = [];

  for (const kind of KINDS) {
    const dir = path.join(paths.memoryDir, kind);
    if (!exists(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const filePath = path.join(dir, file);
      const parsed = parseMarkdownFile(filePath, readText(filePath));
      const id = String(parsed.frontmatter.id ?? file.replace(/\.md$/, ""));

      records.push({ ...parsed, kind, id });
    }
  }

  return records;
}

export function filterRecords(
  records: MemoryRecord[],
  query: string,
  branch?: string
): MemoryRecord[] {
  const q = query.toLowerCase();

  return records.filter((r) => {
    if (branch && r.frontmatter.branch !== branch) return false;

    const haystack = [
      r.id,
      r.frontmatter.title,
      r.frontmatter.root_cause,
      r.frontmatter.why,
      ...(Array.isArray(r.frontmatter.tags) ? r.frontmatter.tags : []),
      ...(Array.isArray(r.frontmatter.symptoms) ? r.frontmatter.symptoms : []),
      r.body,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
