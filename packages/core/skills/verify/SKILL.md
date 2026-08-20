---
name: verify
description: Pre-ship verification — tests, docs updated, manual checks.
disable-model-invocation: true
version: 0.1.0
compatible: [cursor, claude]
---

# /verify — Ship verification

## Checklist

- [ ] Tests run and pass (show command output)
- [ ] Regression test for bug fixes
- [ ] **feature-doc-update** for features (architecture, docs/features, CHANGELOG)
- [ ] FEAT/BUG/PERF memory record complete (branch, owner, dates)
- [ ] Manual scenarios documented

Block ship if docs or memory incomplete.

