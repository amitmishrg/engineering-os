/**
 * Unified CLI UI — @clack/prompts + picocolors (OSS-standard UX).
 *
 * Used by create-vite, shadcn, and similar tools. Provides intro/outro,
 * spinners, structured logs, and cancellable prompts.
 */

import * as p from "@clack/prompts";
import pc from "picocolors";
import { PACKAGE_VERSION } from "./constants.js";

export { isCancel } from "@clack/prompts";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  hint?: string;
};

/** Guard prompt result — returns null if user cancelled (Ctrl+C). */
export async function guardPrompt<T>(value: T | symbol): Promise<T | null> {
  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    return null;
  }
  return value;
}

export function intro(title: string, subtitle?: string): void {
  const header = pc.bgCyan(pc.black(` engineering-os v${PACKAGE_VERSION} `));
  p.intro(`${header} ${pc.bold(title)}${subtitle ? `\n${pc.dim(subtitle)}` : ""}`);
}

export function outro(message: string): void {
  p.outro(pc.green(message));
}

export function note(body: string, title?: string): void {
  p.note(body, title);
}

export const log = {
  success: (msg: string) => p.log.success(msg),
  warn: (msg: string) => p.log.warn(msg),
  error: (msg: string) => p.log.error(msg),
  info: (msg: string) => p.log.info(msg),
  step: (msg: string) => p.log.step(msg),
};

export function check(ok: boolean, label: string): void {
  if (ok) log.success(label);
  else log.error(label);
}

export async function confirm(message: string, initialValue = true): Promise<boolean | null> {
  return guardPrompt(await p.confirm({ message, initialValue }));
}

export async function select<T extends string>(
  message: string,
  options: SelectOption<T>[],
  initialValue?: T
): Promise<T | null> {
  return guardPrompt(
    await p.select({
      message,
      options: options as Parameters<typeof p.select<T>>[0]["options"],
      initialValue,
    })
  );
}

export async function multiselect<T extends string>(
  message: string,
  options: SelectOption<T>[],
  opts?: { required?: boolean; initialValues?: T[] }
): Promise<T[] | null> {
  return guardPrompt(
    await p.multiselect({
      message,
      options: options as Parameters<typeof p.multiselect<T>>[0]["options"],
      required: opts?.required ?? true,
      initialValues: opts?.initialValues,
    })
  );
}

export async function text(
  message: string,
  opts?: {
    placeholder?: string;
    defaultValue?: string;
    validate?: (value: string | undefined) => string | Error | undefined;
  }
): Promise<string | null> {
  return guardPrompt(
    await p.text({
      message,
      placeholder: opts?.placeholder,
      defaultValue: opts?.defaultValue,
      validate: opts?.validate,
    })
  );
}

export async function withSpinner<T>(message: string, task: () => Promise<T>): Promise<T> {
  const spinner = p.spinner();
  spinner.start(message);
  try {
    const result = await task();
    spinner.stop(pc.green(message));
    return result;
  } catch (err) {
    spinner.stop(pc.red(message));
    throw err;
  }
}

/** Plain output for scripts (no clack formatting). */
export function plainLine(message: string): void {
  console.log(message);
}
