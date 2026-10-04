---
title: Existing project
description: Adopt a project that already has its own docs or AI tooling with act-adopt.
sidebar:
  order: 2
---

A project that already has docs, a `CLAUDE.md`, or an older AI setup goes through `act-adopt`, not through
`init.py --target <dir>` alone. What happens to each old file is a judgment per file, and that takes an assistant.

## Start it

`act-adopt` runs from a checkout of the template, against the project at `<dir>`. The checkout has no
`.claude/skills/`, so you cannot call the skill by name there. Open the checkout in your assistant and say:

```text
Take over my existing project in ~/dev/shop. It already has a CLAUDE.md and its own docs.
```

Nothing changes before you approve a table once, and no script commits anything.

## The steps

1. **Sight.** `adopt_scan.py --target <dir>` classifies every documentation and AI-tool source (`ai-config`,
   `ai-machinery`, `work`, `log`, `project-doc`, `predecessor`, `unknown`), writes a scan, and changes nothing.
2. **Propose the table.** One row per source with an action: `keep`, `adopt`, `legacy`, or `delete`.
3. **You approve once.** The whole table in one pass. You may change any row.
4. **Apply.** `adopt.py --apply` creates the branch `act-adopt`, moves `legacy` rows into the archive, and runs
   `init.py`. Set the docs language here with `--language-docs`.
5. **Settings.** `adopt_config.py` carries values from an old `AI-CONFIG.md` into `docs/ai/config.md`.
6. **Fill the content.** Open tasks, backlog items, and questions become entries; rule text becomes overrides,
   own rules, or proposals. Text is cut from the old files, never retyped.
7. **Finish.** `adopt.py --finish` bridges adopted files, removes what was meant to go, runs `doctor.py`, and writes
   an adoption report into the inbox.
8. **Commit.** By pathspec on the branch `act-adopt`, in groups. You review and merge the branch.

`adopt.py --abort` takes the adoption back, but only before `--finish` has run.

## What moves, what stays

| Action | Result |
| :--- | :--- |
| `legacy` | The file moves byte-identical to `docs/ai/work/archive/legacy/<old path>`. Its open items become entries. `legacy` is the proposal for journals and logs; `keep` is allowed too. |
| `adopt` | The content goes into a template place: an entry, a proposal, `docs/ai/config.md`, `docs/project/`, or `docs/ai/local/`. |
| `keep` | The file stays untouched. This is the default for project docs, a foreign root `README.md`, and local files such as `CLAUDE.local.md`, `.mcp.json`, and `.claude/settings.json`. |
| `delete` | Advised for a previous template's own tooling that holds nothing of yours; adopt also allows it for AI config, work files and confirmed project docs. It happens on the branch, so nothing is lost. |

Your wording stays as it is: titles and bodies are copied from the old text, never summarized or translated.
`init.py` merges its hook entries into `.claude/settings.json` and leaves your own entries in place.

## Without the full adoption

If you decline the rebuild, stop after the sight and run `python .act/scripts/init.py --target <dir>`. It never
overwrites a file, adds `.act/` and whatever is missing, and leaves an existing `CLAUDE.md` as it is, which
then still lacks the import of the rules.
