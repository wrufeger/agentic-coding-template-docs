---
title: Existing project
description: Adopt a project that already has its own docs or AI tooling with act-adopt.
sidebar:
  order: 2
---

A project that already has docs, a `CLAUDE.md`, or an older AI setup goes through `act-adopt`, not through
`init.py --target <dir>` alone. What happens to each old file is a judgment per file, and that takes an assistant.
A project on a template version older than v2.2.0 is adopted the same way: `act-update` no longer updates it, it stops
and names `act-adopt`.

Every writing script of the flow has `--plan` (checks and shows, changes nothing) and `--help` (the actions per class,
what each mode does, what it refuses); the assistant follows that output rather than a fixed list.

## Start it

`act-adopt` runs against the project at `<dir>` from one of two places:

- **A checkout of the template.** The checkout has no `.claude/skills/`, so you cannot call the skill by name there.
  Open the checkout in your assistant and say:

  ```text
  Take over my existing project in ~/dev/shop. It already has a CLAUDE.md and its own docs.
  ```

- **Another project that already runs the template.** The skill ships in every project, so `/act-adopt` works there
  too. `<dir>` must lie outside the project you run it from (not the project itself, not a folder inside it, also not
  through a symlink or junction); `init.py` and `adopt.py` refuse that and create nothing. The new project gets the
  `.act/` of the project you run it from, so its first `act-update` brings the current template.

Which case it is follows `<dir>`: a folder that does not exist or holds nothing but `.git` starts a **new project**
(`init.py --target <dir>`), a folder with other content is an **adoption** (the steps below). The assistant says which
before it runs anything. Nothing changes before you approve a table once, and no script commits anything.

### Carrying over from the project you run it from

From a project, the assistant lists what could come along and asks once per category, default yes. The answers become
`--carry` of `init.py --target` (new project) or `adopt.py --apply` (adoption):

| Category | Carries |
| :--- | :--- |
| `skills` | Your own skills (`docs/ai/local/skills/`). |
| `rules` | Your `## Own rules`. |
| `exceptions` | Rule groups and rule sets you switched off, with their reason. |
| `overrides` | `replaces` lines and the other files under `docs/ai/local/`. |
| `topics` | Own topic rules and overrides of template topics (`docs/ai/local/rules/topics/`). |

All yes leaves `--carry` out, all no is `--carry none` (`--no-local` does the same); `--carry` without `--target` is
refused. Only committed content travels, never `.env*`, symlinks or untracked files. What the new project cannot take
(a rule group or set it does not list) goes to its inbox. From the template checkout there is nothing to carry.

## The steps

