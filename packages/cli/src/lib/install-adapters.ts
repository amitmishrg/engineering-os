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

## /feature (mandatory)

Before any feature code:
1. Follow \`feature-intake\` skill — ask Why, PRD, Figma/design, success criteria; wait for answers
2. Create a **new** \`.ai/memory/features/FEAT-YYYY-NNNN-slug.md\` (increment ID; never overwrite other FEAT files)
3. User confirms intake, then plan, then implement

## Memory

- One feature = one FEAT file. Multiple features = multiple files.
- After significant work: update the correct record via \`knowledge-capture\`; run \`engineering-os memory index\` and \`engineering-os validate\`
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

/feature: run feature-intake first — ask Why, PRD, Figma/design; create a **new** FEAT-*.md (never overwrite other features).
After tasks: update the correct memory record; run \`engineering-os memory index\` and \`engineering-os validate\`.
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
