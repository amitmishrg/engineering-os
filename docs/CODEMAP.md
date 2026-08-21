# CODEMAP — every folder explained

Read this first. Each path maps to **one responsibility**. If a file doesn't fit a row below, it probably shouldn't exist.

## Root

| Path           | You touch it when…                          |
| -------------- | ------------------------------------------- |
| `package.json` | Adding workspace packages or root scripts   |
| `README.md`    | Changing how outsiders discover the project |
| `docs/`        | Explaining architecture or build phases     |

## `packages/cli/` — the npm package people install

| Path                     | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `src/cli.ts`             | **Entry point.** Registers commands, nothing else. |
| `src/commands/init.ts`   | Copies templates into a project's `.ai/` folder    |
| `src/commands/doctor.ts` | Validates setup in the target project              |
| `src/commands/update.ts` | Upgrades skills without touching memory            |
| `src/lib/constants.ts`   | Version, path to `packages/core`, directory names  |
| `src/lib/fs.ts`          | Plain `fs` helpers — copy dir, write text          |

**Rule:** Commands stay thin. Heavy logic goes in `src/lib/` with descriptive names.

## `packages/core/` — harness-independent assets (source of truth)

| Path                | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `templates/ai/`     | Files copied into `.ai/` on `init`                      |
| `templates/memory/` | Starting points for BUG/FEAT/PERF records               |
| `schemas/`          | JSON Schema for `engineering-os validate`               |
| `skills/`           | Canonical `SKILL.md` files (Cursor + Claude read these) |
| `standards/`        | Generic React/Node/security baselines (Phase 3+)        |
| `workflows/`        | How skills chain together (Phase 3+)                    |

## `packages/adapters/` — harness-specific wiring (Phase 4)

| Path      | Purpose                                        |
| --------- | ---------------------------------------------- |
| `cursor/` | Rules + skill install paths for Cursor         |
| `claude/` | CLAUDE.md snippets + `.claude/skills/` install |

Adapters **copy from** `packages/core/skills/` — they never duplicate skill text in git.

## What lands in **your project** (not this repo)

```text
your-app/
├── .ai/                    ← project constitution + memory
├── .cursor/skills/...      ← installed by init (Cursor)
├── .claude/skills/...      ← installed by init (Claude)
└── engineering-os.lock.json
```

`.ai/memory/` is **never** overwritten by `engineering-os update`.
