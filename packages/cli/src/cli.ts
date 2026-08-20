#!/usr/bin/env node

/**
 * Entry point for the engineering-os CLI.
 * Each command lives in src/commands/ — read one file at a time.
 */

import { Command } from "commander";
import { registerInitCommand } from "./commands/init.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerUpdateCommand } from "./commands/update.js";
import { registerValidateCommand } from "./commands/validate.js";
import { registerMemoryCommand } from "./commands/memory.js";
import { registerGitCommand } from "./commands/git.js";
import { registerScanCommand } from "./commands/scan.js";
import { registerReportCommand } from "./commands/report.js";
import { registerProfileCommand } from "./commands/profile.js";
import { PACKAGE_VERSION } from "./lib/constants.js";

const program = new Command();

program
  .name("engineering-os")
  .description("Bootstrap and maintain Engineering OS in your project")
  .version(PACKAGE_VERSION);

registerInitCommand(program);
registerDoctorCommand(program);
registerUpdateCommand(program);
registerValidateCommand(program);
registerMemoryCommand(program);
registerGitCommand(program);
registerScanCommand(program);
registerReportCommand(program);
registerProfileCommand(program);

program.parse();
