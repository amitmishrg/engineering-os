# Getting started

## Install in your project

```bash
cd your-app
npx @amitmishrg/engineering-os init --scan
engineering-os doctor
```

This creates:

- `.ai/` — architecture, conventions, design system, **memory**
- `.cursor/skills/engineering-os/` — skills for Cursor
- `.claude/skills/engineering-os/` — skills for Claude Code

## Six workflows

| Command        | When                                                       |
| -------------- | ---------------------------------------------------------- |
| `/context`     | Understand an area before touching code                    |
| `/feature`     | Build with why + PRD + Figma + docs at ship                |
| `/bug`         | Fix with memory search first                               |
| `/review`      | Review against your standards                              |
| `/performance` | Before/after evidence (DevTools, Lighthouse) + PERF record |
| `/verify`      | Pre-ship checklist                                         |

## CLI reference

```bash
engineering-os init [--scan] [--no-cursor] [--no-claude]
engineering-os doctor
engineering-os update
engineering-os validate
engineering-os memory index
engineering-os memory search "editor state" --branch fix/foo
engineering-os scan components          # show design-system draft
engineering-os scan components --write  # save after review
engineering-os report
engineering-os git branch
```

## Memory records

After bugs, features, or perf work, agents write markdown files under `.ai/memory/` with YAML frontmatter. Rebuild indexes:

```bash
engineering-os memory index
engineering-os validate
```

## Performance investigations

Use Chrome DevTools, Lighthouse, or your team's tooling for before/after evidence. Record findings in `.ai/memory/performance/` via **knowledge-capture**.

## Learn the codebase

See [CODEMAP.md](./CODEMAP.md) and [BUILD-GUIDE.md](./BUILD-GUIDE.md).
