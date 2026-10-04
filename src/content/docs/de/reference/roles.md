---
title: "Rollen"
description: "Die Worker-Rollen mit Tier, Reasoning und Werkzeugen."
sidebar:
  order: 7
---

:::note
Diese Seite wird aus dem Template 2.0.0 (Commit 8ad385e) erzeugt; die deutschen Texte stammen aus einem Katalog unter `src/translations/de/reference/`. Nicht von Hand ändern, neu erzeugen mit `npm run gen`.

Einzelne Einträge dieser Seite sind noch nicht übersetzt oder veraltet; sie stehen auf Englisch da und sind mit _(noch nicht übersetzt)_ markiert.
:::

9 Rollen. A role is a bounded kind of worker; its tier says how much model capacity it gets, and `.act/tiers.json` maps tiers to concrete models only at generation time. _(noch nicht übersetzt)_

## builder

Implements a bounded assignment - code, migration, tests, configuration - and returns a result plus evidence; never commits. _(noch nicht übersetzt)_

- Tier: `standard`
- Reasoning: `medium`
- Werkzeuge: `Read, Write, Edit, Bash, Grep, Glob`

Implements a bounded assignment: code, migration, tests, configuration. Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/builder.md`

## debugger

Searches for a bug's cause by hypothesis rather than guesswork; reproduces first, separates symptom from cause. _(noch nicht übersetzt)_

- Tier: `standard`
- Reasoning: `high`
- Werkzeuge: `Read, Bash, Grep, Glob`

Searches for the cause of a reported bug that the orchestrator describes. Fixes nothing — the fix
is a separate assignment (`builder`). Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/debugger.md`

## doc-writer

Maintains docs/project/ (never docs/ai/) - works findings into the project docs, keeps cross-references and status markers current. _(noch nicht übersetzt)_

- Tier: `standard`
- Reasoning: `medium`
- Werkzeuge: `Read, Write, Edit, Grep, Glob, Bash`

Maintains `docs/project/` — project documentation, not the collaboration workspace under
`docs/ai/`. Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/doc-writer.md`

## expert-solver

High-reasoning escalation, called only after a worker has failed the same task twice or hit an unsolvable error. _(noch nicht übersetzt)_

- Tier: `expert`
- Reasoning: `max`
- Werkzeuge: `Read, Edit, Write, Bash, Grep, Glob`

Escalation only, per `R-role-escalate` — called after a worker has failed the same task twice, or
an edge case has a standard worker stuck. Senior architect and problem-solver for exactly that
case, not routine implementation. Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/expert-solver.md`

## explorer

Read-only codebase research across multiple files and directories; reports findings backed by path:line. _(noch nicht übersetzt)_

- Tier: `standard`
- Reasoning: `low`
- Werkzeuge: `Read, Grep, Glob, Bash`

Read-only research across multiple files and directories; findings backed by `<path>:<line>`.
Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/explorer.md`

## optimizer

Polishes freshly written code for brevity and readability - at most two rounds, no algorithm tuning. _(noch nicht übersetzt)_

- Tier: `standard`
- Reasoning: `medium`
- Werkzeuge: `Read, Edit, Bash, Grep, Glob`

Runs after `builder`, only on the code that assignment just wrote — files and lines named in the
assignment, never grown code from elsewhere and never project-wide. Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/optimizer.md`

## quick-check

Fixed, read-only lookups without judgment (git status, tests, files, line counts). _(noch nicht übersetzt)_

- Tier: `light`
- Reasoning: `none`
- Werkzeuge: `Read, Grep, Glob, Bash`

Runs a fixed set of read-only lookups and returns the raw result, without judgment. Applies
`R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/quick-check.md`

## reviewer

Adversarial review before a commit — bugs, style, and task fidelity — plus ALLOW/BLOCK on a flagged safeguard call. _(noch nicht übersetzt)_

- Tier: `elevated`
- Reasoning: `high`
- Werkzeuge: `Read, Bash, Grep, Glob`

Adversarial review before a commit, plus ALLOW/BLOCK on a flagged tool call. Applies
`R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/reviewer.md`

## test-writer

Writes tests to existing code, or test-first from a concept/interface alone; checks behavior, not implementation. _(noch nicht übersetzt)_

- Tier: `standard`
- Reasoning: `medium`
- Werkzeuge: `Read, Edit, Write, Bash, Grep, Glob`

Writes tests — to existing code, or test-first from a concept/interface description alone — and
proves them with a test run. Applies `R-role-worker`.

_(noch nicht übersetzt)_

Quelle: `.act/agents/test-writer.md`

## Tier-Zuordnung (Claude Code)

| Tier | Modell-Alias |
| :--- | :--- |
| `light` | `haiku` |
| `standard` | `sonnet` |
| `elevated` | `opus` |
| `high` | `opus` (Reasoning eine Stufe höher) |
| `expert` | `fable` |
