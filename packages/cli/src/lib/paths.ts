/**
 * Resolve paths inside a target project (where the user runs engineering-os).
 */

import path from "node:path";
import { AI_DIR_NAME, LOCKFILE_NAME } from "./constants.js";

export type ProjectPaths = {
  root: string;
  aiDir: string;
  memoryDir: string;
  indexDir: string;
  reportsDir: string;
  lockfile: string;
};

export function getProjectPaths(cwd: string = process.cwd()): ProjectPaths {
  const aiDir = path.join(cwd, AI_DIR_NAME);

  return {
    root: cwd,
    aiDir,
    memoryDir: path.join(aiDir, "memory"),
    indexDir: path.join(aiDir, "index"),
    reportsDir: path.join(aiDir, "reports"),
    lockfile: path.join(cwd, LOCKFILE_NAME),
  };
}
