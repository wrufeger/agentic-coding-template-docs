---
id: U1
kind: todo
for: all
status: done
created: 2026-10-04T22:36:23
archived: 2026-11-14
---

# Check dependencies once

`dependency-check` in `docs/ai/config.md` is `once`: run `act-deps` now to inventory dependency age and known gaps (see `.act/skills/act-deps/SKILL.md`) — after this, it runs only on demand, not again at every setup.

**Moved (2026-11-14, docs sync):** `npm outdated` lists 3 outdated packages and `npm audit` 5 vulnerabilities; the update is tracked as backlog item B528 in the maintenance repo (template-pflege), not here.
