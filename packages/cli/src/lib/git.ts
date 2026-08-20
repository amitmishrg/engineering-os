/**
 * Git helpers for branch + owner attribution in memory records.
 */

import { execSync } from "node:child_process";

export type GitInfo = {
  isRepo: boolean;
  branch: string | null;
  userName: string | null;
};

export function getGitInfo(cwd: string): GitInfo {
  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd, stdio: "ignore" });

    const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf8" }).trim();
    let userName: string | null = null;

    try {
      userName = execSync("git config user.name", { cwd, encoding: "utf8" }).trim();
    } catch {
      userName = null;
    }

    return { isRepo: true, branch, userName };
  } catch {
    return { isRepo: false, branch: null, userName: null };
  }
}
