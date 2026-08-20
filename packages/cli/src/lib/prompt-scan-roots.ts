/**
 * Interactive prompt: ask which folder holds reusable UI primitives.
 */

import path from "node:path";
import { confirm, intro, log, select, text } from "./cli-ui.js";
import { exists } from "./fs.js";
import { suggestDesignSystemRoots } from "./scan-components.js";

const CUSTOM_PATH_VALUE = "__custom__";

export type ScanRootsOptions = {
  roots?: string[];
  all?: boolean;
  noPrompt?: boolean;
};

export async function resolveScanRoots(
  projectRoot: string,
  options: ScanRootsOptions
): Promise<{ roots?: string[]; all: boolean }> {
  if (options.all) return { all: true };
  if (options.roots?.length) return { roots: options.roots, all: false };

  const shouldPrompt = !options.noPrompt && process.stdin.isTTY;
  if (!shouldPrompt) return { all: false };

  const suggestions = suggestDesignSystemRoots(projectRoot);
  const roots = await promptDesignSystemRoots(projectRoot, suggestions);
  return { roots, all: false };
}

async function promptDesignSystemRoots(
  projectRoot: string,
  suggestions: string[]
): Promise<string[]> {
  intro("Design system scan", "Reusable UI primitives only — not feature or page components");

  if (suggestions.length > 0) {
    log.info("Detected likely design-system folders in your project.");
  } else {
    log.warn("No design-system folders auto-detected.");
  }

  const defaultPath = suggestions[0] ?? "src/components/ui";
  const chosenPaths = await pickScanPaths(suggestions, defaultPath);
  if (!chosenPaths) return [];

  const validPaths = await validatePathsWithRetry(projectRoot, chosenPaths, defaultPath);
  if (validPaths.length === 0) {
    log.warn("No valid paths — skipping scan. Edit .ai/design-system.md manually.");
    return [];
  }

  const proceed = await confirm(`Scan ${validPaths.join(", ")}?`, true);
  if (proceed === null || !proceed) return [];

  log.step(`Scanning ${validPaths.join(", ")}`);
  return validPaths;
}

async function pickScanPaths(suggestions: string[], defaultPath: string): Promise<string[] | null> {
  if (suggestions.length === 0) {
    const custom = await text("Folder path (relative to project root)", {
      defaultValue: defaultPath,
      placeholder: "src/components/ui",
    });
    return custom ? splitPaths(custom) : null;
  }

  const picked = await select("Where are your reusable UI primitives?", [
    ...suggestions.map((s) => ({
      value: s,
      label: s,
      hint: "Detected in your project",
    })),
    {
      value: CUSTOM_PATH_VALUE,
      label: "Enter a custom path…",
      hint: "Comma-separated for multiple folders",
    },
  ]);

  if (picked === null) return null;

  if (picked === CUSTOM_PATH_VALUE) {
    const custom = await text("Folder path(s), relative to project root", {
      defaultValue: defaultPath,
      placeholder: "src/components/ui, packages/ui/src",
    });
    return custom ? splitPaths(custom) : null;
  }

  return [picked];
}

async function validatePathsWithRetry(
  projectRoot: string,
  chosenPaths: string[],
  defaultPath: string
): Promise<string[]> {
  let attempt = 0;
  let paths = chosenPaths;

  while (attempt < 3) {
    const valid = paths.filter((rel) => exists(path.join(projectRoot, rel)));
    const missing = paths.filter((rel) => !valid.includes(rel));

    for (const rel of missing) {
      log.error(`Not found: ${rel}`);
    }

    if (valid.length > 0) return valid;

    attempt++;
    if (attempt >= 3) break;

    log.warn("None of those paths exist. Try again.");

    const retry = await text("Folder path(s), relative to project root", {
      defaultValue: defaultPath,
    });
    if (retry === null) return [];
    paths = splitPaths(retry);
  }

  return [];
}

function splitPaths(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
