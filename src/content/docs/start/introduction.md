---
title: Introduction
description: What the template is, who it is for, and how it works in one picture.
sidebar:
  order: 1
---

The agentic coding template, short *act*, is a set of files you put into a project so that your AI coding
assistant works to a fixed, inspectable method. It contains rules, skills, sub-agent roles, hooks, and
scripts. It works in a new project and in one that already exists.

## What it gives you

- **A division of labor.** You set goals and decide. The main assistant, the orchestrator, plans, reviews, and
  commits. It hands bounded assignments to specialized workers. See [Roles](/agentic-coding-template-docs/concepts/roles/).
- **A process with evidence.** An idea gets a concept with options before it is built. A result counts as done
  only with a test run, a commit, or an outside call as proof.
- **State in the repository.** Tasks, backlog, questions, inbox, and journal sit in `docs/ai/`, so every
  session can continue from the board.
- **Recurring work as skills.** A skill is a plain `SKILL.md` that any assistant can follow, for example
  `act-bug`, `act-commit`, `act-release`. See the [skills reference](/agentic-coding-template-docs/reference/skills/).

## Who it is for

Teams and solo developers whose project lives longer than one session: work is handed over between sessions or
people, existing code gets changed, or a mistake such as a leaked secret would be expensive.

## What it is not

- **Not a framework or a library.** Nothing from it ends up in your build or at runtime.
- **Not free of cost.** The rules load at the start of every session, roughly 8,000 to 9,000 tokens with one
  coding rule set, and about as much again for each sub-agent. The assistant also does more per task: tests as
  evidence, a review, a journal entry. For a one-off script or a throwaway prototype that costs more than it saves.
- **Not a guarantee in every tool.** Mechanical enforcement through hooks exists only in Claude Code (see below).

## How it works in one picture

A project has two layers that never mix.

| Layer | Where | Who owns it |
| :--- | :--- | :--- |
| Template | `.act/` | The template. Replaced as a whole by an update, never edited in the project. |
| Project | `docs/ai/` (working state), `docs/project/` (your documentation) | You. An update never overwrites your content. |

Around them sit the small files each tool reads (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/skills/`) and
`.act-local/`, which stays on your machine. A project version of a template file goes to
`docs/ai/local/<same path>` and wins. Details: [Layers and overrides](/agentic-coding-template-docs/concepts/layers/).

## Supported AI tools

| Tool | Reads | What it gets |
| :--- | :--- | :--- |
| Claude Code | `CLAUDE.md`, `.claude/` | Everything: rules by import, skills by name, sub-agent roles with a model and effort tier, hooks, a status line, the board at session start. |
| Codex, GitHub Copilot, Cursor | `AGENTS.md`, `.agents/skills/` | Rules and skills as instructions. No hooks, so nothing is enforced mechanically, and no sub-agent roles. |
| Gemini CLI | `GEMINI.md`, `.agents/skills/` | The skills. A project has no `GEMINI.md` yet, so point Gemini CLI at `AGENTS.md` in its settings. |
| Any other assistant | none | Tell it to read `docs/ai/rules.md`. Every skill is a plain `SKILL.md`. |

The tools in use are the `tools` key in `docs/ai/config.md`, default `claude-code`. Every project gets
`AGENTS.md` and the skill copies under `.agents/skills/`.

## Requirements

Python 3.9 or newer, standard library only, for the setup, the scripts, and the hooks. Next:
[start a new project](/agentic-coding-template-docs/getting-started/new-project/) or
[adopt an existing one](/agentic-coding-template-docs/getting-started/existing-project/).
