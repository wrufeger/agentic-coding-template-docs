---
title: Update
description: Pull a newer template state into a project with act-update.
sidebar:
  order: 3
---

`act-update` brings a newer template state into your project: you see the diff, you consent, and
`python .act/scripts/update.py` does the rest. There is no merge and nothing to resolve by hand. Say
`Check for a template update` or run the script yourself.

## Before you start

Commit or finish open work first (`git status` should be clean). Updating needs Git 2.25 or newer. The template's address lives in
`.act-lock.json` (`template.source`); `--source` and `--ref` pick another source or a tag. The source recorded there
comes first: a git remote named `template` is used only if the lock names no source, and the script says which one it
took. If the fetch fails, the message names the source, where it came from, and the way out (`--source`, `--ref`).

```bash
python .act/scripts/update.py --plan      # show the diff and describe the later steps, write nothing but the update note
python .act/scripts/update.py             # the real run, asks for consent
```

## Update channel

`update-channel` in `docs/ai/config.md` § Update decides what `act-update` offers. `init` asks for it and writes it.

- `release` (the default) is the newest stable tag `vX.Y.Z` of the source. A project already past it, for example
  one that followed `main`, hears "ahead of the newest release" and keeps its state.
- `latest` is the tip of the source's default branch.
- `--channel release|latest` overrides the key for one run; `--ref <tag-or-commit>` beats both.
- A source without release tags is followed at its tip, with a note, while `release` is the default or the value in
  `docs/ai/config.md`. `--channel release` and an invalid value stop with a hint to use `--ref` or `latest`.
- On `release` the session start reports "template release vX.Y.Z available", on `latest` "a template update is
  available". `.act-lock.json` records the installed tag as `template.ref` on `release` and the branch on `latest`.
- A pending update stays visible until it is installed: the session start names it in the line you see
  (`update 2.4.0 available`) and repeats it to the assistant at every start, the board lists it under Status, and
  Claude Code's status line shows `update: 2.4.0` on `release` or `update: <date>` on `latest` (the newer commit's
  date as `DD.MM.YYYY` when `language-docs` is `de`, else `YYYY-MM-DD`; its short hash where the date cannot be read
  without the network). If the lock has moved on since the check (an update pulled from another checkout), the old finding is dropped and
  the next check runs at once.
- Existing projects keep their `config.md`; without the key they get a one-time note from `act-update`.
  `act-doctor` reports a value other than `release` or `latest`.

To see where you stand, ask `/act-version` or run `python .act/scripts/update.py --versions`. It lists the installed
version and channel, the source's releases (`--all` for every one, not the five newest), the tip of the default branch,
and what `act-update` would take. It uses only `git ls-remote` and clones nothing. The only thing it writes is the
local update note under `.act-local/` (status line, board), judged for the project's own channel and source. `--plan`
and an update run refresh that note too (or clear it when the project is up to date); `--channel`, `--source` and
`--ref` aim a single run elsewhere and leave it alone. `act-update` answers a question about the installed or newest
version with `update.py --versions`.

## The ten steps

1. **Fetch** the template into a temporary checkout. Nothing from it is run.
2. **Local changes.** Checks whether you edited `.act/` since the last update. `--on-local-changes
   rescue|discard|abort` answers up front; `rescue` moves your edits to `docs/ai/local/` first.
3. **Diff** from old to new, with rule and coding-rule IDs individually.
4. **Consent.** Nothing is replaced before you agree. `--yes` skips the prompt once you already agreed.
5. **Replace `.act/`** as a whole.
6. **Refresh the copies** outside `.act/`: unchanged skill copies and role bridges are replaced, copies you edited
   are kept and reported. Own skills and roles under `docs/ai/local/` get their
   copies here too. New coding sets and groups are entered in `docs/project/coding_rules.md` (a new set unchecked, a new
   group of a checked set checked; see [Own skills, roles and rules](/agentic-coding-template-docs/guides/own-skills-and-rules/)).
   If you edited `docs/ai/rules.md`, a rule that moved to another rule file takes its checkbox line along (mark and
   reason unchanged, so a rule switched off stays off); if you do not import the new file, it is only reported. An
   unedited `docs/ai/rules.md` is re-derived as before. Only `builder` and `reviewer` keep a `-high` variant: generated
   variants of the other template roles are removed, each named in the preview and summary.
   The template's roles (and their `-high` variants) get `omitClaudeMd: true`, so workers no longer load `CLAUDE.md`;
   your own roles and an explicit `omitClaudeMd: false` stay as they are, and an own role without the field keeps
   loading `CLAUDE.md`. Claude Code before 2.1.271 ignores the field, so workers there get the rules twice (costs
   tokens only).
