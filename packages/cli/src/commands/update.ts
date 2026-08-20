/**
 * update command — upgrade skills/adapters without touching .ai/memory/.
 */

import type { Command } from "commander";
import { PACKAGE_VERSION } from "../lib/constants.js";
import { installAdapters } from "../lib/install-adapters.js";
import { readLockfile, writeLockfile } from "../lib/lockfile.js";
import { getProjectPaths } from "../lib/paths.js";
import { exists } from "../lib/fs.js";

export function registerUpdateCommand(program: Command): void {
  program
    .command("update")
    .description("Update Engineering OS skills and adapters (preserves .ai/memory/)")
    .option("--cursor", "Update Cursor adapter")
    .option("--claude", "Update Claude adapter")
    .action((options: { cursor?: boolean; claude?: boolean }) => {
      const paths = getProjectPaths();

      if (!exists(paths.lockfile)) {
        console.error("\nNo engineering-os.lock.json — run init first.\n");
        process.exit(1);
      }

      const lock = readLockfile(paths.lockfile);
      const cursor = options.cursor ?? lock.harnesses.cursor;
      const claude = options.claude ?? lock.harnesses.claude;

      console.log("\nEngineering OS — update\n");
      console.log(`Kit version: ${PACKAGE_VERSION}`);
      console.log("Preserving:  .ai/memory/ and preserved constitution blocks\n");

      installAdapters({ projectRoot: paths.root, cursor, claude });

      writeLockfile(paths.lockfile, lock.profile, { cursor, claude });

      console.log("Updated:");
      if (cursor) console.log("  Cursor skills + rules");
      if (claude) console.log("  Claude skills + CLAUDE.md snippet");
      console.log("\nRun: engineering-os doctor\n");
    });
}
