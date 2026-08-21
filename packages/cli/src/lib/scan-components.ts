/**
 * Scan project for reusable UI primitives and draft design-system.md
 *
 * By default we only scan likely design-system roots (e.g. src/components/ui),
 * not every feature folder named "components" under src/.
 */

import fs from "node:fs";
import path from "node:path";
import { exists, readText, writeText } from "./fs.js";

export type ComponentHit = {
  name: string;
  filePath: string;
};

export type ScanMode = "design-system" | "all";

export type ScanOptions = {
  /** Relative paths from project root, e.g. src/components/ui */
  roots?: string[];
  /** Scan all of src/ (legacy/noisy behavior) */
  all?: boolean;
};

export type ScanResult = {
  importAlias: string | null;
  designSystemRoots: string[];
  components: ComponentHit[];
  mode: ScanMode;
};

const COMPONENT_EXTENSIONS = [".tsx", ".jsx", ".vue"];
const NESTED_COMPONENT_DIR_NAMES = ["components", "ui", "design-system"];

function isTestComponentFile(fileName: string): boolean {
  return /\.(test|spec)\.(tsx|jsx|vue)$/i.test(fileName);
}

/** Common locations for shared UI primitives */
const DEFAULT_ROOT_REL_PATHS = [
  "src/components/ui",
  "src/ui",
  "src/design-system",
  "components/ui",
  "app/components/ui",
  "packages/ui/src",
  "packages/design-system/src",
];

export function scanComponents(projectRoot: string, options: ScanOptions = {}): ScanResult {
  const importAlias = detectImportAlias(projectRoot);
  const mode: ScanMode = options.all ? "all" : "design-system";

  if (options.all) {
    const srcDir = path.join(projectRoot, "src");
    const searchRoots = exists(srcDir) ? [srcDir] : [projectRoot];
    const designSystemRoots: string[] = [];
    const components: ComponentHit[] = [];

    for (const root of searchRoots) {
      walkAllComponents(root, designSystemRoots, components);
    }

    return { importAlias, designSystemRoots, components, mode };
  }

  const designSystemRoots = resolveDesignSystemRoots(projectRoot, options.roots);
  const components: ComponentHit[] = [];

  for (const root of designSystemRoots) {
    walkDesignSystemRoot(root, components);
  }

  return { importAlias, designSystemRoots, components, mode };
}

function resolveDesignSystemRoots(projectRoot: string, explicitRoots?: string[]): string[] {
  if (explicitRoots?.length) {
    return explicitRoots.map((rel) => path.resolve(projectRoot, rel)).filter((abs) => exists(abs));
  }

  const found = new Set<string>();

  for (const rel of pathsFromTsconfig(projectRoot)) {
    if (isLikelyDesignSystemPath(rel)) {
      const abs = path.join(projectRoot, rel);
      if (exists(abs)) found.add(abs);
    }
  }

  for (const rel of DEFAULT_ROOT_REL_PATHS) {
    const abs = path.join(projectRoot, rel);
    if (exists(abs)) found.add(abs);
  }

  return [...found];
}

/** Relative paths auto-detected as likely design-system roots (for prompts and hints). */
export function suggestDesignSystemRoots(projectRoot: string): string[] {
  return resolveDesignSystemRoots(projectRoot).map((abs) =>
    path.relative(projectRoot, abs).replace(/\\/g, "/")
  );
}

function isLikelyDesignSystemPath(relPath: string): boolean {
  const normalized = relPath.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.endsWith("/ui") ||
    normalized.includes("/ui/") ||
    normalized.includes("design-system") ||
    normalized.endsWith("/design-system")
  );
}

function pathsFromTsconfig(projectRoot: string): string[] {
  const cfgPaths = [
    path.join(projectRoot, "tsconfig.json"),
    path.join(projectRoot, "jsconfig.json"),
  ];
  const resolved: string[] = [];

  for (const cfgPath of cfgPaths) {
    if (!exists(cfgPath)) continue;

    try {
      const cfg = JSON.parse(readText(cfgPath)) as {
        compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
      };
      const baseUrl = cfg.compilerOptions?.baseUrl ?? ".";
      const paths = cfg.compilerOptions?.paths ?? {};

      for (const values of Object.values(paths)) {
        for (const value of values) {
          const cleaned = value.replace(/\*.*$/, "").replace(/\/$/, "");
          if (!cleaned) continue;
          resolved.push(path.join(baseUrl, cleaned));
        }
      }
    } catch {
      // ignore invalid json
    }
  }

  return resolved;
}

