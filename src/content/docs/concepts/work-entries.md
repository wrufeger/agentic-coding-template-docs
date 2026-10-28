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

The inbox is the one place where something waits for you. Each file opens with YAML frontmatter between two `---` lines (`id`, `kind`, `for`, `status`, `created`), so Markdown editors and forges show the fields as metadata, and has one of four kinds. Tasks, backlog items, journal entries and the archive use the same frontmatter; entries in the older plain header form are still read, and `act-update` rewrites existing ones once. Proposals under `docs/ai/proposals/` are written with frontmatter too (`author`, `date`, `target`); older plain ones are read but not rewritten:

| `kind` | Id | What it is | Status flow |
| :--- | :--- | :--- | :--- |
| `question` | `Q12` | a decision or question for you; you answer below its `**Answer:**` label | `open` → `answered` → `done` |
| `todo` | `U3` | a step only a person can take, filed once it is actionable | `open` → `done` |
| `report` | none | a tool's read-only report, for example from `doctor` or an adoption | `open` → `done` (read) |
| `note` | none | your own note; the assistant replies below it | `open` → `answered` → `done` |

An entry without a `kind` counts as `todo`. The `for:` field says whom an entry is addressed to: `all` or a person's workspace identity. A `done` entry is moved to the archive, whatever its kind. A reply the assistant has promised, or a counter-check it expects from another session, is filed as a `todo` with `for:` naming whom or what it waits for (or `all`), so the promise outlives the session; `act-commit` asks "anyone waiting?" before it reports.

A chat message that begins with `todo:`, `note:` or `idea:` (any letter case) is a quick capture: with `quick-capture` on (the default), the `UserPromptSubmit` hook files it without a model turn, so it costs no tokens and does not interrupt a running task. `todo:` and `note:` become inbox entries marked `triage: open`; `idea:` becomes a new section in your ideas file (below). The assistant processes each `triage: open` entry right after the answered ones: it decides whom a todo is for or turns it into a backlog item, or replies below a note. Where the hook does not run, the assistant files the message itself (rule `R-human-capture`).

A question is one file per question, with options as lines `- **a)** …` (not a numbered list) and the recommendation marked. `entries.py new question` ends it with an empty `**Answer:**` label (`**Antwort:**` with `language-docs: de`); the answer goes below that label, and before booking one the assistant reads the file again so it never lands under a second label.

The assistant creates entries with `python .act/scripts/entries.py new <kind> <title>`; the [scripts reference](/agentic-coding-template-docs/reference/scripts/) lists every option.

Notes get a reply in one appended block of at most three lines of text, never inside your own words. Your words are never edited or deleted, only commented on underneath.

## Tasks, backlog, journal

- **Tasks** (`T7`): one file per open task with the goal and the check criteria. The first working-state line (`entries.py state T7 <text>`) or `entries.py start T7` writes `started:` into the frontmatter; the board then marks the task as running (or waiting, see below). The current working state itself lives in the gitignored `.act-local/state/`, not in the task file. The `for:` field says whose task it is; `all` or no field means shared.
- **Backlog** (`B5`): an idea or change request that is not built yet. It becomes a task when work on it starts. With `inbox-decisions: at-start` an entry may carry `decision: open` until work begins (see [Configuration](/agentic-coding-template-docs/concepts/configuration/)).
- **Journal**: one file per step, named `YYYY-MM-DD-<slug>.md`. Journal entries never get a short id. Old ones are later folded into monthly collection files (see Archive).

## Archive

Finished tasks, backlog items, processed inbox entries and decided proposals move to `docs/ai/work/archive/` under their old name, so the history stays readable and the overviews stay generated. The assistant does this when it closes out an accepted task (`act-commit`); a task, backlog item or inbox entry goes in one step with `entries.py archive <id|file>`, and an inbox entry gets `status: done`. A decided proposal is moved by hand to `docs/ai/work/archive/proposals/`. Images and other files the entry links beside itself (a pasted `img.png`) move along, generic or already taken names get the entry id in front (`Q12-img.png`), and links are rewritten. A file that another Markdown file under `docs/` still links is copied instead of moved. Everything is planned before the first write, so a failure leaves nothing half-done. `doctor` reports files under `docs/ai/inbox/` and `docs/ai/concept/` that no Markdown file links (kind `orphan-file`), for example a picture left behind after archiving by hand.

### Compacting

