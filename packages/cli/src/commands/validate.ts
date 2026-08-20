/**
 * validate command — lint .ai/memory records against JSON schemas.
 */

import type { Command } from "commander";
import { intro, log, outro } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { loadMemoryRecords } from "../lib/memory-records.js";
import { getProjectPaths } from "../lib/paths.js";
import { validateAllRecords } from "../lib/validate-schema.js";
import { exists } from "../lib/fs.js";

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate .ai/memory records against schemas")
    .option("--no-prompt", "Skip interactive prompts")
    .action(async (_options, command: Command) => {
      await withPromptGuard(async () => {
        const paths = getProjectPaths();

        if (!exists(paths.memoryDir)) {
          log.error("No .ai/memory/ found. Run: engineering-os init");
          process.exit(1);
        }

        if (shouldPrompt(command, _options.noPrompt)) {
          intro("Validate", "Check memory records against JSON schemas");
        }

        const records = loadMemoryRecords(paths);
        const issues = validateAllRecords(records);

        log.info(`Validated ${records.length} memory record(s)`);

        if (issues.length === 0) {
          outro("All records valid.");
          return;
        }

        for (const issue of issues) {
          log.error(issue.file);
          log.info(`  ${issue.message}`);
        }

        log.error(`${issues.length} issue(s) found.`);
        process.exit(1);
      });
    });
}
