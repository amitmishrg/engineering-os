# Conventions

Coding rules for **this** repo. Agents must follow these before writing code.

<!-- engineering-os:preserve -->

## Do

- Use existing components from the design system
- Follow the folder structure defined here
- Match existing naming patterns in the codebase

## Do not

- Create duplicate UI primitives (Button, Input, etc.)
- Introduce new state-management libraries without an ADR
- Bypass existing API clients

## Folder structure

```
src/
  features/     # feature modules
  components/   # shared UI
  lib/          # utilities
```

## State management

- Server state:
- Client state:
