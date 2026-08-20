/**
 * validate command — lint .ai/memory records against JSON schemas.
 */

import type { Command } from "commander";
import { loadMemoryRecords } from "../lib/memory-records.js";
import { getProjectPaths } from "../lib/paths.js";
import { validateAllRecords } from "../lib/validate-schema.js";
import { exists } from "../lib/fs.js";

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate .ai/memory records against schemas")
    .action(() => {
      const paths = getProjectPaths();

      if (!exists(paths.memoryDir)) {
        console.error("\nNo .ai/memory/ found. Run: engineering-os init\n");
        process.exit(1);
      }

      const records = loadMemoryRecords(paths);
      const issues = validateAllRecords(records);

      console.log(`\nValidated ${records.length} memory record(s)\n`);

      if (issues.length === 0) {
        console.log("All records valid.\n");
        return;
      }

      for (const issue of issues) {
        console.log(`  ✗ ${issue.file}`);
        console.log(`    ${issue.message}`);
      }

      console.log(`\n${issues.length} issue(s) found.\n`);
      process.exit(1);
    });
}
