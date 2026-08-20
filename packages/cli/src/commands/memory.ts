/**
 * memory command — index rebuild and search.
 */

import type { Command } from "commander";
import { confirm, intro, log, outro, select, text, withSpinner } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { filterRecords, loadMemoryRecords } from "../lib/memory-records.js";
import { rebuildMemoryIndexes } from "../lib/memory-index.js";
import { getProjectPaths } from "../lib/paths.js";
import { exists } from "../lib/fs.js";

export function registerMemoryCommand(program: Command): void {
  const memory = program.command("memory").description("Manage engineering memory");

  memory
    .command("index")
    .description("Rebuild .ai/index/*.md from memory records")
    .option("--no-prompt", "Skip interactive prompts")
    .action(async (options: { noPrompt?: boolean }, command: Command) => {
      await withPromptGuard(async () => {
        const paths = getProjectPaths();

        if (!exists(paths.memoryDir)) {
          log.error("No .ai/memory/ found.");
          process.exit(1);
        }

        const records = loadMemoryRecords(paths);
        const interactive = shouldPrompt(command, options.noPrompt);

        if (interactive) {
          intro("Memory index", "Rebuild lookup tables in .ai/index/");
          log.info(`${records.length} record(s) found`);

          if (records.length > 0) {
            const proceed = await confirm("Rebuild index files?", true);
            if (proceed === null || !proceed) return;
          }
        }

        await withSpinner("Rebuilding indexes…", async () => {
          rebuildMemoryIndexes(paths, records);
        });

        outro(`Indexed ${records.length} record(s) into .ai/index/`);
      });
    });

  memory
    .command("search")
    .description("Search memory records")
    .argument("[query]", "Search text")
    .option("--branch <name>", "Filter by git branch")
    .option("--no-prompt", "Skip interactive prompts")
    .action(
      async (
        query: string | undefined,
        options: { branch?: string; noPrompt?: boolean },
        command: Command
      ) => {
        await withPromptGuard(async () => {
          const paths = getProjectPaths();
          const records = loadMemoryRecords(paths);
          const interactive = shouldPrompt(command, options.noPrompt);

          let searchQuery = query?.trim();
          let branch = options.branch;

          if (interactive && !searchQuery) {
            intro("Memory search", "Find past bugs, features, and decisions");
            const q = await text("Search query", { placeholder: "editor state, login bug…" });
            if (q === null) return;
            searchQuery = q;
          }

          if (!searchQuery) {
            log.error("Provide a search query: engineering-os memory search <query>");
            process.exit(1);
          }

          if (interactive && !branch) {
            const branches = [
              ...new Set(
                records.map((r) => r.frontmatter.branch).filter((b): b is string => Boolean(b))
              ),
            ].sort();

            if (branches.length > 0) {
              const picked = await select(
                "Filter by branch",
                [
                  { value: "", label: "All branches" },
                  ...branches.map((b) => ({ value: b, label: b })),
                ],
                ""
              );
              if (picked === null) return;
              branch = picked || undefined;
            }
          }

          const matches = filterRecords(records, searchQuery, branch);

          log.info(`${matches.length} match(es) for "${searchQuery}"`);

          if (matches.length === 0) {
            log.warn("No matches found.");
            return;
          }

          for (const r of matches) {
            log.step(
              `${r.id}  ${r.frontmatter.title ?? ""}  [${r.kind}]  branch=${r.frontmatter.branch ?? "—"}`
            );
          }
        });
      }
    );
}