function detectImportAlias(projectRoot: string): string | null {
  const tsconfigPaths = [
    path.join(projectRoot, "tsconfig.json"),
    path.join(projectRoot, "jsconfig.json"),
  ];

  for (const cfgPath of tsconfigPaths) {
    if (!exists(cfgPath)) continue;
    try {
      const cfg = JSON.parse(readText(cfgPath)) as {
        compilerOptions?: { paths?: Record<string, string[]> };
      };
      const paths = cfg.compilerOptions?.paths ?? {};

      // Prefer a ui-specific alias over a broad @/components/*
      for (const [key, values] of Object.entries(paths)) {
        const joined = `${key} ${values.join(" ")}`.toLowerCase();
        if (joined.includes("ui") || joined.includes("design-system")) {
          return key.replace("/*", "");
        }
      }

      for (const [key, values] of Object.entries(paths)) {
        if (key.includes("components") || values.some((v) => v.includes("components"))) {
          return key.replace("/*", "");
        }
      }
    } catch {
      // ignore invalid json
    }
  }

  return "@/components/ui";
}

/** Walk only within an explicit design-system root */
function walkDesignSystemRoot(dir: string, components: ComponentHit[]): void {
  if (!exists(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDesignSystemRoot(full, components);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!COMPONENT_EXTENSIONS.includes(ext)) continue;
    if (isTestComponentFile(entry.name)) continue;

    const base = path.basename(entry.name, ext);
    if (/^[A-Z]/.test(base)) {
      components.push({ name: base, filePath: full });
    }
  }
}

/** Legacy: walk entire tree and collect every PascalCase component */
function walkAllComponents(
  dir: string,
  designSystemRoots: string[],
  components: ComponentHit[]
): void {
  if (!exists(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (NESTED_COMPONENT_DIR_NAMES.some((n) => entry.name.toLowerCase().includes(n))) {
        if (!designSystemRoots.includes(full)) designSystemRoots.push(full);
      }
      walkAllComponents(full, designSystemRoots, components);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!COMPONENT_EXTENSIONS.includes(ext)) continue;
    if (isTestComponentFile(entry.name)) continue;

    const base = path.basename(entry.name, ext);
    if (/^[A-Z]/.test(base)) {
      components.push({ name: base, filePath: full });
    }
  }
}

function toProjectRelativePath(projectRoot: string, filePath: string): string {
  return path.relative(projectRoot, filePath).replace(/\\/g, "/");
}

export function formatDesignSystemDraft(
  scan: ScanResult,
  projectName: string,
  projectRoot: string
): string {
  const alias = scan.importAlias ?? "@/components/ui";
  const rel = (p: string) => toProjectRelativePath(projectRoot, p);
  const unique = new Map<string, ComponentHit>();
  for (const c of scan.components) unique.set(c.name, c);

  const rows = [...unique.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `| ${c.name} | ${rel(c.filePath)} | |`)
    .join("\n");

  const rootsSection =
    scan.designSystemRoots.length > 0
      ? scan.designSystemRoots.map((d) => `- ${rel(d)}`).join("\n")
      : "- (none found — set roots with: engineering-os scan components --roots src/components/ui)";

  const modeNote =
    scan.mode === "all"
      ? "Scanned **all** of src/ (`--all`). Curate heavily — most entries are feature components, not design primitives."
      : "Scanned **design-system roots only** — reusable UI primitives (Button, Input, Dialog), not page/feature components.";

  return `# Design system

<!-- engineering-os:preserve -->

Project: ${projectName}

## Import path

\`\`\`
${alias}
\`\`\`

## Design system roots

${modeNote}

${rootsSection}

## Component inventory (draft)

Review and **keep only reusable primitives**. Delete feature-specific components. Fill the "Use for" column.

| Component | Path | Use for |
|-----------|------|---------|
${rows || "| (none found in design-system roots) | | |"}

## Rules

1. Search before creating — prove an existing component cannot work.
2. Use design tokens for spacing — no arbitrary pixel values.
3. New primitives require justification in the feature brief.
`;
}

export function writeDesignSystem(projectRoot: string, content: string): void {
  writeText(path.join(projectRoot, ".ai", "design-system.md"), content);
}
