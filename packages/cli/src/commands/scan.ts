/**
 * scan command — auto-scan components (plan: `scan components`)
 */

import type { Command } from "commander";
import { runDesignSystemScan } from "../lib/run-design-system-scan.js";

export function registerScanCommand(program: Command): void {
  const scan = program.command("scan").description("Design system scanning tools");

  scan
    .command("components")
    .description("Scan reusable UI primitives for design-system.md")
    .option("--write", "Save draft to .ai/design-system.md")
    .option("--roots <paths>", "Comma-separated design-system folders (skips interactive prompt)")
    .option("--all", "Scan all of src/ (includes feature components — use for review only)")
    .option("--no-prompt", "Skip interactive path prompt")
    .action(
      async (
        options: {
          write?: boolean;
          roots?: string;
          all?: boolean;
          noPrompt?: boolean;
        },
        command: Command
      ) => {
        await runDesignSystemScan(options, command);
      }
    );
}
