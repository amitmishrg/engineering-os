# Engineering OS

Portable engineering kit for AI-assisted development (Cursor + Claude Code).

## Install in your project

```bash
npx @amitmishrg/engineering-os init --scan
engineering-os doctor
```

## Six workflows

```text
/context → /feature → /bug → /review → /performance → /verify
```

Memory, docs, and reports update underneath via `knowledge-capture`.

## CLI commands

| Command                     | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `init`                      | Bootstrap `.ai/`, adapters, lockfile         |
| `doctor`                    | Health check                                 |
| `update`                    | Upgrade skills (preserves memory)            |
| `validate`                  | Lint memory records                          |
| `memory index`              | Rebuild indexes                              |
| `memory search`             | Search memory                                |
| `scan components [--write]` | Update design-system.md (review draft first) |
| `report`                    | Terminal tables from memory records          |
| `git branch`                | Current branch for memory tags               |

## Repo layout

```text
packages/cli/     → Node CLI (you run this)
packages/core/    → Skills, templates, schemas (agents read this)
your-app/.ai/     → Your memory + constitution (you own this)
```

## Learn the code

1. [docs/CODEMAP.md](docs/CODEMAP.md) — every folder explained
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it connects
3. [docs/BUILD-GUIDE.md](docs/BUILD-GUIDE.md) — phases (all implemented in v0.1)
4. [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) — team onboarding

## Development

```bash
npm install
npm run build
npm run dev -- --help
```

## License

MIT
