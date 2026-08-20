/**
 * Install Cursor and Claude adapters into a target project.
 */

import path from "node:path";
import {
  CLAUDE_MD_FILE,
  CLAUDE_SKILLS_DIR,
  CORE_ROOT,
  CURSOR_RULES_FILE,
  CURSOR_SKILLS_DIR,
} from "./constants.js";
import { copyDir, ensureDir, exists, readText, writeText } from "./fs.js";

export type AdapterOptions = {
  projectRoot: string;
  cursor: boolean;
  claude: boolean;
};

export function installAdapters(options: AdapterOptions): void {
  const skillsSrc = path.join(CORE_ROOT, "skills");

  if (options.cursor) {
    installCursor(options.projectRoot, skillsSrc);
  }

  if (options.claude) {
    installClaude(options.projectRoot, skillsSrc);
  }
}

function installCursor(projectRoot: string, skillsSrc: string): void {
  const destSkills = path.join(projectRoot, CURSOR_SKILLS_DIR);
  copyDir(skillsSrc, destSkills);

  const rulesPath = path.join(projectRoot, CURSOR_RULES_FILE);
  ensureDir(path.dirname(rulesPath));

  const rule = `---
description: Engineering OS — read project knowledge before coding
alwaysApply: true
---

Before bug fixes or features:
1. Read \`.ai/project.md\`, \`.ai/conventions.md\`, \`.ai/design-system.md\`
2. Search \`.ai/memory/\` and \`.ai/index/\` for similar past work
3. Use skills in \`.cursor/skills/engineering-os/\`

After significant work: capture knowledge in \`.ai/memory/\` via knowledge-capture skill.
`;

  writeText(rulesPath, rule);
}

function installClaude(projectRoot: string, skillsSrc: string): void {
  const destSkills = path.join(projectRoot, CLAUDE_SKILLS_DIR);
  copyDir(skillsSrc, destSkills);

  const snippet = `
<!-- engineering-os:start -->
## Engineering OS

Before coding: read \`.ai/\` constitution and search \`.ai/memory/\`.
Skills: \`.claude/skills/engineering-os/\`
After tasks: update memory records (bugs, features, performance).
<!-- engineering-os:end -->
`;

  const claudePath = path.join(projectRoot, CLAUDE_MD_FILE);

  if (exists(claudePath)) {
    const current = readText(claudePath);
    if (current.includes("engineering-os:start")) return;
    writeText(claudePath, `${current.trim()}\n${snippet}`);
  } else {
    writeText(claudePath, `# Claude Code\n${snippet}`);
  }
}
