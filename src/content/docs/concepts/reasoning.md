---
title: Tiers and reasoning
description: How roles get a model capacity (tier) and a reasoning level, the -high variants, overrides and caps.
sidebar:
  order: 5
---

Every worker role has a **tier** (how much model capacity) and a **reasoning** level (how much it thinks before answering). Both are written in a tool-neutral scale in the role's definition. A real model name appears only in `.act/tiers.json`, and is applied when the role's file for your tool is generated.

## Tiers

| Tier | Meant for | Default cap (tool calls) |
| :--- | :--- | :--- |
| `light` | reads and counts | 10 |
| `standard` | implementation | 40 |
| `elevated` | review and security judgment | 60 |
| `high` | a task that needs more reasoning than `elevated` | 80 |
| `expert` | escalation after two failed attempts on one task | 80 |

For Claude Code, `.act/tiers.json` maps `light` to Haiku, `standard` to Sonnet, `elevated` and `high` to Opus (`high` with the reasoning bumped one step) and `expert` to the top model. Other tools have no mapping yet; for them the generated files keep whatever model they have.

The reasoning scale is `none`, `low`, `medium`, `high`, `xhigh`, `max`.

## Per role

| Role | Tier | Reasoning |
| :--- | :--- | :--- |
| `quick-check` | `light` | `none` |
| `explorer` | `standard` | `low` |
| `builder`, `doc-writer`, `test-writer`, `optimizer` | `standard` | `medium` |
| `debugger` | `standard` | `high` |
| `reviewer` | `elevated` | `high` |
| `expert-solver` | `expert` | `max` |

The [roles reference](/agentic-coding-template-docs/reference/roles/) is generated from the template and always current; what each role does is in [Roles](/agentic-coding-template-docs/concepts/roles/).

## The -high variants

Next to `.claude/agents/<role>.md`, the template generates `.claude/agents/<role>-high.md`: the same role with the reasoning one step further up the scale. The assistant names the `-high` variant for a single assignment that needs more thought, without raising the role for good. A role already at the top of the scale (`expert-solver`) has no variant.

## Overriding a role

The Roles table at the end of `docs/ai/config.md` is empty by default. Fill a row to change one role:

```markdown
| Role | Tier | Reasoning | Model |
| :--- | :--- | :--- | :--- |
| builder | elevated | high | |
```

`Tier` and `Reasoning` override the template's values; a filled `Model` sets the model outright and wins over `Tier`. A project's own role (see [Own rules, skills and roles](/agentic-coding-template-docs/guides/own-skills-and-rules/)) is named there the same way. The generated files are refreshed at session start and on every update; only their `model` and `effort` lines are touched, never your own additions in the role's text.

## Caps

Every assignment to a worker names its tier, an estimate and a cap on tool calls (`Cap: <n>`). The `worker-cap` check enforces it mechanically: the worker gets one note on reaching the cap and is refused from 1.5 times the cap. Without a `Cap:` line the tier's default applies (table above); without a tier, `standard`.

The assistant records after each result whether it was accepted, reworked or escalated. When a role and tier show many reworks, `doctor` proposes a higher tier; with none over many results, a lower one. It is only ever a proposal, never a live change; you decide.
