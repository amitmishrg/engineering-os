# Next.js profile

Applied during `init --profile nextjs`. Merges into `.ai/conventions.md` and `.ai/testing.md`.

## Conventions overlay

- App Router preferred for new routes
- Server state: React Query / TanStack Query
- Client state: Zustand or React context for local UI only
- API routes in `app/api/` or `pages/api/` matching existing project layout

## Testing overlay

- Unit: Vitest
- E2E: Playwright
- Run `npm test` before `/verify`
