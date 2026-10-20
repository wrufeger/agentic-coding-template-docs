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
python .act/scripts/update.py --plan      # show the diff and describe the later steps, write nothing
python .act/scripts/update.py             # the real run, asks for consent
```

## The ten steps

1. **Fetch** the template into a temporary checkout. Nothing from it is run.
2. **Local changes.** Checks whether you edited `.act/` since the last update. `--on-local-changes
   rescue|discard|abort` answers up front; `rescue` moves your edits to `docs/ai/local/` first.
3. **Diff** from old to new, with rule and coding-rule IDs individually.
4. **Consent.** Nothing is replaced before you agree. `--yes` skips the prompt once you already agreed.
5. **Replace `.act/`** as a whole.
6. **Refresh the copies** outside `.act/`: unchanged skill copies and role bridges are replaced, copies you edited
   are kept and reported. Own skills and roles under `docs/ai/local/` get their
   copies here too.
7. **Hooks and Git files.** Reconciles the hook entries in `.claude/settings.json` and the template blocks in
   `.gitattributes` and `.gitignore`, and sets `"enableArtifact": false` there unless `artifacts: on` is in
   `docs/ai/config.md`. An existing project therefore starts without the `Artifact` tool after the update.
8. **Migrations.** Runs any that are due. Each rewrites an affected file once and leaves it alone after.
9. **Bridges and doctor.** First unedited generated bridges (`CLAUDE.md`, `AGENTS.md`, `docs/ai/rules.md`) are
   refreshed; with `session-start-refresh` at `warn` or `off` in `docs/ai/config.md` § Checks they are only
   reported ("would refresh … not written"). Then `doctor.py` checks for
   drift; findings land in `docs/ai/inbox/`, never as a silent fix.
10. **Lock and commit.** `.act-lock.json` is rewritten and a commit is made, unless you pass `--no-commit`.

If the template has no newer state, `--plan` and the real run both say "nothing to update". A bridge file whose content
would not change is not rewritten. A large update no longer fails on Windows with `WinError 206`.

Then the assistant adds a journal line with the base-commit change and the number of findings.

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
