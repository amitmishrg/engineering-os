/**
 * Read package.json in the target project to guess stack/profile.
 *
 * We only read — never modify the user's package.json.
 */

import path from "node:path";
import { exists, readText } from "./fs.js";

export type ProjectProfile = "nextjs" | "react" | "node" | "fullstack" | "unknown";

export type ProjectDetection = {
  profile: ProjectProfile;
  hasPackageJson: boolean;
  projectName: string;
  dependencies: string[];
};

export function detectProject(cwd: string): ProjectDetection {
  const pkgPath = path.join(cwd, "package.json");

  if (!exists(pkgPath)) {
    return {
      profile: "unknown",
      hasPackageJson: false,
      projectName: path.basename(cwd),
      dependencies: [],
    };
  }

  const pkg = JSON.parse(readText(pkgPath)) as {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const depNames = Object.keys(deps);
  const profile = inferProfile(depNames);

  return {
    profile,
    hasPackageJson: true,
    projectName: pkg.name ?? path.basename(cwd),
    dependencies: depNames,
  };
}

function inferProfile(depNames: string[]): ProjectProfile {
  const has = (name: string) => depNames.includes(name);

  const hasNext = has("next");
  const hasReact = has("react");
  const hasExpress = has("express") || has("fastify") || has("@nestjs/core");

  if (hasNext) return "nextjs";
  if (hasReact && hasExpress) return "fullstack";
  if (hasReact) return "react";
  if (hasExpress) return "node";

  return "unknown";
}
