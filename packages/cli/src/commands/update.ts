/**
 * update command — upgrade skills/adapters without touching .ai/memory/.
 */

import type { Command } from "commander";
import { PACKAGE_VERSION } from "../lib/constants.js";
import { confirm, intro, log, multiselect, note, outro, withSpinner } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { installAdapters } from "../lib/install-adapters.js";
import { readLockfile, writeLockfile } from "../lib/lockfile.js";
import { getProjectPaths } from "../lib/paths.js";
import { exists } from "../lib/fs.js";

export function registerUpdateCommand(program: Command): void {
  program
    .command("update")
    .description("Update Engineering OS skills and adapters (preserves .ai/memory/)")
    .option("--cursor", "Update Cursor adapter only")
    .option("--claude", "Update Claude adapter only")
    .option("--no-prompt", "Skip interactive prompts")
    .action(
      async (
        options: { cursor?: boolean; claude?: boolean; noPrompt?: boolean },
        command: Command
      ) => {
        await withPromptGuard(async () => {
          const paths = getProjectPaths();

          if (!exists(paths.lockfile)) {
            log.error("No engineering-os.lock.json — run init first.");
            process.exit(1);
          }

          const lock = readLockfile(paths.lockfile);
          let cursor = options.cursor ?? lock.harnesses.cursor;
          let claude = options.claude ?? lock.harnesses.claude;
          const interactive = shouldPrompt(command, options.noPrompt);

          if (interactive) {
            intro("Update", "Refresh skills and adapters — .ai/memory/ is never touched");

            note(
              [`Kit version:  ${PACKAGE_VERSION}`, `Installed:    ${lock.version}`].join("\n"),
              "Version"
            );

            const proceed = await confirm("Update Engineering OS in this project?", true);
            if (proceed === null || !proceed) return;

            if (!options.cursor && !options.claude) {
              const adapterOptions = [
                ...(lock.harnesses.cursor
                  ? [{ value: "cursor" as const, label: "Cursor", hint: "skills + rules" }]
                  : []),
                ...(lock.harnesses.claude
                  ? [{ value: "claude" as const, label: "Claude Code", hint: "skills + CLAUDE.md" }]
                  : []),
              ];

              if (adapterOptions.length > 0) {
                const selected = await multiselect("Which adapters to update?", adapterOptions, {
                  initialValues: adapterOptions.map((a) => a.value),
                });
                if (selected === null) return;
                cursor = selected.includes("cursor");
                claude = selected.includes("claude");
              }
            }

            if (!cursor && !claude) {
              log.warn("No adapters selected — nothing to update.");
              return;
            }

            const confirmed = await confirm(
              "Preserving .ai/memory/ and constitution preserve blocks. Continue?",
              true
            );
            if (confirmed === null || !confirmed) return;
          } else {
            log.info(`Kit version: ${PACKAGE_VERSION}`);
          }

          await withSpinner("Updating adapters…", async () => {
            installAdapters({ projectRoot: paths.root, cursor, claude });
            writeLockfile(paths.lockfile, lock.profile, { cursor, claude });
          });

          if (cursor) log.success("Cursor skills + rules updated");
          if (claude) log.success("Claude skills + CLAUDE.md snippet updated");

          outro("Next: engineering-os doctor");
        });
      }
    );
}
