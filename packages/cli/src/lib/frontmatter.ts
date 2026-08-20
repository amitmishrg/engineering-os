/**
 * Parse YAML frontmatter from a markdown memory record.
 */

import YAML from "yaml";

export type ParsedMarkdown = {
  frontmatter: Record<string, unknown>;
  body: string;
  filePath: string;
};

export function parseMarkdownFile(filePath: string, content: string): ParsedMarkdown {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return { frontmatter: {}, body: content, filePath };
  }

  const frontmatter = YAML.parse(match[1]) as Record<string, unknown>;
  const body = match[2].trim();

  return { frontmatter, body, filePath };
}

export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const yaml = YAML.stringify(data).trim();
  return `---\n${yaml}\n---\n\n${body}\n`;
}
