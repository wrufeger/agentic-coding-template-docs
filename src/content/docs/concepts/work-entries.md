---
title: Work entries
description: What lives in docs/ai/ - inbox, tasks, backlog, journal, archive, ideas, the board and the status line.
sidebar:
  order: 3
---

`docs/ai/` is the shared working memory of you and the assistant. Everything in it is a plain file, one file per entry, versioned with the project. Overviews such as the board are generated from these files and never maintained by hand.

| Folder | Holds | Written by |
| :--- | :--- | :--- |
| `docs/ai/inbox/` | everything waiting on a person | you and the assistant |
| `docs/ai/proposals/` | proposed rule changes waiting for a decision | the assistant |
| `docs/ai/work/tasks/` | open tasks | the assistant |
| `docs/ai/work/backlog/` | ideas and change requests not yet built | the assistant |
| `docs/ai/work/ledger/` | the journal, one entry per step | the assistant |
| `docs/ai/work/archive/` | finished entries, kept instead of deleted | the assistant |
| `docs/ai/concept/` | one ideas file per person | you |

Workers (sub-agents) never write to `docs/ai/`; only the main assistant does (see [Roles](/agentic-coding-template-docs/concepts/roles/)).

## Inbox

The inbox is the one place where something waits for you. Each file starts with header fields (`id`, `kind`, `for`, `status`, `created`) and has one of four kinds:

| `kind` | Id | What it is | Status flow |
| :--- | :--- | :--- | :--- |
| `question` | `Q12` | a decision or question for you; you answer below it | `open` → `answered` → `done` |
| `todo` | `U3` | a step only a person can take, filed once it is actionable | `open` → `done` |
| `report` | none | a tool's read-only report, for example from `doctor` or an adoption | `open` → `done` (read) |
| `note` | none | your own note; the assistant replies below it | `open` → `answered` → `done` |

An entry without a `kind` counts as `todo`. The `for:` field says whom an entry is addressed to: `all` or a person's workspace identity. A `done` entry is moved to the archive, whatever its kind.

The assistant creates entries with `python .act/scripts/entries.py new <kind> <title>`; the [scripts reference](/agentic-coding-template-docs/reference/scripts/) lists every option.

Notes get a reply in one appended block of at most three lines of text, never inside your own words. Your words are never edited or deleted, only commented on underneath.

## Tasks, backlog, journal

- **Tasks** (`T7`): one file per open task with the goal and the check criteria. The first working-state line (`entries.py state T7 <text>`) or `entries.py start T7` writes `started:` into the header; the board then marks the task as running. The current working state itself lives in the gitignored `.act-local/state/`, not in the task file. The `for:` header says whose task it is; `all` or no field means shared.
- **Backlog** (`B5`): an idea or change request that is not built yet. It becomes a task when work on it starts. With `inbox-decisions: at-start` an entry may carry `decision: open` until work begins (see [Configuration](/agentic-coding-template-docs/concepts/configuration/)).
- **Journal**: one file per step, named `YYYY-MM-DD-<slug>.md`. Journal entries never get a short id.

## Archive

Finished tasks, backlog items, processed inbox entries and decided proposals move to `docs/ai/work/archive/` under their old name, so the history stays readable and the overviews stay generated. The assistant does this when it closes out an accepted task (`act-commit`).

## Ideas file

Every person has their own file `docs/ai/concept/ideas-<identity>.md`, where `<identity>` is the short name in `.act-local/identity.json`. You write each idea as its own `## <title>` section; only you write entries there, so two people never edit the same file. The next session start notices what is new or changed and has it processed:

- The assistant answers below the entry, only where something needs you, in at most three lines and at most three blocks per entry.
- A heading with "Draft" gets only a short first reaction. Remove the word and the entry is analysed completely.
- A decision only you can make becomes an inbox question.
- A processed entry moves, word for word, into the backlog item or concept it became, and leaves the file.

## Board and status line

The **board** is a generated snapshot: branch, recent journal entries, what is waiting for you, open tasks, open decisions in the backlog and the backlog itself. It is rewritten at session start and after git commands that change the checked-out state. Where it goes depends on the `board` key: `docs` (default, `docs/ai/board.md`, gitignored), `shared` (additionally a versioned `docs/ai/board-<identity>.md`, written at commit time) or `local` (under `.act-local/`). A second generated file, `.act-local/inbox-<identity>.md`, collects the full text of every open entry addressed to you, so one file is enough to read.

The **status line** of Claude Code shows one line under the chat, for example `act · Q103 Q104 · tasks: 1 running, 4 new`. Open questions and todos appear by id, reports and notes as a count per kind. To turn it off for good, set your own `statusLine` command in `.claude/settings.json`; the template never replaces an entry it did not generate.

## Solo and team mode

The `mode` key (`solo` or `team`) changes one thing: when an entry gets its short id.

- **`solo`**: the assistant assigns the id immediately.
- **`team`**: only whoever files the entry on the default branch assigns it (`entries.py assign`), so two people can never hand out the same number. Until then the file name is what you cite, for example `T-<identity>-<YYYYMMDD-HHMM>-<slug>.md`.

File names, locations and formats are the same either way, so you can switch at any time; ids already given stay. See [Working as a team](/agentic-coding-template-docs/guides/team/).
