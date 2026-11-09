---
title: Roles and workers
description: The orchestrator, the worker roles, tiers, caps, write scope, and what a worker may not do.
sidebar:
  order: 2
---

## Orchestrator and workers

The main session is the **orchestrator**. It plans, reviews, commits, and is the only one that writes to
`docs/ai/`. It starts workers, which are sub-agents with a bounded assignment. You never talk to a worker
directly. Naming a role in the chat (`reviewer`, `explorer`) is an instruction to the orchestrator to deploy it. The orchestrator hands work over only where that pays off: independent parts that run in parallel, the review, output of unknown or large length not needed afterwards, long reading or runs a cheaper tier does as well. In practice: research across more than three files or in code whose spot is not yet known, the evaluation of transcripts, logs or feedback, and material past about 20k tokens that is not needed afterwards go to `explorer`, which hands back only findings and numbers; a run of the test suite, a probe or a smoke test named in the assignment goes to `quick-check`, which hands back the exit code, the failures and the numbers. A known file or spot, a few tool calls, a small change, an entry under `docs/ai/`, a commit or `git status` it does itself; its review still follows `R-code-commit`. The template's roles come before the tool's own agents (in Claude Code `Explore`, `general-purpose`, `Plan`).

## The roles

| Role | For |
| :--- | :--- |
| `builder` | Implementation: code, migration, tests, config. |
| `explorer` | Read-only research across many files; findings as `path:line`. |
| `reviewer` | Adversarial review before acceptance; findings by severity, ALLOW, CONDITIONAL or BLOCK. It blocks only for an error on a path ordinary work reaches, a missing part of the assignment, a security hole or a weakened check; a case built only to break the change goes to the backlog. |
| `doc-writer` | Edits to `docs/project/` and its index lines (`R-docs-order`), never `docs/ai/`. |
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

