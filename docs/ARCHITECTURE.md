# Architecture

## The one idea

**Public kit teaches behavior. Private `.ai/` holds your team's knowledge.**

```text
@amitmishrg/engineering-os (npm)
        │
        │  init / update / doctor
        ▼
   your-project/.ai/
        │
        │  read before every task
        ▼
   Cursor or Claude agent
        │
        │  knowledge-capture after task
        ▼
   .ai/memory/ updated
```

## Three layers

### 1. CLI (`packages/cli`)

Node program developers run:

- `init` — scaffold `.ai/`, install adapters
- `doctor` — sanity checks
- `update` — new skills, **preserve memory**
- `validate` — lint memory records against schemas
- `report` — terminal tables from memory

### 2. Core (`packages/core`)

Markdown and JSON only — no runtime dependency. This is what agents actually read:

- **Skills** — procedural workflows (`/feature`, `/bug`, …)
- **Templates** — bootstrap project docs
- **Schemas** — validate memory record frontmatter

### 3. Project `.ai/` (in each app repo)

| Area         | Contents                                                               |
| ------------ | ---------------------------------------------------------------------- |
| Constitution | `project.md`, `architecture.md`, `conventions.md`, `design-system.md`  |
| Memory       | `memory/bugs/`, `features/`, `performance/`, `decisions/`, `patterns/` |
| Index        | Auto-generated lookup tables in `index/`                               |

## Agent lifecycle

```text
User request
     → historical-context (search memory)
     → workflow skill (/feature, /bug, …)
     → implement
     → /verify (tests + docs)
     → knowledge-capture (write memory)
     → memory index rebuild
```

## Design rules we follow

1. **Skills are small** — one job each, composed by wrappers
2. **No agent explosion** — 2 agents max (indexer, repo-scout)
3. **Evidence over guessing** — especially performance (CDP + Web Vitals)
4. **Preserve markers** — `<!-- engineering-os:preserve -->` blocks survive `update`
5. **Readable code** — boring TypeScript, no framework inside the CLI

## Harness adapters

Same skill files, different install location:

| Harness | Skills path                      | Always-on rules                    |
| ------- | -------------------------------- | ---------------------------------- |
| Cursor  | `.cursor/skills/engineering-os/` | `.cursor/rules/engineering-os.mdc` |
| Claude  | `.claude/skills/engineering-os/` | `CLAUDE.md` snippet                |

Canonical source is always `packages/core/skills/`.
