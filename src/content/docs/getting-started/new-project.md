---
title: New project
description: Set up a new project from the template, with the assistant or by hand.
sidebar:
  order: 1
---

## Get the template

Clone [the template repository](https://github.com/wrufeger/agentic-coding-template), or use **Use this template**
on GitHub, then open the folder in your assistant: Claude Code, Codex, GitHub Copilot, Cursor, or Gemini CLI. You
need Python 3.9 or newer; the assistant checks for it and explains the installation if it is missing.

## With the assistant: `act-setup`

Whatever your first message is, the assistant starts the `act-setup` skill. It checks for Python, asks where
the project goes, shows the plan, and runs it. For example:

```text
Set up a new project right here.
Set up a new project in ../shop-api.
```

Any language works. There are two ways:

1. **Right here.** The clone becomes the project. The `origin` remote is removed if it points at the template repository, and the project starts on a
   fresh `main` with no history of the template. Later template updates come only through
   [`act-update`](/agentic-coding-template-docs/getting-started/update/).
2. **Somewhere else.** An empty or missing folder is set up directly with `--target`. A folder that already
   holds a project goes to [`act-adopt`](/agentic-coding-template-docs/getting-started/existing-project/).

The assistant runs the commands itself. It has no terminal to ask you questions in, so `init.py` takes its
defaults and writes every open point (name, owner, stack, tools) to the inbox. You go through that note with
the assistant and the answers go into `docs/ai/config.md`.

## By hand: `init.py`

The setup needs no AI. In a terminal, `init.py` asks for name, owner, stack, lint and test commands, tools, and
languages:

```bash
python .act/scripts/init.py --plan                    # show what would happen, change nothing
python .act/scripts/init.py                           # turn this clone into the project
python .act/scripts/init.py --target ../my-project    # set up a new, empty folder instead
python .act/scripts/init.py --non-interactive         # no questions: defaults, open points to the inbox
```

Useful options: `--language-docs <code>` (language of `docs/`, default `en`), `--language-chat <code|auto>`,
`--no-commit`. All options are in the [scripts reference](/agentic-coding-template-docs/reference/scripts/).

## What init does

Ten fixed steps, each printed as `[n/10]`:

1. Collects the settings: name, owner, languages, stack, commands, tools, mode, feedback.
2. Resolves Git: in place it removes `origin` and rebuilds `main`; with `--target` it runs `git init` if needed.
3. Checks your Git identity.
4. Writes your workspace identity and the local import folder `.act-local/import/`.
5. Thins the bridges down to the tools you chose.
6. Writes the skeleton: `docs/ai/` (`config.md`, `rules.md`, `concept/`, inbox, work folders), `docs/project/coding_rules.md`,
   `docs/README.md`, the bridge files, skill copies, and the hook entries in `.claude/settings.json`.
7. Appends template blocks to `.gitattributes` and `.gitignore`.
8. In place only: retires the template's own README and LICENSE.
9. Writes `.act-lock.json` (the recorded template source and version) and `.act/MANIFEST.json`.
10. Makes the first commit.

`init.py` never overwrites a file the project already has. A `language-docs` other than English leaves the
scaffold in English plus an inbox note asking the assistant to translate it once.

## Your first session

Open the project in your assistant and say `continue`. The assistant reads the board and the inbox. Start with
the init notes in `docs/ai/inbox/`, then try an idea (`Idea: export the orders as CSV`), a bug (`Bug: login fails
with an umlaut`), or `Which skills are there?`. Settings live in `docs/ai/config.md`.
