---
title: Roles and workers
description: The orchestrator, the worker roles, tiers, caps, write scope, and what a worker may not do.
sidebar:
  order: 2
---

## Orchestrator and workers

The main session is the **orchestrator**. It plans, reviews, commits, and is the only one that writes to
`docs/ai/`. It starts workers, which are sub-agents with a bounded assignment. You never talk to a worker
directly. Naming a role in the chat (`reviewer`, `explorer`) is an instruction to the orchestrator to deploy it.

## The roles

| Role | For |
| :--- | :--- |
| `builder` | Implementation: code, migration, tests, config. |
| `explorer` | Read-only research across many files; findings as `path:line`. |
| `reviewer` | Adversarial review before acceptance; ALLOW or BLOCK. |
| `doc-writer` | Edits to `docs/project/`, never `docs/ai/`. |
| `test-writer` | Tests for existing code, or test-first from a concept. |
| `quick-check` | Fixed, read-only lookups without judgment. |
| `debugger` | Finds a bug's cause by hypothesis, read-only. |
| `optimizer` | Polishes new code for brevity and readability, optional. |
| `expert-solver` | Escalation after two failed attempts. |

Model, tier, reasoning, and tools for each role: [Roles reference](/agentic-coding-template-docs/reference/roles/).
A role runs as a sub-agent only in Claude Code; other tools get the rules and skills as instructions.

## Tiers

A tier says how much model capacity an assignment gets: `light` for reads and counts, `standard` for implementation,
`elevated` for review and security judgment, `high` as `elevated` with one more reasoning step, and `expert` only
for an escalation. `.act/tiers.json` is the one place that maps tiers to concrete models, today only for Claude
Code. To change one role, fill a row in `## Roles` of `docs/ai/config.md`.

## Caps and write scope

Every assignment states its tier, an estimate, and a cap as `Cap: <n>` tool calls. Without one the tier's default
applies: `light` 10, `standard` 40, `elevated` 60, `high` and `expert` 80. The worker gets one note at the cap
and is refused from 1.5 times the cap. It also states a `Write scope:` of paths relative to the project;
`Write scope: none` means read-only. Both are checked mechanically by hooks (`worker-cap`, `worker-write-scope`
in `docs/ai/config.md` § Checks, each `block`, `warn`, or `off`).

## What a worker may not do

- Never commit, and never write to `docs/ai/`.
- Never ask you directly: open questions go back to the orchestrator with the result.
- Git is read-only (`status`, `diff`, `log`, `show`).
- Never start another worker. If a task should be split, it says so and the orchestrator decides.
- Return a result plus evidence in at most 40 lines, no raw dumps.

## Failure and cost

A worker that fails the same task twice gets no third identical attempt: the orchestrator sharpens the assignment
once, or hands it to `expert-solver` with the full failure context. After accepting, reworking, or escalating a
result it records the outcome with `usage.py --outcome`; from enough of them `doctor.py` proposes a different tier,
and you decide. The orchestrator also does not poll a running worker.
