/**
 * profile command — performance profiling with before/after reports.
 */

import path from "node:path";
import { execSync } from "node:child_process";
import type { Command } from "commander";
import { getProjectPaths } from "../lib/paths.js";
import { writeText, ensureDir } from "../lib/fs.js";
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

export function registerProfileCommand(program: Command): void {
  const profile = program.command("profile").description("Performance profiling (CDP + Web Vitals)");

  profile
    .command("run")
    .description("Run a profile phase (before or after)")
    .requiredOption("--url <url>", "Page URL to profile")
    .option("--scenario <file>", "Scenario JSON file")
    .requiredOption("--phase <phase>", "before or after")
    .option("--perf-id <id>", "PERF record id for report directory", "PERF-draft")
    .action(async (options: {
      url: string;
      scenario?: string;
      phase: string;
      perfId: string;
    }) => {
      const phase = options.phase as "before" | "after";
      if (phase !== "before" && phase !== "after") {
        console.error("\n--phase must be before or after\n");
        process.exit(1);
      }

      const scenario = options.scenario
        ? loadScenario(options.scenario)
        : { url: options.url, waitMs: 2000 };

      if (!scenario.url) scenario.url = options.url;

      console.log(`\nProfiling ${phase}: ${scenario.url}\n`);

      const snapshot = await runProfile(scenario, phase);
      const paths = getProjectPaths();
      const reportDir = path.join(paths.reportsDir, "performance", options.perfId);
      ensureDir(reportDir);

      saveSnapshot(reportDir, snapshot);
      writeText(
        path.join(reportDir, `${phase}.html`),
        generateSnapshotHtml(snapshot, options.perfId)
      );

      console.log(`Saved ${phase} snapshot to ${reportDir}\n`);
    });

  profile
    .command("compare")
    .description("Generate before/after comparison HTML")
    .argument("<perfId>", "PERF record id")
    .option("--open", "Open comparison in browser")
    .action((perfId: string, options: { open?: boolean }) => {
      const paths = getProjectPaths();
      const reportDir = path.join(paths.reportsDir, "performance", perfId);

      const before = loadSnapshot(reportDir, "before");
      const after = loadSnapshot(reportDir, "after");

      if (!before || !after) {
        console.error("\nNeed both before.json and after.json in report dir.\n");
        process.exit(1);
      }

      const html = generateComparisonHtml({
        perfId,
        title: `Performance investigation ${perfId}`,
        before,
        after,
      });

      const out = path.join(reportDir, "comparison.html");
      writeText(out, html);

      console.log(`\nComparison written: ${out}\n`);

      if (options.open) {
        try {
          execSync(`open "${out}"`, { stdio: "ignore" });
        } catch {
          // ignore
        }
      }
    });
}
