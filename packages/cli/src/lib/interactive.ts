/**
 * Shared interactive CLI helpers (TTY, --no-prompt, --yes).
 */

import type { Command } from "commander";
import { confirm, guardPrompt, log } from "./cli-ui.js";

type GlobalOpts = { noPrompt?: boolean; yes?: boolean };

export function getNoPrompt(command: Command, localNoPrompt?: boolean): boolean {
  if (localNoPrompt) return true;

  const globals = command.optsWithGlobals?.() as GlobalOpts | undefined;
  if (globals?.noPrompt || globals?.yes) return true;

  let current: Command | null = command;
  while (current) {
    const opts = current.opts() as GlobalOpts;
    if (opts.noPrompt || opts.yes) return true;
    current = current.parent;
  }

  return false;
}

export function shouldPrompt(command: Command, localNoPrompt?: boolean): boolean {
  return !getNoPrompt(command, localNoPrompt) && Boolean(process.stdin.isTTY);
}

export async function confirmProceed(
  message: string,
  initialValue = true
): Promise<boolean | null> {
  return confirm(message, initialValue);
}

export async function withPromptGuard<T>(
  fn: () => Promise<T | null | void>
): Promise<T | null | void> {
  try {
    return await fn();
  } catch (err) {
    log.error(err instanceof Error ? err.message : "Unexpected error");
    process.exit(1);
  }
}

/** Run fn only when prompt returns non-null; exit early on cancel. */
export async function whenConfirmed<T>(
  fn: () => Promise<T | null | void>
): Promise<T | null | void> {
  const result = await fn();
  return result;
}

export { guardPrompt };
