/**
 * Single place for version and path constants.
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const PACKAGE_VERSION = "0.1.0";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** CLI package root (packages/cli) */
export const CLI_ROOT = path.resolve(__dirname, "..", "..");

/** Core: bundled core/ when published, else sibling packages/core in monorepo */
const bundledCore = path.join(CLI_ROOT, "core");
const siblingCore = path.resolve(CLI_ROOT, "..", "core");
export const CORE_ROOT = fs.existsSync(bundledCore) ? bundledCore : siblingCore;

export const LOCKFILE_NAME = "engineering-os.lock.json";
export const AI_DIR_NAME = ".ai";

/** Adapter paths inside a target project */
export const CURSOR_SKILLS_DIR = ".cursor/skills/engineering-os";
export const CURSOR_RULES_FILE = ".cursor/rules/engineering-os.mdc";
export const CLAUDE_SKILLS_DIR = ".claude/skills/engineering-os";
export const CLAUDE_MD_FILE = "CLAUDE.md";
