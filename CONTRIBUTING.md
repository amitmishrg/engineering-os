# Contributing

Thanks for helping improve Engineering OS.

## Development setup

```bash
git clone <your-fork>
cd engineering-os
npm install
npm run build
```

Run the CLI against a test project:

```bash
node packages/cli/dist/cli.js --help
cd /path/to/your-app
node /path/to/engineering-os/packages/cli/dist/cli.js init --scan
```

## Before opening a PR

```bash
npm run format:check
npm run build
```

CI runs format check, build, init smoke test, and validate smoke test (multiple memory records).

## Project layout

| Path                       | Purpose                         |
| -------------------------- | ------------------------------- |
| `packages/cli/`            | Node CLI                        |
| `packages/core/skills/`    | Agent skills (source of truth)  |
| `packages/core/schemas/`   | Memory record JSON schemas      |
| `packages/core/templates/` | Init templates copied to `.ai/` |

Skills are copied into `packages/cli/core/` on build for npm publish. Edit skills in `packages/core/`, then run `npm run build`.

## Changing skills

1. Edit `packages/core/skills/<name>/SKILL.md`
2. `npm run build`
3. In a test app: `engineering-os update`
4. Verify behavior in Cursor or Claude Code

## Changing CLI commands

1. Edit `packages/cli/src/commands/` or `packages/cli/src/lib/`
2. `npm run build`
3. Test in a consumer project (not the monorepo root)

## Pull requests

- One focused change per PR when possible
- Update docs if CLI behavior or skills change
- Keep skills concise and actionable — agents read them on every task
