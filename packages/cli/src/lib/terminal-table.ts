/**
 * Bordered terminal tables (box-drawing characters).
 */

import pc from "picocolors";

export type TableAlign = "left" | "right";

export type PrintTableOptions = {
  colWidths?: number[];
  align?: TableAlign[];
  indent?: number;
};

function truncate(value: unknown, maxLen: number): string {
  const raw = String(value ?? "—");
  if (raw.length <= maxLen) return raw;
  return `${raw.slice(0, Math.max(1, maxLen - 1))}…`;
}

function columnWidths(headers: string[], rows: string[][], fixed?: number[]): number[] {
  const count = headers.length;
  return headers.map((header, i) => {
    if (fixed?.[i] !== undefined) return fixed[i]!;
    const maxCell = rows.reduce(
      (max, row) => Math.max(max, String(row[i] ?? "").length),
      header.length
    );
    return Math.min(Math.max(maxCell, 3), 40);
  });
}

function padCell(text: string, width: number, align: TableAlign): string {
  return align === "right" ? text.padStart(width) : text.padEnd(width);
}

function horizontal(widths: number[], left: string, mid: string, right: string): string {
  return (
    left + widths.map((w, i) => "─".repeat(w) + (i < widths.length - 1 ? mid : "")).join("") + right
  );
}

function rowLine(cells: string[], widths: number[], align: TableAlign[]): string {
  const parts = cells.map((cell, i) => padCell(cell, widths[i] ?? 12, align[i] ?? "left"));
  return `│ ${parts.join(" │ ")} │`;
}

export function printBorderedTable(
  title: string,
  headers: string[],
  rows: string[][],
  options: PrintTableOptions = {}
): void {
  const indent = " ".repeat(options.indent ?? 0);
  const align = options.align ?? headers.map(() => "left" as TableAlign);
  const widths = columnWidths(headers, rows, options.colWidths);

  const headerCells = headers.map((h, i) => truncate(h, widths[i] ?? 12));
  const bodyRows = rows.map((row) => row.map((cell, i) => truncate(cell, widths[i] ?? 12)));

  console.log("");
  console.log(`${indent}${pc.bold(pc.cyan(title))}`);

  if (bodyRows.length === 0) {
    console.log(`${indent}${pc.dim("(none in this period)")}`);
    return;
  }

  const top = horizontal(widths, "┌─", "─┬─", "─┐");
  const headerSep = horizontal(widths, "├─", "─┼─", "─┤");
  const bottom = horizontal(widths, "└─", "─┴─", "─┘");

  console.log(`${indent}${pc.dim(top)}`);
  console.log(`${indent}${pc.bold(rowLine(headerCells, widths, align))}`);
  console.log(`${indent}${pc.dim(headerSep)}`);
  for (const row of bodyRows) {
    console.log(`${indent}${rowLine(row, widths, align)}`);
  }
  console.log(`${indent}${pc.dim(bottom)}`);
}
