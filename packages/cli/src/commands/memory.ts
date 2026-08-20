/**
 * memory command — index rebuild and search.
 */

import type { Command } from "commander";
import { filterRecords, loadMemoryRecords } from "../lib/memory-records.js";
import { rebuildMemoryIndexes } from "../lib/memory-index.js";
import { getProjectPaths } from "../lib/paths.js";
import { exists } from "../lib/fs.js";

export function registerMemoryCommand(program: Command): void {
  const memory = program.command("memory").description("Manage engineering memory");

  memory
    .command("index")
    .description("Rebuild .ai/index/*.md from memory records")
    .action(() => {
      const paths = getProjectPaths();

      if (!exists(paths.memoryDir)) {
        console.error("\nNo .ai/memory/ found.\n");
        process.exit(1);
      }

      const records = loadMemoryRecords(paths);
      rebuildMemoryIndexes(paths, records);

      console.log(`\nIndexed ${records.length} record(s) into .ai/index/\n`);
    });

  memory
    .command("search")
    .description("Search memory records")
    .argument("<query>", "Search text")
    .option("--branch <name>", "Filter by git branch")
    .action((query: string, options: { branch?: string }) => {
      const paths = getProjectPaths();
      const records = loadMemoryRecords(paths);
      const matches = filterRecords(records, query, options.branch);

      console.log(`\n${matches.length} match(es) for "${query}"\n`);

      for (const r of matches) {
        console.log(`  ${r.id}  ${r.frontmatter.title ?? ""}  [${r.kind}]  branch=${r.frontmatter.branch ?? "—"}`);
      }

      console.log("");
    });
}
