/**
 * init command — bootstrap .ai/ in the current project.
 */

import type { Command } from "commander";
import { detectProject } from "../lib/detect-project.js";
import { getGitInfo } from "../lib/git.js";
import { installAdapters } from "../lib/install-adapters.js";
import { writeLockfile } from "../lib/lockfile.js";
import { getProjectPaths } from "../lib/paths.js";
import { scaffoldAiDirectory } from "../lib/scaffold-ai.js";
import { exists } from "../lib/fs.js";
import { formatDesignSystemDraft, scanComponents } from "../lib/scan-components.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Bootstrap Engineering OS in the current project")
    .option("--no-cursor", "Skip Cursor adapter")
    .option("--no-claude", "Skip Claude Code adapter")
    .option("--profile <name>", "Project profile (nextjs, react, node, fullstack)")
    .option("--force", "Overwrite existing .ai/ constitution files")
    .option("--scan", "Auto-scan components into design-system.md")
    .action(async (options) => {
      const paths = getProjectPaths();
      const detection = detectProject(paths.root);
      const git = getGitInfo(paths.root);

      const profile = options.profile ?? detection.profile;
      const harnesses = {
        cursor: options.cursor !== false,
        claude: options.claude !== false,
      };

      console.log("\nEngineering OS — init\n");
      console.log(`Project:  ${detection.projectName}`);
      console.log(`Profile:  ${profile}`);
      console.log(`Git:      ${git.isRepo ? `yes (${git.branch})` : "no"}`);
      console.log(`Owner:    ${git.userName ?? "(set git config user.name)"}`);
      console.log("");

      const aiExists = exists(paths.aiDir);

      if (aiExists && !options.force) {
        console.log("`.ai/` already exists — skipping constitution scaffold (use --force to overwrite).");
        console.log("Memory in .ai/memory/ is never deleted.\n");
      } else {
        scaffoldAiDirectory({ projectName: detection.projectName, paths });
        console.log("Scaffolded .ai/ constitution + memory directories.");
      }

      if (options.scan) {
        const scan = scanComponents(paths.root);
        const draft = formatDesignSystemDraft(scan, detection.projectName);
        console.log("\n--- Design system scan (review before saving) ---\n");
        console.log(`Found ${scan.components.length} component(s)\n`);
        console.log(draft);
        console.log("\nSave with: engineering-os scan components --write\n");
      }

      installAdapters({ projectRoot: paths.root, ...harnesses });
      writeLockfile(paths.lockfile, profile, harnesses);

      console.log("\nInstalled:");
      if (harnesses.cursor) console.log("  .cursor/skills/engineering-os/");
      if (harnesses.claude) console.log("  .claude/skills/engineering-os/");
      console.log("  engineering-os.lock.json");
      console.log("\nRun:  engineering-os doctor\n");
    });
}
