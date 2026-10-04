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

Commit or finish open work first (`git status` should be clean). The template's address lives in
`.act-lock.json` (`template.source`); `--source` and `--ref` pick another source or a tag.

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
   are kept and reported.
7. **Hooks and Git files.** Reconciles the hook entries in `.claude/settings.json` and the template blocks in
   `.gitattributes` and `.gitignore`.
8. **Migrations.** Runs any that are due.
9. **Doctor.** `doctor.py` checks for drift; findings land in `docs/ai/inbox/`, never as a silent fix.
10. **Lock and commit.** `.act-lock.json` is rewritten and a commit is made, unless you pass `--no-commit`.

Then the assistant adds a journal line with the base-commit change and the number of findings.

## Your own changes

`.act/` is replaced, so never edit it. Put a project version of a rule, skill, or role into
`docs/ai/local/<same path>`; an update never overwrites that folder or your own content in `docs/ai/` and `docs/project/`. It refreshes only unedited generated files (such as an unedited `docs/ai/rules.md`), files findings in the inbox and runs migrations. See
[Layers and overrides](/agentic-coding-template-docs/concepts/layers/).

## If `.act/` was replaced another way

After a plain `git pull` of the template or a manual copy, a normal run notices it and resumes instead of
reporting "nothing to update". `--catch-up` finishes the later steps from the `.act/` on disk without a fetch;
it refuses if `.act/` no longer matches its own `MANIFEST.json`.
