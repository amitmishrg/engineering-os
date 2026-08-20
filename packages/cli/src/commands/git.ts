/**
 * git command — helpers for branch attribution.
 */

import type { Command } from "commander";
import { intro, log, plainLine } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { getGitInfo } from "../lib/git.js";

export function registerGitCommand(program: Command): void {
  const git = program.command("git").description("Git helpers for memory records");

  git
    .command("branch")
    .description("Print current git branch (for memory record tagging)")
    .option("--no-prompt", "Skip interactive prompts")
    .action(async (options: { noPrompt?: boolean }, command: Command) => {
      await withPromptGuard(async () => {
        const info = getGitInfo(process.cwd());
        const interactive = shouldPrompt(command, options.noPrompt);

        if (!info.isRepo || !info.branch) {
          if (interactive) {
            intro("Git branch", "Current branch for memory record tagging");
            log.error("Not a git repo or detached HEAD.");
          }
          log.error("Provide branch manually in memory records.");
          process.exit(1);
        }

        if (interactive) {
          intro("Git branch", "Current branch for memory record tagging");
          log.success(info.branch);
        } else {
          plainLine(info.branch);
        }
      });
    });
}
