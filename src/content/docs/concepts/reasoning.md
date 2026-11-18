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

For Claude Code, `.act/tiers.json` maps `light` to Haiku, `standard` to Sonnet, `elevated` and `high` to Opus (`high` with the reasoning bumped one step) and `expert` to the top model. For Copilot, the `copilot` table in the same file gives each tier an ordered list of models, and the first one your plan offers wins: `light` claude-haiku-5.5, then claude-haiku-4.5; `standard` claude-sonnet-5.5; `elevated` and `high` claude-opus-5.5, then claude-sonnet-5.5 (`high` again with the reasoning bumped one step); `expert` claude-fable-5.2, then claude-opus-5.5. The reasoning goes into the `reasoning-effort` field. Other tools have no mapping yet; for them the generated files keep whatever model they have.

The reasoning scale is `low`, `medium`, `high`, `xhigh`, `max`. Next to it a role may say `default`: no effort line is written, so the tool's own level applies; for a `-high` variant it counts as `medium`. An older `none` in the Roles table or a local role or skill file is read as `default`, and `act-doctor` names each place.

## Per role

| Role | Tier | Reasoning |
| :--- | :--- | :--- |
| `quick-check` | `light` | `default` |
| `explorer` | `standard` | `low` |
| `builder`, `doc-writer`, `test-writer`, `optimizer` | `standard` | `medium` |
| `debugger` | `standard` | `high` |
| `reviewer` | `elevated` | `high` |
| `expert-solver` | `expert` | `max` |

The [roles reference](/agentic-coding-template-docs/reference/roles/) is generated from the template and always current; what each role does is in [Roles](/agentic-coding-template-docs/concepts/roles/).

## The -high variants

Next to `.claude/agents/<role>.md` (with Copilot also `.github/agents/<role>.agent.md`), the template generates `.claude/agents/<role>-high.md` (`.github/agents/<role>-high.agent.md`) for `builder` and `reviewer`: the same role with the reasoning one step further up the scale. The assistant names the `-high` variant for a single assignment that needs more thought, without raising the role for good. The other template roles have no variant, and neither does a role already at the top of the scale (`expert-solver`); an update removes variants generated earlier for them. A role at `default` gets `high` in its variant. A project's own role keeps its variant. An assignment that named a removed variant names the role itself, or `builder-high` or `reviewer-high`.

## Overriding a role

The Roles table at the end of `docs/ai/config.md` is empty by default. Fill a row to change one role:

```markdown
| Role | Tier | Reasoning | Model | Copilot |
| :--- | :--- | :--- | :--- | :--- |
| builder | elevated | high | | |
```

`Tier` and `Reasoning` override the template's values; a filled `Model` sets the model outright and wins over `Tier`, but applies to Claude Code only. `Copilot` takes a comma-separated priority list of Copilot model IDs for the role's file under `.github/agents/`; the first one your plan offers is used, and a filled cell wins over `Tier` there. A table with four columns stays valid; after changing the `Copilot` column run `python .act/scripts/update.py --catch-up --yes`. A project's own role (see [Own rules, skills and roles](/agentic-coding-template-docs/guides/own-skills-and-rules/)) is named there the same way. The generated files are refreshed at session start and on every update; only their `model` and `effort` lines (for Copilot `model`, `models` and `reasoning-effort`) are touched, never your own additions in the role's text.

## Reasoning per skill

A skill may carry `reasoning: <level>` in its frontmatter (a value of the scale above) to ask for that thinking level while it runs. In the Claude Code copy under `.claude/skills/` the line becomes `effort:`; the `.agents/skills/` mirror stays verbatim, and a skill without the key inherits the session. To change it for one project, add a row to the Roles table that names the skill (for example `act-prepare`) in the `Role` column; only `Reasoning` counts there.

## Caps

Every assignment to a worker names its tier, an estimate and a cap on tool calls (`Cap: <n>`). The estimate is given in minutes and `tkn`, never in person-days: `~<n> min · ~<n> tkn fresh · ~<n> tkn cache` plus the assumption behind it. `act-idea`, `act-prepare` and the assistant base it on `usage.py --estimates` where measurements exist (see [Roles](/agentic-coding-template-docs/concepts/roles/)). The `worker-cap` check enforces the cap mechanically: the worker gets one note on reaching the cap and is refused from 1.5 times the cap. Without a `Cap:` line the default of the tier applies (table above): the tier a `Tier:` line names, else the role's own (`quick-check` `light`, `reviewer` `elevated`, `expert-solver` `expert`, every other role `standard`, a `-high` variant as its base role), and a tier set for the role in the Roles table of `docs/ai/config.md` replaces that role default.

The assistant records after each result whether it was accepted, reworked or escalated; a rework or escalation carries a reason: `assignment` (the assignment was unclear), `edge-case` (an edge case was missing), `worker` (the worker erred) or `decision` (the orchestrator changed its own decision). Only outcomes without a reason or with `worker` enter the window below, since a higher tier could not have avoided the others; `usage.py --show` lists the recorded reasons. `doctor.py --inbox` looks at the last 30 outcomes of a role at a tier and proposes a higher tier only once 30 are recorded and at least 60 % (18 of 30) were reworked or escalated; older outcomes drop out of the window (`usage.py --outcome` keeps their order in `.act-local/usage.json`). The proposal is an inbox question of its own with a short hint; the numbers (the finding, the outcomes per role and tier, the cost of a higher tier) stand in an inbox report that `doctor.py` writes right before it. The options are a) look at the cases first, marked `**Recommended:**` as for every question, b) raise the tier, c) leave it. It never proposes a lower tier: accepted results do not show that a cheaper tier would have done as well. It is only ever a proposal, never a live change; you decide. A filed proposal does not return, even the same day, until at least 30 more outcomes for that role and tier, and then only if 60 % of the last 30 are still reworked or escalated.
