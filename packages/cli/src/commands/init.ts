/**
 * init command — bootstrap .ai/ in the current project.
 */

import type { Command } from "commander";
import { detectProject, type ProjectProfile } from "../lib/detect-project.js";
import { getGitInfo } from "../lib/git.js";
import { confirm, intro, log, multiselect, note, outro, withSpinner } from "../lib/cli-ui.js";
import { getNoPrompt, shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { installAdapters } from "../lib/install-adapters.js";
import { writeLockfile } from "../lib/lockfile.js";
import { getProjectPaths } from "../lib/paths.js";
import { resolveScanRoots } from "../lib/prompt-scan-roots.js";
import { scaffoldAiDirectory } from "../lib/scaffold-ai.js";
import { exists } from "../lib/fs.js";
import {
  formatDesignSystemDraft,
  scanComponents,
  writeDesignSystem,
} from "../lib/scan-components.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Bootstrap Engineering OS in the current project")
    .option("--no-cursor", "Skip Cursor adapter")
    .option("--no-claude", "Skip Claude Code adapter")
    .option("--profile <name>", "Project profile (nextjs, react, node, fullstack)")
    .option("--force", "Overwrite existing .ai/ constitution files")
    .option("--scan", "Run design system scan during init")
    .option("--no-prompt", "Skip interactive prompts")
    .action(async (options, command: Command) => {
      await withPromptGuard(async () => {
        const paths = getProjectPaths();
        const detection = detectProject(paths.root);
        const git = getGitInfo(paths.root);
        const interactive = shouldPrompt(command, options.noPrompt);

        let profile: ProjectProfile = options.profile ?? detection.profile;
        let harnesses = {
          cursor: options.cursor !== false,
          claude: options.claude !== false,
        };
        let runScan = Boolean(options.scan);
        let writeScan = false;

        if (interactive) {
          intro("Initialize Engineering OS", "Bootstrap .ai/ and install agent skills");

          note(
            [
              `Project:  ${detection.projectName}`,
              `Detected: ${detection.profile}`,
              `Git:      ${git.isRepo ? `yes (${git.branch})` : "no"}`,
              `Owner:    ${git.userName ?? "(set git config user.name)"}`,
            ].join("\n"),
            "Project"
          );

          const adapterOptions = [
            {
              value: "cursor" as const,
              label: "Cursor",
              hint: ".cursor/skills + rules",
            },
            {
              value: "claude" as const,
              label: "Claude Code",
              hint: ".claude/skills + CLAUDE.md",
            },
          ].filter((a) =>
            a.value === "cursor" ? options.cursor !== false : options.claude !== false
          );

          const initialAdapters = adapterOptions
            .map((a) => a.value)
            .filter((v) => (v === "cursor" ? harnesses.cursor : harnesses.claude));

          const selectedHarnesses = await multiselect("Install adapters for", adapterOptions, {
            initialValues: initialAdapters,
          });
          if (selectedHarnesses === null) return;

          harnesses = {
            cursor: selectedHarnesses.includes("cursor"),
            claude: selectedHarnesses.includes("claude"),
          };

          if (!options.scan) {
            const scanNow = await confirm("Scan design-system primitives now?", true);
            if (scanNow === null) return;
            runScan = scanNow;
          }

          if (runScan) {
            const saveScan = await confirm(
              "Save scan results to .ai/design-system.md after review?",
              false
            );
            if (saveScan === null) return;
            writeScan = saveScan;
          }

          const proceed = await confirm("Proceed with init?", true);
          if (proceed === null || !proceed) return;
        } else {
          log.info(`Project: ${detection.projectName} · Profile: ${profile}`);
        }

        const aiExists = exists(paths.aiDir);

        if (aiExists && !options.force) {
          log.warn("`.ai/` already exists — skipping constitution (use --force to overwrite).");
          log.info("Memory in .ai/memory/ is never deleted.");
        } else {
          await withSpinner("Scaffolding .ai/ constitution + memory…", async () => {
            scaffoldAiDirectory({ projectName: detection.projectName, paths });
          });
        }

        if (runScan) {
          const { roots, all } = await resolveScanRoots(paths.root, {
            noPrompt: getNoPrompt(command, options.noPrompt),
          });
          const scan = scanComponents(paths.root, { roots, all });
          const draft = formatDesignSystemDraft(scan, detection.projectName, paths.root);

          log.info(
            `Found ${scan.components.length} primitive(s) in ${scan.designSystemRoots.length} root(s)`
          );

          if (writeScan) {
            writeDesignSystem(paths.root, draft);
            log.success("Wrote .ai/design-system.md — review before committing.");
          } else {
            console.log(`\n${draft}`);
            log.info("Save with: engineering-os scan components --write");
          }
        }

        await withSpinner("Installing adapters…", async () => {
          installAdapters({ projectRoot: paths.root, ...harnesses });
          writeLockfile(paths.lockfile, profile, harnesses);
        });

        if (harnesses.cursor) log.success("Cursor skills installed");
        if (harnesses.claude) log.success("Claude skills installed");
        log.success("engineering-os.lock.json created");

        outro("Next: engineering-os doctor");
      });
    });
}
