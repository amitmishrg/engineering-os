/**
 * doctor command — checks if Engineering OS is set up correctly.
 */

import type { Command } from "commander";
import path from "node:path";
import {
  CLAUDE_SKILLS_DIR,
  CURSOR_SKILLS_DIR,
  LOCKFILE_NAME,
} from "../lib/constants.js";
import { loadMemoryRecords } from "../lib/memory-records.js";
import { getProjectPaths } from "../lib/paths.js";
import { validateAllRecords } from "../lib/validate-schema.js";
import { exists } from "../lib/fs.js";
import { readLockfile } from "../lib/lockfile.js";

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check Engineering OS setup in the current project")
    .action(() => {
      const cwd = process.cwd();
      const paths = getProjectPaths(cwd);
      const lockfile = path.join(cwd, LOCKFILE_NAME);

      console.log("\nEngineering OS — doctor\n");

      const checks: { label: string; ok: boolean; hint?: string }[] = [
        { label: `.ai/ directory`, ok: exists(paths.aiDir) },
        { label: `.ai/memory/`, ok: exists(paths.memoryDir) },
        { label: `.ai/index/`, ok: exists(paths.indexDir) },
        { label: `${LOCKFILE_NAME}`, ok: exists(lockfile) },
        { label: `design-system.md`, ok: exists(path.join(paths.aiDir, "design-system.md")) },
      ];

      if (exists(lockfile)) {
        const lock = readLockfile(lockfile);
        if (lock.harnesses.cursor) {
          checks.push({
            label: "Cursor skills",
            ok: exists(path.join(cwd, CURSOR_SKILLS_DIR)),
          });
        }
        if (lock.harnesses.claude) {
          checks.push({
            label: "Claude skills",
            ok: exists(path.join(cwd, CLAUDE_SKILLS_DIR)),
          });
        }
      }

      for (const check of checks) {
        console.log(`  ${check.ok ? "✓" : "✗"} ${check.label}`);
      }

      if (exists(paths.memoryDir)) {
        const records = loadMemoryRecords(paths);
        const issues = validateAllRecords(records);
        console.log(`\n  Memory: ${records.length} record(s), ${issues.length} validation issue(s)`);
      }

      const allOk = checks.every((c) => c.ok);
      console.log(allOk ? "\nAll checks passed.\n" : "\nSome checks failed. Run: engineering-os init\n");
    });
}
