---
title: Layers and overrides
description: How the template layer and the project layer fit together, and how to change a rule without losing it on update.
sidebar:
  order: 1
---

## Two layers

| Layer | Content | Changed by |
| :--- | :--- | :--- |
| `.act/` | Rules, coding rule sets, skills, agent roles, hooks, scripts, tier table | An update replaces it as a whole. You never edit it. |
| `docs/` | `ai/` (config, rules, board, inbox, tasks, journal) and `project/` (your documentation) | You and the assistant. An update never overwrites your content; it refreshes unedited generated files, files findings in the inbox and runs migrations. |

`.act-local/` stays on your machine: local state and caches. The generated board is `docs/ai/board.md` (gitignored) in the default `board: docs` mode and lives in `.act-local/` only in `local` mode. In Claude Code, a hook blocks
writes into `.act/`.

## The project wins

A project-specific version of anything under `.act/` goes to `docs/ai/local/<same path>`. The same relative path
is looked up there before `.act/`, so a rule file, a skill folder (`docs/ai/local/skills/<name>/`), or an agent
(`docs/ai/local/agents/<name>.md`) shadows the template's. `docs/ai/local/` is yours: the assistant writes there
only on your explicit instruction. A skill or agent you add with `act-load-settings` lands there too; one you
create by hand there gets its tool copies at the next session start (default `session-start-refresh: block`) or update.

## Switching rules on and off

`docs/ai/rules.md` imports the rule files and lists every rule with a checkbox. A checked rule applies; an
unchecked rule is off, even though its text is loaded. Drop an import line to switch off a whole area. Your own
text goes in the sections at the end of the file:

- `## Overrides`: ``- replaces `R-id`: <your wording>``. The line replaces the whole text of that rule, checked or not.
- `## Own rules`: ``- `R-your-id`: text`` or a bare bullet, in addition to the template's rules.

`python .act/scripts/rules.py --list --area core` shows every rule with its state, overrides as `[~]` and own rules as `[+]` (without `--area core` it lists the coding sets);
`--validate` reports text it could not read. Path-bound rules of Claude Code under `.claude/rules/**/*.md` show up in `--list` with their `paths:` patterns; `--validate` warns about a pattern that matches no project file and a file without `paths:`.

## What the main session and a worker load

The main session loads `CLAUDE.md`, which imports `docs/ai/rules.md` and through it the shared rules, the coding rules and the orchestrator rules. A worker does not load `CLAUDE.md`; a `SubagentStart` hook gives it the same text without the orchestrator rules (see [Roles](/agentic-coding-template-docs/concepts/roles/)). `python .act/scripts/rules.py --worker` shows what a worker gets, `--imports` what the main session loads. The rules that a hook checks mechanically are kept short in the rule file: the ban or duty and the name of the check stay, while what the check recognises, its limits, its switch and its syntax stand on the [checks page](/agentic-coding-template-docs/reference/topics/#checks).

## Coding rule sets

`docs/project/coding_rules.md` works the same way for coding rules. Each line `- [x] use: @../../.act/coding/<set>.md` (checked) or `- [ ] use: .act/coding/<set>.md` (unchecked) switches
a set on or off, with its groups (`CR-<set>-<group>`) listed below and each individually checkable. `init` presets
the boxes from the stack it detects, and `stack` in `docs/ai/config.md` is where you correct it. The same sections
for overrides and own rules apply. Sets exist for, among others, Python, TypeScript, Vue, Nuxt, Tailwind, PHP, Java, Go, Rust, Kotlin, C, C++, PowerShell, Docker, CI, CSS, JavaScript and React. When an update brings a new set, it appears unchecked in the file; a new group of a checked set appears checked. Existing lines, boxes and your own rules stay as they are.

## Settings

`docs/ai/config.md` steers workflow, checks, roles, and languages. Its `## Roles` table overrides the tier,
reasoning, or model of one role. See the [configuration reference](/agentic-coding-template-docs/reference/configuration/),
the [rules reference](/agentic-coding-template-docs/reference/rules/), and the
[coding rules reference](/agentic-coding-template-docs/reference/coding-rules/).

## Why the split

An update can replace `.act/` without a merge, because the project never edited it. Your decisions sit in files the
update does not own. If an update finds a hand edit in `.act/` anyway, you choose: `rescue` moves it to
`docs/ai/local/`, `discard` drops it, `abort` stops the update.
