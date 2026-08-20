/**
 * report command — generate HTML dashboard from memory.
 */

import path from "node:path";
import { execSync } from "node:child_process";
import type { Command } from "commander";
import { loadMemoryRecords } from "../lib/memory-records.js";
import { getProjectPaths } from "../lib/paths.js";
import { generateDashboardHtml } from "../lib/report/dashboard-html.js";
import { writeText, exists } from "../lib/fs.js";

function monthRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function registerReportCommand(program: Command): void {
  program
    .command("report")
    .description("Generate HTML dashboard from .ai/memory")
    .option("--period <name>", "month (default) or release")
    .option("--tag <release>", "Release tag when --period release")
    .option("--from <date>", "Start date YYYY-MM-DD")
    .option("--to <date>", "End date YYYY-MM-DD")
    .option("--open", "Open report in browser after generation")
    .action((options: {
      period?: string;
      tag?: string;
      from?: string;
      to?: string;
      open?: boolean;
    }) => {
      const paths = getProjectPaths();

      if (!exists(paths.memoryDir)) {
        console.error("\nNo .ai/memory/ found.\n");
        process.exit(1);
      }

      let from = options.from;
      let to = options.to;
      let release = options.tag;

      if (options.period === "month" || (!options.period && !from && !to)) {
        const range = monthRange();
        from = from ?? range.from;
        to = to ?? range.to;
      }

      const records = loadMemoryRecords(paths);
      const html = generateDashboardHtml(records, { from, to, release });

      const outPath = path.join(paths.reportsDir, "dashboard.html");
      writeText(outPath, html);

      console.log(`\nReport written: ${outPath}\n`);

      if (options.open) {
        try {
          execSync(`open "${outPath}"`, { stdio: "ignore" });
        } catch {
          console.log("(Could not auto-open browser — open the file manually)\n");
        }
      }
    });
}