Every assignment states its tier, an estimate, and a cap as `Cap: <n>` tool calls. Without one the default of the tier
applies: `light` 10, `standard` 40, `elevated` 60, `high` and `expert` 80; the tier is the one a `Tier:` line names, else the role's own,
and a tier you set for the role in `docs/ai/config.md` § Roles replaces the role's own. The worker gets one note at the cap
and is refused from 1.5 times the cap. It also states a `Write scope:` of paths relative to the project;
`Write scope: none` allows no writes at all. An assignment that runs tests or probes adds a `Tests:` line with the tree they run in (`Tests: <glob>[, <glob> ...]`); workers run tests only with it, and only those the change affects, while the full suite runs once on the accepted state before the commit, from the orchestrator. With a `Write scope:` line, a target in the system temp directory or the worker's scratchpad is refused like any other target outside the scope. Throwaway material goes into `.act-local/tmp/<task-id>-<slug>/`, which the assignment names in its scope as `.act-local/tmp/<task-id>-<slug>/**` (`R-work-throwaway`); the refusal says so. A worker whose assignment has no `Write scope:` line is not restricted by this check. A scope `dir/**` also covers creating `dir` itself. Brackets in a pattern are read literally, so `server/api/[id]/**` names the folder called `[id]`, and a shell command whose wildcard reaches outside the scope is refused. Both are checked mechanically by hooks (`worker-cap`, `worker-write-scope`
in `docs/ai/config.md` § Checks, each `block`, `warn`, or `off`). The exact syntax of `Cap:` and `Write scope:` and the limits of the checks are on the [checks page](/agentic-coding-template-docs/reference/topics/#checks); the block messages name the syntax too. `worker-write-scope` also reads inline interpreter code (`python`, `python3`, `py` or `node` with `-c`/`-e`, or code from a heredoc, here-string or pipe, in Bash or PowerShell): it refuses when the code holds a write call and a written-out path outside the scope. This is best effort; script files, paths built at run time and `subprocess` stay unseen. Workers running at the same time need separate write scopes: `worker-scope-overlap` refuses a start whose scope overlaps that of a worker still running, and also one whose `Tests:` tree meets a running worker's write scope or the reverse (a half-written tree would fail the run); the main session only gets a note, never a refusal; the refusal names three ways out: separate scopes, one joint assignment for tasks on the same files (per `R-cost-delegate`: one scope, a higher cap, one review), or waiting; a worker that is no longer wanted is stopped with `TaskStop`, which frees its scope at once, and a worker that is continued with a message keeps the scope of its assignment. Work expected to run longer than about five minutes is first checked for independent parts that can run in parallel, such as test and probe runs, case catalogs, assignments over separate files or a review per checked spot (`R-cost-delegate`). An assignment that reads another worker's result names it as `Depends on:` and starts only after that worker has ended.

## How a worker gets its rules

A worker does not load `CLAUDE.md`: the template's roles carry `omitClaudeMd: true`, because `CLAUDE.md` would pull the orchestrator rules into every worker start although only the main session needs them. Instead a `SubagentStart` hook hands the worker the rest of what `CLAUDE.md` loads: the shared rules, the coding rules, your own rules from `docs/ai/rules.md`, `CLAUDE.local.md` and the user-level `~/.claude/CLAUDE.md`, but nothing from `.act/rules/orchestrator/`. The text comes in parts of under 10,000 characters, delivered over up to 12 `SubagentStart` entries, and saves about 20,000 characters per worker start. If 12 are not enough, the last entry names the files the worker reads itself, and `rules.py --worker` and `act-doctor` warn which rule files to shorten. `python .act/scripts/rules.py --worker` shows the parts. An update adds the field and the hook entries to existing template roles; an own role without the field loads `CLAUDE.md` as before. Claude Code before 2.1.271 ignores the field, so its workers get the rules twice, which only costs tokens. Details: [`rules.py`](/agentic-coding-template-docs/reference/scripts/#rulespy).

## What a worker may not do

- Never commit, and never write to `docs/ai/`.
- Never ask you directly: open questions go back to the orchestrator with the result.
- Never make a write that a check refused another way (interpreter, script, other tool); report the refusal with the result.
- Never change the files `R-safe-git-metadata` protects (git hooks, Claude settings, agents and skills, `.mcp.json`, `.envrc`, editor tasks). Besides `git-metadata-guard`, the check `protected-watch` compares them with a snapshot after every tool call: a change made in a worker's call is put back at once, the changed version is kept under `.act-local/protected-watch/kept/`, and you and the orchestrator are told. See the [checks page](/agentic-coding-template-docs/reference/topics/#checks).
- Git is read-only (`status`, `diff`, `log`, `show`).
- Never start another worker. If a task should be split, it says so and the orchestrator decides.
- Return a result plus evidence in at most 40 lines, no raw dumps.
- Mark every assumption as an assumption; the orchestrator confirms it, asks you, or records it, and never leaves it only in the report.
- Fix a failing check in the code, never by deleting, skipping or loosening the check; the `reviewer` blocks that unless the reason is named.

## Failure and cost

A worker that fails the same task twice gets no third identical attempt: the orchestrator sharpens the assignment
once, or hands it to `expert-solver` with the full failure context; `expert-solver` is called only after those two failures (`R-role-escalate`). After accepting, reworking, or escalating a
result it records the outcome with `usage.py --outcome`; `doctor.py --inbox` looks at the last 30 outcomes of a role at a tier and, once 30 are recorded and at least 60 % were reworked or escalated, files a proposal for a higher tier as a short inbox question (recommended first: look at the cases first), with the numbers in an inbox report of its own; a filed proposal does not return, even the same day, until 30 more outcomes,
and you decide (details: [Tiers and reasoning](/agentic-coding-template-docs/concepts/reasoning/#caps)). When a worker ends, the usage counter also reads its transcript and records duration, steps and tokens (`fresh` and `cache`) per role and tier in `.act-local/usage.json`, the newest 50 runs each; pauses of more than 30 minutes between two records count as idle time and stay out of the minutes. `usage.py --estimates` shows the median and the 80th percentile per role and tier; `usage.py --backfill` reads a project's existing transcripts once. The numbers stay local and are never sent with feedback; Claude Code only. The orchestrator also does not poll a running worker. An addition from you that fits a running assignment goes to that worker at once, or the worker is stopped and reassigned when one new run is cheaper than two. A wider write scope or a higher cap always means reassign, since both are read once when the worker starts.