A thousand single files in one folder are unreadable in an IDE. When `archive-compact` in `docs/ai/config.md` § Archive says so, the session start notes that compaction is due and gives the number of entries to merge, and the `act-compact` skill runs at the next task boundary (in team mode only on the default branch). No worker takes part. The note counts entries the way `entries.py compact` dates them (by the day Git archived them), so it never counts entries that `compact` would leave alone. `entries.py compact` merges archived and journal entries older than a week into one file per kind and month (`Q-2026-09.md`, `ledger-2026-09.md` ...) with one anchored section per entry, each word for word. Links are rewritten to the anchors, the file head names the commit that still holds the full text, `--plan` previews, and a second run changes nothing. It refuses while a file to merge is uncommitted. For every month with a Q, T, B or U section it also writes the overview `archive/YYYY-MM.md` itself: one line per entry with a link to its section, its title and its status. An existing overview, also a hand-written one, only gets the lines of entries it does not list yet. Nothing is shortened. `compact_check.py` compares every section with the original in git: ids, hashes, versions, dates, paths, numbers and every line you wrote, marked or not, must survive. After a plain merge it reports nothing; a problem points to a hand edit or a bug. A section deleted by hand is reported, and `--restore` puts a section back in full length. Your words stay untouched here as everywhere. The full text of every entry stays in git.

## Ideas file

Every person has their own file `docs/ai/concept/ideas-<identity>.md`, where `<identity>` is the short name in `.act-local/identity.json`. You write each idea as its own `## <title>` section; only you write entries there, so two people never edit the same file. The next session start notices what is new or changed and has it processed:

- The assistant answers below the entry, only where something needs you, in at most three lines and at most three blocks per entry.
- A heading with "Draft" gets only a short first reaction. Remove the word and the entry is analysed completely.
- A decision only you can make becomes an inbox question.
- A processed entry moves, word for word, into the backlog item or concept it became, and leaves the file.

## Board and status line

The **board** is a generated snapshot: branch, recent journal entries, what is waiting for you, open tasks, open decisions in the backlog and the backlog itself. Under Status it also lists a template update that waits to be installed (`Template update available: 2.4.0`). It is rewritten at session start and after git commands that change the checked-out state. Where it goes depends on the `board` key: `docs` (default, `docs/ai/board.md`, gitignored), `shared` (additionally a versioned `docs/ai/board-<identity>.md`, written at commit time) or `local` (under `.act-local/`). A second generated file, `.act-local/inbox-<identity>.md`, collects the full text of every open entry addressed to you, so one file is enough to read.

The **status line** of Claude Code shows one line under the chat, for example `act · Q103 Q104 · tasks: 1 run, 1 wait, 4 new · ctx 127k`. `ctx` is the size of the session's context. While a template update waits to be installed, `update: 2.4.0` (on the `latest` channel `update: <date>` of the newer commit, `DD.MM.YYYY` when `language-docs` is `de`, else `YYYY-MM-DD`; the short hash where the date cannot be read without the network) stands before `ctx`. A started task counts as waiting, and the board marks it "(waiting)", when its last state line was written with `entries.py state <id> --wait`, is older than `task-wait-hours`, or an open todo or question names it (see [Configuration](/agentic-coding-template-docs/concepts/configuration/)). Open questions and todos appear by id, reports and notes as a count per kind. To turn it off for good, set your own `statusLine` command in `.claude/settings.json`; the template never replaces an entry it did not generate.

## Throwaway material

Probes, throwaway projects and scratch files go into the system temp directory. Where the tool refuses that to a worker, they go into `.act-local/tmp/<task-id>-<slug>/`, never directly under `.act-local/` (`R-work-throwaway`). When the assistant commits a task, `act-commit` removes that task's folders (`act_local_tidy.py --task <id>`). What is left is cleared at session start by `act-local-tidy` after 7 days, unless the name starts with an open task's id or `act-local-keep` lists it, see [Configuration](/agentic-coding-template-docs/concepts/configuration/).

## Solo and team mode

The `mode` key (`solo` or `team`) changes one thing: when an entry gets its short id.

- **`solo`**: the assistant assigns the id immediately.
- **`team`**: only whoever files the entry on the default branch assigns it (`entries.py assign`), so two people can never hand out the same number. Until then the file name is what you cite, for example `T-<identity>-<YYYYMMDD-HHMM>-<slug>.md`.

File names, locations and formats are the same either way, so you can switch at any time; ids already given stay. See [Working as a team](/agentic-coding-template-docs/guides/team/).
