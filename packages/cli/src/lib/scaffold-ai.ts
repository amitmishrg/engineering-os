/**
 * Copy core templates into a project's .ai/ directory.
 */

import path from "node:path";
import { CORE_ROOT } from "./constants.js";
import { copyDir, ensureDir, exists, readText, writeText } from "./fs.js";
import type { ProjectPaths } from "./paths.js";

const MEMORY_SUBDIRS = [
  "bugs",
  "features",
  "performance",
  "decisions",
  "patterns",
  "incidents",
] as const;

export type InitTemplateOptions = {
  projectName: string;
  paths: ProjectPaths;
};

export function scaffoldAiDirectory(options: InitTemplateOptions): void {
  const templatesRoot = path.join(CORE_ROOT, "templates", "ai");
  const { paths, projectName } = options;

  if (!exists(templatesRoot)) {
    throw new Error(`Templates not found at ${templatesRoot}`);
  }

  // Copy constitution markdown files
  copyDir(templatesRoot, paths.aiDir);

  // Replace {{PROJECT_NAME}} in project.md
  const projectMdPath = path.join(paths.aiDir, "project.md");
  const projectMd = copyWithPlaceholder(projectMdPath, projectName);

  writeText(projectMdPath, projectMd);

  // Empty memory + index + reports dirs
  for (const sub of MEMORY_SUBDIRS) {
    ensureDir(path.join(paths.memoryDir, sub));
  }

  ensureDir(paths.indexDir);
  ensureDir(path.join(paths.aiDir, "attachments", "features"));

  // Seed index files so doctor can detect them
  writeText(
    path.join(paths.indexDir, "bugs.md"),
    "# Bug index\n\n| ID | Title | Branch | Owner | Resolved |\n|----|-------|--------|-------|----------|\n"
  );
  writeText(
    path.join(paths.indexDir, "features.md"),
    "# Feature index\n\n| ID | Title | Branch | Owner | Status |\n|----|-------|--------|-------|--------|\n"
  );
  writeText(
    path.join(paths.indexDir, "performance.md"),
    "# Performance index\n\n| ID | Title | Branch | Owner | Type |\n|----|-------|--------|-------|------|\n"
  );
  writeText(
    path.join(paths.indexDir, "decisions.md"),
    "# Decision index (ADRs)\n\n| ID | Title |\n|----|-------|\n"
  );
  writeText(
    path.join(paths.indexDir, "patterns.md"),
    "# Pattern index\n\n| ID | Title |\n|----|-------|\n"
  );

  // Copy memory templates for reference (not auto-filled)
  const memoryTemplates = path.join(CORE_ROOT, "templates", "memory");
  if (exists(memoryTemplates)) {
    ensureDir(path.join(paths.aiDir, "templates"));
    copyDir(memoryTemplates, path.join(paths.aiDir, "templates", "memory"));
  }
}

function copyWithPlaceholder(projectMdPath: string, projectName: string): string {
  return readText(projectMdPath).replace(/\{\{PROJECT_NAME\}\}/g, projectName);
}