1. **Sight.** `adopt_scan.py --target <dir>` classifies every documentation and AI-tool source (`ai-config`,
   `ai-machinery`, `work`, `log`, `project-doc`, `predecessor`, `unknown`), writes a scan, and changes nothing.
   The scan also names a leftover git remote that points at the template repository (a previous template's update script
   added it). The assistant proposes removing it and does so only with your yes.
   If the project you work in already has the template's hooks, the `outside-root` check refuses access to a target
   folder outside it. Then you start the first scan yourself with the `!` prefix
   (`! python .act/scripts/adopt_scan.py --target <dir>`). The scan leaves a marker that opens the target for 24 hours
   or until `--abort`, also past `--finish`, so the later steps still reach it. See [`R-safe-outside-root`](/agentic-coding-template-docs/reference/rules/#r-safe-outside-root).
2. **Propose the table.** One row per source with an action: `keep`, `adopt`, `legacy`, or `delete`.
3. **You approve once.** The whole table in one pass. You may change any row. An `adopt` row of class `project-doc`,
   `ai-machinery`, `predecessor` or `unknown` needs a target (the file its content goes to); name the rows that
   have none here, since `--apply` refuses them without your yes.
4. **Apply.** `adopt.py --apply` creates the branch `act-adopt`, moves `legacy` rows into the archive, and runs
   `init.py`. Set the docs language here with `--language-docs`, and the
   [update channel](/agentic-coding-template-docs/getting-started/update/#update-channel) with `--update-channel release|latest` (default `release`; it is passed on to `init.py`). Rows without a target need
   `--confirm-no-targets`, only with your yes.
5. **Settings.** `adopt_config.py` carries values from an old `AI-CONFIG.md` into `docs/ai/config.md`.
6. **Fill the content.** Open tasks, backlog items, and questions become entries; rule text becomes overrides,
   own rules, or proposals. An existing guideline file is sorted by where each part belongs and proposed part by part, never taken whole into "Own rules"; own rules stay one-liners. Text is cut from the old files, never retyped. A proposal in `docs/ai/proposals/` gets a frontmatter header (`author`, `date`, `target`); older proposals in the plain form are still read.
7. **Finish.** `adopt.py --finish` bridges adopted files, removes what was meant to go, runs `doctor.py`, and writes
   an adoption report into the inbox.
8. **Commit.** By pathspec on the branch `act-adopt`, in six groups: the legacy moves, the template layer, one commit
   per adopted target, what `--finish` did, the references and docs index, and the baseline findings. Before the first
   commit every changed path falls under exactly one group. You review and merge the branch.

`adopt.py --abort` takes the adoption back, but only before `--finish` has run; `--abort --plan` shows what it would do or
why it refuses, and `--abort --force` first saves changed files to `.act-local/adopt/aborted/`. A commit on `act-adopt`
other than `init.py`'s makes it refuse even then: take those commits off first.

### Baseline check before the first commit

Between steps 7 and 8 the assistant runs `adopt_baseline.py --target <dir>` once. The existing code has never been
through the template's commit checks, so without it the first commit would be held for patterns that were there long
before, and a secret in the code would only show up then. The run is read-only and prints three things: the
secret-file patterns missing from `.gitignore` (`.env` variants, private keys, keystores), the findings of the secret
scan and of the dangerous-pattern scan over the existing tree (file, line and rule, never a value), and the backlog
entries it would create. On your yes it runs again with `--write-gitignore --book`: that appends the patterns to
`.gitignore` and books one backlog entry per file for a secret and one per rule for a dangerous pattern, nothing twice.
The `.gitignore` goes into the template-layer commit, the entries into a commit of their own.

A booked dangerous-pattern finding then passes the first commit without a hold (the key `file|rule` stays in force with
no expiry, until removed from `.act-local/danger-scan-hints/baseline.json`). A secret keeps holding every attempt
until the value is removed and rotated, the line carries `act:allow-secret`, or it is listed in
`docs/ai/local/secret-accepted.md`. Booking does not silence it. See
[`adopt_baseline.py`](/agentic-coding-template-docs/reference/scripts/#adopt_baselinepy).

## What moves, what stays

| Action | Result |
| :--- | :--- |
| `legacy` | The file moves byte-identical to `docs/ai/work/archive/legacy/<old path>`. Its open items become entries. `legacy` is the proposal for journals and logs; `keep` is allowed too. |
| `adopt` | The content goes into a template place: an entry, a proposal, `docs/ai/config.md`, `docs/project/`, or `docs/ai/local/`. |
| `keep` | The file stays untouched. This is the default for project docs, a foreign root `README.md`, and local files such as `CLAUDE.local.md`, `.mcp.json`, `.claude/settings.json`, `.claude/rules/*.md` and a `.junie/guidelines.md` that only points at AGENTS.md or CLAUDE.md. |
| `delete` | Advised for a previous template's own tooling that holds nothing of yours; adopt also allows it for AI config, work files and confirmed project docs. It happens on the branch, so nothing is lost. |

Old entries' ids are not reused: the reserved ids are kept in the versioned `docs/ai/work/reserved-ids.json`. In solo
mode the workspace identity follows the adopted owner; in team mode you only get a note.

Your wording stays as it is: titles and bodies are copied from the old text, never summarized or translated. The one exception is a title longer than 80 characters: `adopt_entries.py` shortens it to its first sentence, else to a cut at a word boundary with "…", and the full old text opens the entry's body.
`init.py` merges its hook entries into `.claude/settings.json` and leaves your own entries in place. Unless `artifacts: on` is set, it also adds `"enableArtifact": false`. It also sets `PYTHON_BASIC_REPL=1` under `env` (a value you set yourself is kept).
With a `language-docs` other than English, `act-adopt` translates the scaffold in the same run. `feedback` defaults to
`confirm` (every message is shown and sent only after your yes); `local` (nothing is ever sent) is set with `/act-config feedback local`.

## Without the full adoption

If you decline the rebuild, stop after the sight and run `python .act/scripts/init.py --target <dir>`. It never
overwrites a file, adds `.act/` and whatever is missing, and leaves an existing `CLAUDE.md` as it is, which
then still lacks the import of the rules. Run from a project, it takes over that project's own skills, rules,
exceptions, overrides and topics unless `--carry` names fewer.
