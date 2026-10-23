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
- **Inbox**: `inbox-decisions` decides where an open decision waits. With `immediate` it goes into the inbox as soon as it is booked; with `at-start` a backlog entry may keep it until work on it starts. `quick-capture` (`on` or `off`, default `on`) lets the `UserPromptSubmit` hook file a chat message that begins with `todo:`, `note:` or `idea:` without a model turn, see [Work entries](/agentic-coding-template-docs/concepts/work-entries/).
- **Output depth**: `output-depth` (`verbose`, `normal`, `sparse`) controls how much the assistant writes in chat, not what your tool displays.
- **Session length**: `context-hint` (a token count, default 180000, or `off`) is the context size at which the assistant suggests `/clear` or a new session at the next task boundary; `task-wait-hours` (default 12) is how long a started task may stay quiet before it counts as waiting. `board-at-start` (`on` or `off`, default `on`) adds an excerpt of the board to the session start. `artifacts` (`on` or `off`, default `off`) set to `off` keeps Claude Code from loading the `Artifact` tool, about 13,700 tokens saved per session start.
- **Teaching**: `teach-lessons` (`local`, `docs`) sets where `act-teach` keeps its lessons: `local` under `.act-local/learn/` for you alone, `docs` versioned under `docs/learn/` for the team. The learning record stays local either way.
- **Dependencies** and **Docs audit**: `dependency-check` and `docs-audit-due` control the reminders to run `act-deps` and `act-audit-docs`. New projects get `dependency-check: regularly`: the session start notes once that no `act-deps` run is on record yet, then again whenever the last one is older than 30 days. `once` instead files a single inbox entry after `init`; values already set stay.
- **Update**: `update-channel` (`release` or `latest`, default `release`) chooses what `act-update` brings: `release` only the newest stable release tag of the template source, `latest` the tip of its default branch. The session start announces a new release (on `latest`: a newer tip), and `/act-version` lists the installed version, the releases and what an update would take. `init` asks for the value; `act-doctor` reports an invalid one. A source without release tags is followed at its tip, with a note. See [Update channel](/agentic-coding-template-docs/getting-started/update/#update-channel).
- **Archive**: `archive-compact` (`<n>d <n>` or `off`, default `30d 300`) says when the session start notes that `act-compact` is due: the oldest entry in the archive or journal folder is older than that many days, or the folder holds more than that many files. `archive-shorten` (`on` or `off`, default `on`) lets workers shorten the merged sections; `off` merges only. See [Work entries](/agentic-coding-template-docs/concepts/work-entries/).
- **Git hosting**: `target-branch`, `forge` and `forge-host` tell the pull-request skill where to go. github.com and gitlab.com receive the token without being named; a self-hosted host only after you have named it.
- **Checks**: mechanical guards that run before an action (below).
- **Logging**: `logging` and `log-level` write every agent action to `ai.log` at the project root, not versioned, handy to follow along in a second terminal.
- **Feedback**: voluntary feedback to the template author; new projects start with `feedback: confirm`, so nothing is sent without your yes. See [Sending feedback](/agentic-coding-template-docs/guides/feedback/).
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

`outside-root` keeps reads and writes inside the project root and its allowed places, for the assistant and its workers alike. It starts at `block` in new projects; a project without the row runs it as `warn`. Exceptions go into `outside-root-allow`; both rows are described in the [configuration reference](/agentic-coding-template-docs/reference/configuration/), the rule in [`R-safe-outside-root`](/agentic-coding-template-docs/reference/rules/#r-safe-outside-root).

## File and environment

`config.md` describes the **project** and is versioned. Secrets and per-machine or per-run deviations belong in the environment (for example `AGENTIC_FEEDBACK_URL` or `ACT_FORGE_API_URL`), which overrides the file for that run and never the other way round. The session start names every environment override that is active, names only, never values.

## Changing the file

Edit the values in the tables, not the key names or the marks (`<!-- act:... -->`): those are what the mechanism reads. An update keeps your values. If the project changes in a way `config.md` describes, the assistant updates it in the same step.
