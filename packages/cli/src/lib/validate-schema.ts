/**
 * Validate memory record frontmatter against JSON schemas in packages/core/schemas/.
 */

import fs from "node:fs";
import path from "node:path";
import AjvModule from "ajv";
import addFormatsModule from "ajv-formats";
import { CORE_ROOT } from "./constants.js";
import type { MemoryRecord } from "./memory-records.js";
import type { ErrorObject } from "ajv";

const Ajv = AjvModule.default ?? AjvModule;
const addFormats = addFormatsModule.default ?? addFormatsModule;

const SCHEMA_MAP: Record<string, string> = {
  BUG: "bug-record.json",
  FEAT: "feature-record.json",
  PERF: "performance-record.json",
  ADR: "decision-record.json",
  PAT: "pattern-record.json",
  INC: "incident-record.json",
};

let ajvInstance: InstanceType<typeof Ajv> | null = null;

function getAjv(): InstanceType<typeof Ajv> {
  if (!ajvInstance) {
    ajvInstance = new Ajv({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

function loadSchema(prefix: string): object | null {
  const fileName = SCHEMA_MAP[prefix];
  if (!fileName) return null;

  const schemaPath = path.join(CORE_ROOT, "schemas", fileName);
  if (!fs.existsSync(schemaPath)) return null;

  return JSON.parse(fs.readFileSync(schemaPath, "utf8")) as object;
}

export type ValidationIssue = {
  file: string;
  message: string;
};

export function validateRecord(record: MemoryRecord): ValidationIssue[] {
  const prefix = record.id.split("-")[0];
  const schema = loadSchema(prefix);

  if (!schema) {
    return [{ file: record.filePath, message: `No schema for prefix ${prefix}` }];
  }

  const ajv = getAjv();
  const validate = ajv.compile(schema);
  const valid = validate(record.frontmatter);

  if (valid) return [];

  return (validate.errors ?? []).map((err: ErrorObject) => ({
    file: record.filePath,
    message: `${err.instancePath || "root"} ${err.message}`,
  }));
}

export function validateAllRecords(records: MemoryRecord[]): ValidationIssue[] {
  return records.flatMap(validateRecord);
}
