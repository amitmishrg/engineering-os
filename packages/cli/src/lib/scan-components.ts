/**
 * Scan project for UI components and draft design-system.md
 */

import fs from "node:fs";
import path from "node:path";
import { exists, readText, writeText } from "./fs.js";

export type ComponentHit = {
  name: string;
  filePath: string;
};

export type ScanResult = {
  importAlias: string | null;
  componentDirs: string[];
  components: ComponentHit[];
};

const COMPONENT_DIR_NAMES = ["components", "ui", "design-system"];
const COMPONENT_EXTENSIONS = [".tsx", ".jsx", ".vue"];

export function scanComponents(projectRoot: string): ScanResult {
  const srcDir = path.join(projectRoot, "src");
  const componentDirs: string[] = [];
  const components: ComponentHit[] = [];
  let importAlias: string | null = null;

  importAlias = detectImportAlias(projectRoot);

  const searchRoots = exists(srcDir) ? [srcDir] : [projectRoot];

  for (const root of searchRoots) {
    walkForComponents(root, componentDirs, components);
  }

  return { importAlias, componentDirs, components };
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
      for (const [key, values] of Object.entries(paths)) {
        if (key.includes("components") || values.some((v) => v.includes("components"))) {
          return key.replace("/*", "");
        }
      }
    } catch {
      // ignore invalid json
    }
  }

  return "@/components";
}

function walkForComponents(dir: string, componentDirs: string[], components: ComponentHit[]): void {
  if (!exists(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (COMPONENT_DIR_NAMES.some((n) => entry.name.toLowerCase().includes(n))) {
        if (!componentDirs.includes(full)) componentDirs.push(full);
      }
      walkForComponents(full, componentDirs, components);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!COMPONENT_EXTENSIONS.includes(ext)) continue;

    const base = path.basename(entry.name, ext);
    if (/^[A-Z]/.test(base)) {
      components.push({ name: base, filePath: full });
    }
  }
}

export function formatDesignSystemDraft(scan: ScanResult, projectName: string): string {
  const alias = scan.importAlias ?? "@/components";
  const unique = new Map<string, ComponentHit>();
  for (const c of scan.components) unique.set(c.name, c);

  const rows = [...unique.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `| ${c.name} | ${c.filePath} | |`)
    .join("\n");

  return `# Design system

<!-- engineering-os:preserve -->

Project: ${projectName}

## Import path

\`\`\`
${alias}
\`\`\`

## Scanned component directories

${scan.componentDirs.map((d) => `- ${d}`).join("\n") || "- (none found — adjust paths manually)"}

## Component inventory

| Component | Path | Use for |
|-----------|------|---------|
${rows || "| (none found) | | |"}

## Rules

1. Search before creating — prove an existing component cannot work.
2. Use design tokens for spacing — no arbitrary pixel values.
3. New primitives require justification in the feature brief.
`;
}

export function writeDesignSystem(projectRoot: string, content: string): void {
  writeText(path.join(projectRoot, ".ai", "design-system.md"), content);
}