7. **Hooks and Git files.** Reconciles the hook entries in `.claude/settings.json` and the template blocks in
   `.gitattributes` and `.gitignore`, and sets `"enableArtifact": false` there unless `artifacts: on` is in
   `docs/ai/config.md`. An existing project therefore starts without the `Artifact` tool after the update. It also adds the 12 `SubagentStart` entries that give workers their rules without the orchestrator rules (see step 6); an older set of six is replaced, your own hooks stay. `python .act/scripts/rules.py --worker` shows what a worker gets. It also keeps `.act-local/` out of IDE indexes: an `excludeFolder` in every JetBrains `.idea/*.iml`, and `files.watcherExclude` in `.vscode/settings.json` where `.vscode/` exists.
8. **Migrations.** Runs any that are due. Each rewrites an affected file once and leaves it alone after.
9. **Bridges and doctor.** First unedited generated bridges (`CLAUDE.md`, `AGENTS.md`, `docs/ai/rules.md`) are
   refreshed; with `session-start-refresh` at `warn` or `off` in `docs/ai/config.md` § Checks they are only
   reported ("would refresh … not written"). Then `doctor.py` checks for
   drift; findings land in `docs/ai/inbox/`, never as a silent fix. A new tier proposal is filed there as a question of its own; the commit takes the report and the questions, and the summary names both.
10. **Lock and commit.** `.act-lock.json` is rewritten and a commit is made, unless you pass `--no-commit`.

The summary also names what the next session start will remove from `.act-local/` (the check `act-local-tidy`, see
below).

If the template has no newer state, `--plan` and the real run both say "nothing to update". A bridge file whose content
would not change is not rewritten. A large update no longer fails on Windows with `WinError 206`.

## Tidying `.act-local/`

The session-start check `act-local-tidy` runs once a day in the background. It removes `tmp/` entries and unknown
entries directly under `.act-local/` older than 7 days (unless the name starts with an open task's id or
`act-local-keep` in `docs/ai/config.md` § Checks lists it), and all but the newest 5 backups of `update`. The first run
only reports what it would remove; removal starts the day after a session start has shown that report. `act-local-tidy:
warn` only reports, `off` skips it. `python .act/scripts/act_local_tidy.py` lists what would go.

Then the assistant adds a journal line with the base-commit change and the number of findings.

## Upgrading to 2.3.0

From v2.2.0, run `act-update` as usual, then start a new session so the new hooks and role fields take effect. There
is no new migration.

- **The update channel** decides what the next `act-update` brings (see [Update channel](#update-channel)). A project
  without `update-channel` in `docs/ai/config.md` follows `release` and gets a one-time note; set
  `update-channel: latest` to keep following the default branch.
- **The check `outside-root`** runs as `warn` in a project without its row in `docs/ai/config.md` § Checks. A one-time
  note at session start says how to switch it to `block`; further allowed places go into `outside-root-allow`.
- **Workers no longer load the orchestrator rules**: the template's roles get `omitClaudeMd: true` and
  `.claude/settings.json` the `SubagentStart` entries (step 7). Claude Code before 2.1.271 ignores the field, so
  workers there get the rules twice until Claude Code is updated.

## Upgrading to 2.2.0

From v2.1.0, run `act-update` as usual; nothing else is needed. `--plan` first lists what will happen.

- **Migrations `003` and `004`** move the header of every inbox entry (`003`) and of every task, backlog item,
  journal entry and archived entry under `docs/ai/work/` (`004`) into YAML frontmatter between two `---` lines.
  `docs/ai/work/archive/legacy/` and every `README.md` stay as they are. Hand-written entries in the old form keep
  working.
- **Git 2.25 or newer** is required for the update.
- **The `Artifact` tool is off** after the update. `artifacts: on` in `docs/ai/config.md` keeps it.
- **Quick capture** is on: a chat message that begins with `todo:`, `note:` or `idea:` is filed by a hook without a
  model turn. `quick-capture: off` in `docs/ai/config.md` switches it off.

## Downgrade guard

If the fetched state is older than the installed one, or the installed commit is unknown to the source (for example a
local checkout with unpushed commits), `--plan` warns and a real run refuses unless you pass `--allow-downgrade`. The
usual fix is `--source <local template checkout>`.

## Your own changes

`.act/` is replaced, so never edit it. Put a project version of a rule, skill, or role into
`docs/ai/local/<same path>`; an update never overwrites that folder or your own content in `docs/ai/` and `docs/project/`. It refreshes only unedited generated files (such as an unedited `docs/ai/rules.md`), files findings in the inbox and runs migrations. See
[Layers and overrides](/agentic-coding-template-docs/concepts/layers/).

## If `.act/` was replaced another way

After a plain `git pull` of the template or a manual copy, a normal run notices it and resumes instead of
reporting "nothing to update". `--catch-up` finishes the later steps from the `.act/` on disk without a fetch;
it refuses if `.act/` no longer matches its own `MANIFEST.json`.
