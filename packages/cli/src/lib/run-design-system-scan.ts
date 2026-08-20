/**
 * Shared scan flow for init --scan and scan components.
 */

import type { Command } from "commander";
import { intro, log, outro } from "./cli-ui.js";
import { detectProject } from "./detect-project.js";
import { exists } from "./fs.js";
import { getNoPrompt } from "./interactive.js";
import { getProjectPaths } from "./paths.js";
import { resolveScanRoots } from "./prompt-scan-roots.js";
import { formatDesignSystemDraft, scanComponents, writeDesignSystem } from "./scan-components.js";

export type RunDesignSystemScanOptions = {
  write?: boolean;
  roots?: string;
  all?: boolean;
  noPrompt?: boolean;
};

export async function runDesignSystemScan(
  options: RunDesignSystemScanOptions,
  command?: Command
): Promise<void> {
  const paths = getProjectPaths();
  const detection = detectProject(paths.root);
  const noPrompt = command ? getNoPrompt(command, options.noPrompt) : Boolean(options.noPrompt);

  if (!exists(paths.aiDir)) {
    log.error("Run engineering-os init first.");
    process.exit(1);
  }

  const explicitRoots = options.roots
    ?.split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const { roots, all } = await resolveScanRoots(paths.root, {
    roots: explicitRoots,
    all: options.all,
    noPrompt,
  });

  const scan = scanComponents(paths.root, { roots, all });
  const draft = formatDesignSystemDraft(scan, detection.projectName, paths.root);

  if (noPrompt || options.roots || options.all) {
    intro("Design system scan", "Find reusable UI primitives for .ai/design-system.md");
  }

  log.info(
    `Found ${scan.components.length} component(s) in ${scan.designSystemRoots.length} root(s) (${scan.mode} mode)`
  );

  if (scan.designSystemRoots.length === 0 && !all) {
    log.warn("Nothing scanned. Set a path in the prompt or use --roots.");
  }

  if (options.write) {
    writeDesignSystem(paths.root, draft);
    outro("Wrote .ai/design-system.md — review before committing.");
    return;
  }

  console.log(`\n${draft}`);
  log.info("Review the draft. Save with: engineering-os scan components --write");
}
