/**
 * doctor command — checks if Engineering OS is set up correctly.
 */

import type { Command } from "commander";
import path from "node:path";
import { CLAUDE_SKILLS_DIR, CURSOR_SKILLS_DIR, LOCKFILE_NAME } from "../lib/constants.js";
import { check, confirm, intro, log, outro } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { loadMemoryRecords } from "../lib/memory-records.js";
import { getProjectPaths } from "../lib/paths.js";
import { validateAllRecords } from "../lib/validate-schema.js";
import { exists } from "../lib/fs.js";
import { readLockfile } from "../lib/lockfile.js";

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check Engineering OS setup in the current project")
    .option("--no-prompt", "Skip interactive prompts")
    .action(async (_options, command: Command) => {
      await withPromptGuard(async () => {
        const cwd = process.cwd();
        const paths = getProjectPaths(cwd);
        const lockfile = path.join(cwd, LOCKFILE_NAME);
        const interactive = shouldPrompt(command, _options.noPrompt);

        if (interactive) {
          intro("Doctor", "Verify Engineering OS is set up correctly");
        }

        const checks: { label: string; ok: boolean }[] = [
          { label: `.ai/ directory`, ok: exists(paths.aiDir) },
          { label: `.ai/memory/`, ok: exists(paths.memoryDir) },
          { label: `.ai/index/`, ok: exists(paths.indexDir) },
          { label: `${LOCKFILE_NAME}`, ok: exists(lockfile) },
          {
            label: `design-system.md`,
            ok: exists(path.join(paths.aiDir, "design-system.md")),
          },
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

        for (const c of checks) {
          check(c.ok, c.label);
        }

        const setupOk = checks.every((c) => c.ok);
        let memoryOk = true;

        if (exists(paths.memoryDir)) {
          const records = loadMemoryRecords(paths);
          const issues = validateAllRecords(records);
          log.info(`Memory: ${records.length} record(s)`);

          if (issues.length === 0) {
            log.success("Memory records valid");
          } else {
            memoryOk = false;
            log.warn(`${issues.length} memory validation issue(s):`);
            for (const issue of issues) {
              log.error(issue.file);
              log.info(`  ${issue.message}`);
            }
            log.info("Fix records or run: engineering-os validate");
          }
        }

        if (setupOk && memoryOk) {
          outro("All checks passed.");
        } else if (setupOk) {
          log.warn("Setup OK — fix memory validation issues above.");
          process.exit(1);
        } else {
          log.warn("Some setup checks failed.");
          if (interactive) {
            const runInit = await confirm("Run engineering-os init to fix setup?", false);
            if (runInit) log.info("Run: engineering-os init");
          } else {
            log.info("Run: engineering-os init");
          }
          process.exit(1);
        }
      });
    });
}
