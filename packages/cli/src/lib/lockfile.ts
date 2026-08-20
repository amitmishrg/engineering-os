/**
 * Write engineering-os.lock.json in the target project.
 *
 * This file tracks which kit version is installed.
 * update reads it; init creates it.
 */

import { PACKAGE_VERSION } from "./constants.js";
import { readText, writeText } from "./fs.js";
import type { ProjectProfile } from "./detect-project.js";

export type Lockfile = {
  version: string;
  installedAt: string;
  profile: ProjectProfile;
  harnesses: {
    cursor: boolean;
    claude: boolean;
  };
};

export function writeLockfile(
  lockfilePath: string,
  profile: ProjectProfile,
  harnesses: { cursor: boolean; claude: boolean }
): void {
  const lock: Lockfile = {
    version: PACKAGE_VERSION,
    installedAt: new Date().toISOString(),
    profile,
    harnesses,
  };

  writeText(lockfilePath, `${JSON.stringify(lock, null, 2)}\n`);
}

export function readLockfile(lockfilePath: string): Lockfile {
  return JSON.parse(readText(lockfilePath)) as Lockfile;
}
