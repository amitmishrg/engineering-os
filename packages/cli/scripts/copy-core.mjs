/**
 * Copy packages/core into packages/cli/core for npm publish.
 * In the monorepo, constants.ts reads sibling ../core during dev.
 * Published package bundles core/ next to dist/.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(__dirname, "..");
const coreSrc = path.resolve(cliRoot, "..", "core");
const coreDest = path.join(cliRoot, "core");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(coreSrc)) {
  console.error("copy-core: source not found", coreSrc);
  process.exit(1);
}

fs.rmSync(coreDest, { recursive: true, force: true });
copyDir(coreSrc, coreDest);
console.log("copy-core: bundled core → packages/cli/core");
