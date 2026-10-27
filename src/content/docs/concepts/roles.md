---
title: Roles and workers
description: The orchestrator, the worker roles, tiers, caps, write scope, and what a worker may not do.
sidebar:
  order: 2
---

## Orchestrator and workers

The main session is the **orchestrator**. It plans, reviews, commits, and is the only one that writes to
`docs/ai/`. It starts workers, which are sub-agents with a bounded assignment. You never talk to a worker
directly. Naming a role in the chat (`reviewer`, `explorer`) is an instruction to the orchestrator to deploy it. The orchestrator hands work over only where that pays off: independent parts that run in parallel, the review, output of unknown or large length not needed afterwards, long reading or runs a cheaper tier does as well. A known file or spot, a few tool calls or a small change it does itself; its review still follows `R-code-commit`. The template's roles come before the tool's own agents (in Claude Code `Explore`, `general-purpose`, `Plan`).

## The roles

| Role | For |
| :--- | :--- |
| `builder` | Implementation: code, migration, tests, config. |
| `explorer` | Read-only research across many files; findings as `path:line`. |
| `reviewer` | Adversarial review before acceptance; ALLOW, CONDITIONAL or BLOCK. |
| `doc-writer` | Edits to `docs/project/`, never `docs/ai/`. |
| `test-writer` | Tests for existing code, or test-first from a concept. |
| `quick-check` | Fixed, read-only lookups without judgment. |
| `debugger` | Finds a bug's cause by hypothesis, read-only. |
| `optimizer` | Polishes new code for brevity and readability, optional. |
| `expert-solver` | Escalation after two failed attempts. |

Model, tier, reasoning, and tools for each role: [Roles reference](/agentic-coding-template-docs/reference/roles/).
A role runs as a sub-agent only in Claude Code; other tools get the rules and skills as instructions. In Claude Code, `builder` and `explorer` also know that path-bound rules under `.claude/rules/` load only when a matching file is read or written through a file tool, not through a search or a shell command; they read the matching rule file first.

## Tiers

A tier says how much model capacity an assignment gets: `light` for reads and counts, `standard` for implementation,
`elevated` for review and security judgment, `high` as `elevated` with one more reasoning step, and `expert` only
for an escalation. `.act/tiers.json` is the one place that maps tiers to concrete models, today only for Claude
Code. To change one role, fill a row in `## Roles` of `docs/ai/config.md`.

## Caps and write scope

Every assignment states its tier, an estimate, and a cap as `Cap: <n>` tool calls. Without one the tier's default
applies: `light` 10, `standard` 40, `elevated` 60, `high` and `expert` 80. The worker gets one note at the cap
and is refused from 1.5 times the cap. It also states a `Write scope:` of paths relative to the project;
`Write scope: none` means read-only in the project. Every worker, whatever its scope, may still write into the system temp directory when the path is written out (`/tmp/...` in Bash, or its absolute path), unless the project itself lies there; throwaway material goes there (`R-work-throwaway`). A scope `dir/**` also covers creating `dir` itself. Brackets in a pattern are read literally, so `server/api/[id]/**` names the folder called `[id]`, and a shell command whose wildcard reaches outside the scope is refused. Both are checked mechanically by hooks (`worker-cap`, `worker-write-scope`
in `docs/ai/config.md` § Checks, each `block`, `warn`, or `off`). The exact syntax of `Cap:` and `Write scope:` and the limits of the checks are on the [checks page](/agentic-coding-template-docs/reference/topics/#checks); the block messages name the syntax too. Workers running at the same time need separate write scopes: `worker-scope-overlap` refuses a start whose scope overlaps that of a worker still running. An assignment that reads another worker's result names it as `Depends on:` and starts only after that worker has ended.

## How a worker gets its rules

A worker does not load `CLAUDE.md`: the template's roles carry `omitClaudeMd: true`, because `CLAUDE.md` would pull the orchestrator rules into every worker start although only the main session needs them. Instead a `SubagentStart` hook hands the worker the rest of what `CLAUDE.md` loads: the shared rules, the coding rules, your own rules from `docs/ai/rules.md`, `CLAUDE.local.md` and the user-level `~/.claude/CLAUDE.md`, but nothing from `.act/rules/orchestrator/`. The text comes in parts of under 10,000 characters, delivered over up to 12 `SubagentStart` entries, and saves about 21,000 characters per worker start. If 12 are not enough, the last entry names the files the worker reads itself, and `rules.py --worker` and `act-doctor` warn which rule files to shorten. `python .act/scripts/rules.py --worker` shows the parts. An update adds the field and the hook entries to existing template roles; an own role without the field loads `CLAUDE.md` as before. Claude Code before 2.1.271 ignores the field, so its workers get the rules twice, which only costs tokens. Details: [Topics](/agentic-coding-template-docs/reference/topics/#worker-rules).

## What a worker may not do

- Never commit, and never write to `docs/ai/`.
- Never ask you directly: open questions go back to the orchestrator with the result.
- Git is read-only (`status`, `diff`, `log`, `show`).
- Never start another worker. If a task should be split, it says so and the orchestrator decides.
- Return a result plus evidence in at most 40 lines, no raw dumps.
- Mark every assumption as an assumption; the orchestrator confirms it, asks you, or records it, and never leaves it only in the report.
- Fix a failing check in the code, never by deleting, skipping or loosening the check; the `reviewer` blocks that unless the reason is named.

## Failure and cost

A worker that fails the same task twice gets no third identical attempt: the orchestrator sharpens the assignment
once, or hands it to `expert-solver` with the full failure context; `expert-solver` is called only after those two failures (`R-role-escalate`). After accepting, reworking, or escalating a
result it records the outcome with `usage.py --outcome`; from enough reworks among them `doctor.py --inbox` files a proposal for a higher tier as an inbox question of its own, with the options to raise it, leave it until 8 more outcomes, or look at the cases first; a filed proposal does not return, even the same day, until 8 more outcomes,
and you decide. When a worker ends, the usage counter also reads its transcript and records duration, steps and tokens (`fresh` and `cache`) per role and tier in `.act-local/usage.json`, the newest 50 runs each; pauses of more than 30 minutes between two records count as idle time and stay out of the minutes. `usage.py --estimates` shows the median and the 80th percentile per role and tier; `usage.py --backfill` reads a project's existing transcripts once. The numbers stay local and are never sent with feedback; Claude Code only. The orchestrator also does not poll a running worker. An addition from you that fits a running assignment goes to that worker at once, or the worker is stopped and reassigned when one new run is cheaper than two. A wider write scope or a higher cap always means reassign, since both are read once when the worker starts.
