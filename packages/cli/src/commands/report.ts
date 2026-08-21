/**
 * report command — show engineering memory as terminal tables.
 */

import type { Command } from "commander";
import { intro, log, multiselect, outro, select, text } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { loadMemoryRecords } from "../lib/memory-records.js";
import { getProjectPaths } from "../lib/paths.js";
import { buildReportData } from "../lib/report/report-data.js";
import {
  printReport,
  REPORT_SECTIONS,
  sectionLabel,
  type ReportSection,
} from "../lib/report/dashboard-terminal.js";
import { exists } from "../lib/fs.js";

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
    .description("Show engineering memory report as terminal tables")
    .option("--period <name>", "month (default) or release")
    .option("--tag <release>", "Release tag when --period release")
    .option("--from <date>", "Start date YYYY-MM-DD")
    .option("--to <date>", "End date YYYY-MM-DD")
    .option("--no-prompt", "Skip interactive prompts")
    .action(
      async (
        options: {
          period?: string;
          tag?: string;
          from?: string;
          to?: string;
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
          const release = options.tag;
          let sections: ReportSection[] = [...REPORT_SECTIONS];

          if (interactive && !options.period && !from && !to && !release) {
            intro("Report", "Engineering memory — terminal tables");

            const periodChoice = await select(
              "Report period",
              [
                { value: "month", label: "This month", hint: "Current calendar month" },
                { value: "custom", label: "Custom date range" },
                { value: "release", label: "Release tag" },
                { value: "all", label: "All time" },
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
              options.period = "release";
              options.tag = tag;
            } else if (periodChoice === "month") {
              options.period = "month";
            }

            const picked = await multiselect(
              "Sections to display",
              REPORT_SECTIONS.map((s) => ({
                value: s,
                label: sectionLabel(s),
              })),
              { initialValues: [...REPORT_SECTIONS] }
            );
            if (picked === null) return;
            sections = picked;
          } else if (interactive) {
            intro("Report", "Engineering memory — terminal tables");
          }

          if (options.period === "month" || (!options.period && !from && !to && !release)) {
            const range = monthRange();
            from = from ?? range.from;
            to = to ?? range.to;
          }

          const records = loadMemoryRecords(paths);
          const data = buildReportData(records, {
            from,
            to,
            release: options.tag ?? release,
          });

          printReport(data, sections);
          outro("Report complete.");
        });
      }
    );
}
