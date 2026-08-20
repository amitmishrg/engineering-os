---
name: knowledge-capture
description: After significant work, write bug/feature/perf/ADR/pattern records and rebuild index.
version: 0.1.0
compatible: [cursor, claude]
---

# knowledge-capture

Decide: bug record | feature update | PERF record | ADR | pattern | skip.

Required fields: id, title, branch, owner, dates.

Run `engineering-os memory index` after writing records.
Run `engineering-os validate` before finishing.

