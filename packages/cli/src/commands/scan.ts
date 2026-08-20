/**
 * scan command — auto-scan components (plan: `scan components`)
 */

import type { Command } from "commander";
import { detectProject } from "../lib/detect-project.js";
import {
  formatDesignSystemDraft,
  scanComponents,
  writeDesignSystem,
} from "../lib/scan-components.js";
import { exists } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";

function runScan(options: { write?: boolean }): void {
  const paths = getProjectPaths();
  const detection = detectProject(paths.root);

  if (!exists(paths.aiDir)) {
    console.error("\nRun engineering-os init first.\n");
    process.exit(1);
  }

  const scan = scanComponents(paths.root);
  const draft = formatDesignSystemDraft(scan, detection.projectName);

  console.log("\n--- Design system scan draft ---\n");
  console.log(`Found ${scan.components.length} component(s) in ${scan.componentDirs.length} dir(s)\n`);

  if (options.write) {
    writeDesignSystem(paths.root, draft);
    console.log("Wrote .ai/design-system.md — review and edit before committing.\n");
    return;
  }

  console.log(draft);
  console.log("\nReview the draft. Save with: engineering-os scan components --write\n");
}

export function registerScanCommand(program: Command): void {
  const scan = program.command("scan").description("Design system scanning tools");

  scan
    .command("components")
    .description("Scan UI components; use --write after reviewing draft")
    .option("--write", "Save draft to .ai/design-system.md")
    .action((options: { write?: boolean }) => runScan(options));
}
