/**
 * git command — helpers for branch attribution.
 */

import type { Command } from "commander";
import { getGitInfo } from "../lib/git.js";

export function registerGitCommand(program: Command): void {
  const git = program.command("git").description("Git helpers for memory records");

  git
    .command("branch")
    .description("Print current git branch (for memory record tagging)")
    .action(() => {
      const info = getGitInfo(process.cwd());

      if (!info.isRepo || !info.branch) {
        console.error("\nNot a git repo or detached HEAD. Provide branch manually in memory records.\n");
        process.exit(1);
      }

      console.log(info.branch);
    });
}
