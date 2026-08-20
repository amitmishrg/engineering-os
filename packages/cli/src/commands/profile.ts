/**
 * profile command — performance profiling with before/after reports.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import type { Command } from "commander";
import { confirm, intro, log, outro, select, text, withSpinner } from "../lib/cli-ui.js";
import { shouldPrompt, withPromptGuard } from "../lib/interactive.js";
import { getProjectPaths } from "../lib/paths.js";
import { writeText, ensureDir, exists } from "../lib/fs.js";
import {
  generateComparisonHtml,
  generateSnapshotHtml,
} from "../lib/performance/comparison-html.js";
import {
  loadScenario,
  loadSnapshot,
  runProfile,
  saveSnapshot,
} from "../lib/performance/run-profile.js";

function listPerfIds(reportsDir: string): string[] {
  const perfRoot = path.join(reportsDir, "performance");
  if (!exists(perfRoot)) return [];
  return fs
    .readdirSync(perfRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

export function registerProfileCommand(program: Command): void {
  const profile = program
    .command("profile")
    .description("Performance profiling (CDP + Web Vitals)");

  profile
    .command("run")
    .description("Run a profile phase (before or after)")
    .option("--url <url>", "Page URL to profile")
    .option("--scenario <file>", "Scenario JSON file")
    .option("--phase <phase>", "before or after")
    .option("--perf-id <id>", "PERF record id for report directory", "PERF-draft")
    .option("--no-prompt", "Skip interactive prompts")
    .action(
      async (
        options: {
          url?: string;
          scenario?: string;
          phase?: string;
          perfId?: string;
          noPrompt?: boolean;
        },
        command: Command
      ) => {
        await withPromptGuard(async () => {
          const interactive = shouldPrompt(command, options.noPrompt);

          let url = options.url;
          let phase = options.phase as "before" | "after" | undefined;
          let perfId = options.perfId ?? "PERF-draft";

          if (interactive && (!url || !phase)) {
            intro("Profile run", "Capture CDP + Web Vitals snapshot");

            if (!url) {
              const u = await text("Page URL to profile", {
                defaultValue: "http://localhost:3000",
                placeholder: "http://localhost:3000/dashboard",
              });
              if (u === null) return;
              url = u;
            }

            if (!phase) {
              const p = await select(
                "Profile phase",
                [
                  { value: "before", label: "Before", hint: "Baseline before your fix" },
                  { value: "after", label: "After", hint: "Measure after your fix" },
                ],
                "before"
              );
              if (p === null) return;
              phase = p;
            }

            const id = await text("PERF record id", {
              defaultValue: perfId,
              placeholder: "PERF-2026-001",
            });
            if (id === null) return;
            perfId = id;
          }

          if (!url || !phase) {
            log.error("Required: --url and --phase (or run interactively in a TTY)");
            process.exit(1);
          }

          if (phase !== "before" && phase !== "after") {
            log.error("--phase must be before or after");
            process.exit(1);
          }

          const scenario = options.scenario
            ? loadScenario(options.scenario)
            : { url, waitMs: 2000 };

          if (!scenario.url) scenario.url = url;

          const snapshot = await withSpinner(`Profiling ${phase}: ${scenario.url}`, () =>
            runProfile(scenario, phase)
          );

          const paths = getProjectPaths();
          const reportDir = path.join(paths.reportsDir, "performance", perfId);
          ensureDir(reportDir);

          saveSnapshot(reportDir, snapshot);
          writeText(path.join(reportDir, `${phase}.html`), generateSnapshotHtml(snapshot, perfId));

          outro(`Saved ${phase} snapshot to ${reportDir}`);
        });
      }
    );

  profile
    .command("compare")
    .description("Generate before/after comparison HTML")
    .argument("[perfId]", "PERF record id")
    .option("--open", "Open comparison in browser")
    .option("--no-prompt", "Skip interactive prompts")
    .action(
      async (
        perfId: string | undefined,
        options: { open?: boolean; noPrompt?: boolean },
        command: Command
      ) => {
        await withPromptGuard(async () => {
          const paths = getProjectPaths();
          const interactive = shouldPrompt(command, options.noPrompt);
          let open = options.open ?? false;

          if (interactive && !perfId) {
            intro("Profile compare", "Before/after performance comparison");

            const ids = listPerfIds(paths.reportsDir);
            if (ids.length === 0) {
              log.error("No performance reports found. Run profile run first.");
              process.exit(1);
            }

            const picked = await select(
              "PERF record to compare",
              ids.map((id) => ({ value: id, label: id })),
              ids[0]
            );
            if (picked === null) return;
            perfId = picked;

            const openConfirm = await confirm("Open comparison in browser?", true);
            if (openConfirm === null) return;
            open = openConfirm;
          } else if (interactive) {
            intro("Profile compare", "Before/after performance comparison");
          }

          if (!perfId) {
            log.error("Required: perfId (or run interactively in a TTY)");
            process.exit(1);
          }

          const perfIdResolved = perfId;
          const reportDir = path.join(paths.reportsDir, "performance", perfIdResolved);
          const before = loadSnapshot(reportDir, "before");
          const after = loadSnapshot(reportDir, "after");

          if (!before || !after) {
            log.error("Need both before.json and after.json in report dir.");
            process.exit(1);
          }

          const out = await withSpinner("Generating comparison…", async () => {
            const html = generateComparisonHtml({
              perfId: perfIdResolved,
              title: `Performance investigation ${perfIdResolved}`,
              before,
              after,
            });
            const filePath = path.join(reportDir, "comparison.html");
            writeText(filePath, html);
            return filePath;
          });

          log.success(`Comparison written: ${out}`);

          if (open) {
            try {
              execSync(`open "${out}"`, { stdio: "ignore" });
              log.info("Opened in browser.");
            } catch {
              log.warn("Could not auto-open browser.");
            }
          }

          outro("Comparison ready.");
        });
      }
    );
}
