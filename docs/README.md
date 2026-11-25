<!-- act:default -->
# Documentation index

What lives under `docs/`, in one table, so a new session (or a new person) knows what to read
before doing what. `act-commit` adds a row for anything new right after a task is accepted
(step 5); `act-audit-docs` sweeps the whole table for stale "data as of" dates (step 4). Edit
this file directly for anything those two miss — it stays a plain table, not a generated one.

## Index

| File | Contents | Data as of | When to read |
| :--- | :--- | :--- | :--- |
| `docs/project/` | The project's documentation as it is now; its `README.md` has one line per file and subfolder (`R-docs-order`). Holds `coding_rules.md` (which rule sets are on for this stack) and `german-glossary.md` (wording rules for the German pages) | 2026-11-14 | before writing or reviewing code; before writing a German page; to find a document, read `docs/project/README.md` |
| `docs/ai/config.md` | Project configuration — steers the assistant | 2026-10-04 | before any task; re-read after a change |
| `docs/ai/board.md` | Board — generated overview of what is open (not versioned by default, see `board` in `config.md`) | 2026-10-04 | at session start, for the current picture |
| `docs/ai/rules.md` | Orchestrator-only rule digest, loaded at session start | 2026-10-04 | orchestrator, every session (automatic) |
| `docs/ai/whiteboard-<identity>.md` | One whiteboard per person: your own ideas, bugs, notes and reminders, picked up at the next session start; rules in `docs/ai/README.md` | 2026-11-25 | whenever you have an idea or want a reminder; the assistant when the session start names new or due entries |
| `docs/ai/inbox/` | Things waiting for a decision: questions (proposed rule changes too), tasks for a human, tool reports, notes | 2026-11-25 | at session start, and before starting a new task |
| `docs/ai/work/tasks/`, `docs/ai/work/backlog/` | Open tasks (the assistant's own work) and backlog items | 2026-10-04 | when picking a task or grooming the backlog |
| `docs/ai/work/ledger/` | Journal — one entry per file, newest first | 2026-10-04 | to see recent activity; `board.py` reads it too |
| `docs/ai/work/archive/` | Finished tasks/backlog/proposals, kept for reference | 2026-10-04 | rarely — history, not current state |
| `docs/ai/local/` | This project's own overrides of template files | 2026-10-04 | whenever the matching template file changes |

A file created later under `docs/project/` (`architecture.md`, `features.md`, `testing.md`,
`decisions.md`, `incidents/`) gets its own row here once it exists — nothing here creates those
files, this index only lists what is already there.

## Per-tool display settings

`docs/ai/config.md` § "Output depth" controls what the assistant itself writes as chat text —
not what the tool's own interface shows around that (its own verbosity/reasoning-display
settings, notification style, and similar). That is a setting of the tool, not of this project;
configure it where the tool documents it (for Claude Code, see `/config` inside a session or its
own settings file) — this file does not track it further.
