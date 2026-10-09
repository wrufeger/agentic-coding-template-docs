---
title: Configuration
description: docs/ai/config.md steers the workflow - its groups, and what block, warn and off mean for checks.
sidebar:
  order: 4
---

`docs/ai/config.md` is the file that steers how the project is worked on. It is a set of Markdown tables, one section per topic. `init` fills in the values from what it asked or detected; you change them any time. Nothing needs a rebuild: the session-start hook reads the file and reports what changed since the last sync. Every key with its allowed values is listed in the [configuration reference](/agentic-coding-template-docs/reference/configuration/); this page explains what the groups are for.

## Groups

- **Project**: name, owner, `language-chat` and `language-docs`, `stack`, the lint/typecheck/test `commands`, the `tools` you use and the `mode` (`solo` or `team`, see [Work entries](/agentic-coding-template-docs/concepts/work-entries/)). `language-chat` is the language the assistant talks to you in (`auto` follows your messages); `language-docs` is the language of everything it writes under `docs/`. `.act/` stays English either way. A command set to `(not set)` skips the matching check before a commit. `run` is the command that starts the application; `(not set)` means none is recorded.
- **Board**: `board` chooses where the generated board goes (`docs`, `shared`, `local`); `board-others` toggles the section for tasks assigned to other people.
- **Inbox**: `inbox-decisions` decides where an open decision waits. With `immediate` it goes into the inbox as soon as it is booked; with `at-start` a backlog entry may keep it until work on it starts.
- **Output depth**: `output-depth` (`verbose`, `normal`, `sparse`) controls how much the assistant writes in chat, not what your tool displays.
- **Session length**: `context-hint` (a token count, default 150000, or `off`) is the context size at which the assistant suggests `/clear` or a new session at the next task boundary; `task-wait-hours` (default 12) is how long a started task may stay quiet before it counts as waiting.
- **Dependencies** and **Docs audit**: `dependency-check` and `docs-audit-due` control the reminders to run `act-deps` and `act-audit-docs`.
- **Git hosting**: `target-branch`, `forge` and `forge-host` tell the pull-request skill where to go. github.com and gitlab.com receive the token without being named; a self-hosted host only after you have named it.
- **Checks**: mechanical guards that run before an action (below).
- **Logging**: `logging` and `log-level` write every agent action to `ai.log` at the project root, not versioned, handy to follow along in a second terminal.
- **Feedback**: voluntary feedback to the template author, see [Sending feedback](/agentic-coding-template-docs/guides/feedback/).
- **Tips**: `tips` (`never`, `occasionally`, `regularly`) controls how often the session start shows a tip. Your own reminders in `docs/ai/local/reminders.md` are not affected.
- **Roles**: per-role (and per-skill) overrides of tier and reasoning, see [Tiers and reasoning](/agentic-coding-template-docs/concepts/reasoning/).

## Checks: block, warn, off

Each row of the checks table names a guard that runs before the action it describes, for example a commit, a write under `.act/`, or a worker leaving its write scope.

| Value | Effect |
| :--- | :--- |
| `block` | the action is refused |
| `warn` | the action goes ahead with a note |
| `off` | the check is skipped entirely |

A check marked in the table as "never refuses" treats `block` as `warn`. One check is different: `security-check` takes `off`, `local`, `deps` or `full`, see [The security check](/agentic-coding-template-docs/guides/security-check/).

Turning a check down is your decision. Checks such as `secret-scan` or `git-reset-hard` protect against things that cannot be undone; lower them only with a reason.

## File and environment

`config.md` describes the **project** and is versioned. Secrets and per-machine or per-run deviations belong in the environment (for example `AGENTIC_FEEDBACK_URL` or `ACT_FORGE_API_URL`), which overrides the file for that run and never the other way round. The session start names every environment override that is active, names only, never values.

## Changing the file

Edit the values in the tables, not the key names or the marks (`<!-- act:... -->`): those are what the mechanism reads. An update keeps your values. If the project changes in a way `config.md` describes, the assistant updates it in the same step.
