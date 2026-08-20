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

| Command | When |
|---------|------|
| `/context` | Understand an area before touching code |
| `/feature` | Build with why + PRD + Figma + docs at ship |
| `/bug` | Fix with memory search first |
| `/review` | Review against your standards |
| `/performance` | Profile with before/after evidence |
| `/verify` | Pre-ship checklist |

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
engineering-os report --open
engineering-os profile run --url http://localhost:3000 --phase before --perf-id PERF-2026-001
engineering-os profile run --url http://localhost:3000 --phase after --perf-id PERF-2026-001
engineering-os profile compare PERF-2026-001 --open
engineering-os git branch
```

## Memory records

After bugs, features, or perf work, agents write markdown files under `.ai/memory/` with YAML frontmatter. Rebuild indexes:

```bash
engineering-os memory index
engineering-os validate
```

## Performance profiling

Requires Google Chrome (or set `CHROME_PATH`).

1. Profile **before** fix
2. Fix the issue
3. Profile **after** with the same URL/scenario
4. Generate comparison report

## Learn the codebase

See [CODEMAP.md](./CODEMAP.md) and [BUILD-GUIDE.md](./BUILD-GUIDE.md).
