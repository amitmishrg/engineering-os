/**
 * report command — generate HTML dashboard from memory.
 */

import path from "node:path";
import { execSync } from "node:child_process";
import type { Command } from "commander";
import { confirm, intro, log, outro, select, text, withSpinner } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
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
    .option("--no-prompt", "Skip interactive prompts")
    .action(
      async (
        options: {
          period?: string;
          tag?: string;
          from?: string;
          to?: string;
          open?: boolean;
          noPrompt?: boolean;
        },
        command: Command
      ) => {
        await withPromptGuard(async () => {
          const paths = getProjectPaths();

          if (!exists(paths.memoryDir)) {
            log.error("No .ai/memory/ found.");
            process.exit(1);
          }

          const interactive = shouldPrompt(command, options.noPrompt);
          let from = options.from;
          let to = options.to;
          let release = options.tag;
          let open = options.open ?? false;

          if (interactive && !options.period && !from && !to && !release) {
            intro("Report", "Generate HTML dashboard from engineering memory");

            const periodChoice = await select(
              "Report period",
              [
                { value: "month", label: "This month", hint: "Current calendar month" },
                { value: "custom", label: "Custom date range" },
                { value: "release", label: "Release tag" },
              ],
              "month"
            );
            if (periodChoice === null) return;

            if (periodChoice === "custom") {
              const fromInput = await text("Start date", { placeholder: "YYYY-MM-DD" });
              if (fromInput === null) return;
              from = fromInput;
              const toInput = await text("End date", { placeholder: "YYYY-MM-DD" });
              if (toInput === null) return;
              to = toInput;
            } else if (periodChoice === "release") {
              const tag = await text("Release tag", { placeholder: "v1.2.0" });
              if (tag === null) return;
              release = tag;
            } else {
              options.period = "month";
            }

            const openConfirm = await confirm("Open report in browser after generation?", true);
            if (openConfirm === null) return;
            open = openConfirm;
          } else if (interactive) {
            intro("Report", "Generate HTML dashboard from engineering memory");
          }

          if (options.period === "month" || (!options.period && !from && !to && !release)) {
            const range = monthRange();
            from = from ?? range.from;
            to = to ?? range.to;
          }

          const records = loadMemoryRecords(paths);

          const outPath = await withSpinner("Generating dashboard…", async () => {
            const html = generateDashboardHtml(records, { from, to, release });
            const filePath = path.join(paths.reportsDir, "dashboard.html");
            writeText(filePath, html);
            return filePath;
          });

          log.success(`Report written: ${outPath}`);

          if (open) {
            try {
              execSync(`open "${outPath}"`, { stdio: "ignore" });
              log.info("Opened in browser.");
            } catch {
              log.warn("Could not auto-open browser — open the file manually.");
            }
          }

          outro("Dashboard ready.");
        });
      }
    );
}
