# Build guide — phase by phase

## Phase 0 — Scaffold ✅

Monorepo, CLI entry, core templates, docs.

## Phase 1 — init ✅

- `init` scaffolds `.ai/`, scans components, installs Cursor + Claude adapters
- `doctor`, lockfile, project detection

## Phase 2 — Memory engine ✅

- `validate` — JSON Schema validation
- `memory index` / `memory search`
- `git branch`

## Phase 3 — Workflow skills ✅

All skills in `packages/core/skills/`:

- Wrappers: context, feature, bug, review, performance, verify
- Primitives: historical-context, feature-intake, requirement-grill, design-system-check, feature-doc-update, knowledge-capture, regression-test

## Phase 4 — Adapters ✅

- `install-adapters.ts` copies skills to `.cursor/` and `.claude/`
- Cursor rule: `.cursor/rules/engineering-os.mdc`
- Claude snippet in `CLAUDE.md`
- `update` refreshes adapters without touching memory

## Phase 5 — Performance lab ✅

- `profile run` — CDP + Web Vitals (requires Chrome)
- `profile compare` — before/after HTML
- See `packages/cli/src/lib/performance/`

## Phase 6 — Report + publish ✅

- `report` — HTML dashboard
- `scan` — design system auto-scan
- GitHub Actions CI
- [GETTING-STARTED.md](./GETTING-STARTED.md)

## Try everything

```bash
npm install && npm run build
mkdir /tmp/my-app && cd /tmp/my-app
echo '{"name":"app","dependencies":{"react":"18"}}' > package.json
npx --prefix ../engineering-os/packages/cli . init --scan
engineering-os validate
engineering-os report --open
```

## Next (v0.2)

- `/ship` — PR bridge
- `/sync` — doc-code drift
- `/incident` — production postmortems
- Jira/Linear links on records
