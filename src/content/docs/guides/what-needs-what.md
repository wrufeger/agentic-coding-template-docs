---
title: "Concept, test, review: what needs what"
description: A decision table - does a change need a concept first, a test or other evidence, a review - with the rule behind each answer.
sidebar:
  order: 6
---

Not every change walks the whole [path of an idea](/agentic-coding-template-docs/start/walkthrough/). The template
asks for three things, and each has a rule behind it:

- **A concept first** - `R-work-idea-first`: an idea, feature or change request first gets a short concept with
  options (`act-idea`) and a decision, then it is built. Skipping this for something small is allowed, but the
  assistant says so out loud so you can object.
- **Evidence** - `R-work-evidence`: "done" holds only with a test run, a CI run, a log excerpt or screenshot, a
  commit hash or an outside call. Without it a result is "not verified". Before a commit, `R-code-commit` runs lint,
  typecheck and tests, but only where the project has them set up.
- **A review** - `R-code-commit`: the `reviewer` runs once per task before acceptance, not after every step, and ends
  with `ALLOW`, `CONDITIONAL` or `BLOCK`. For a trivial change (a typo, docs only) the assistant skips it and says so.

| The change | Concept first? | Test or evidence? | Review? |
| :--- | :--- | :--- | :--- |
| A new feature or a change request | **Yes**, with options and your decision (`R-work-idea-first`). | **Yes**: tests where the project has them, plus the proof the feature works (`R-work-evidence`, `R-code-commit`). | **Yes**, once per task (`R-code-commit`). |
| A small change you describe exactly, such as renaming a label | **May be skipped**; the assistant says so aloud (`R-work-idea-first`). | **Yes**, at least a run or a look at the result (`R-work-evidence`). | **Yes**, once per task, unless it is trivial (`R-code-commit`). |
| A bug fix | **No**: a bug is not an idea, `R-work-idea-first` covers ideas, features and change requests. | **Yes, first**: `act-bug` writes a test that fails before the fix and passes after (`R-work-evidence`). | **Yes**, once per task (`R-code-commit`). |
| A typo or a docs-only change | **May be skipped**, said aloud (`R-work-idea-first`). | **Yes**, still: the commit hash is evidence, a build or link check where there is one (`R-work-evidence`). | **Skipped** by the assistant, which says so (`R-code-commit`). |
| A result a worker hands back | Not applicable. | **Yes**: no evidence, no "done" (`R-work-evidence`). | Once per task, before acceptance (`R-code-commit`). |

How to read it:

- "Yes" is the default, "may be skipped" is a decision the assistant announces, never one it takes silently.
- A review verdict of `CONDITIONAL` does not stop the commit. The condition is filed in the same step as a todo
  or question in the inbox and named in the commit message. `BLOCK` stops it (`R-code-commit`). The `reviewer`
  blocks by severity: for an error on a path ordinary work reaches, a missing part of the assignment, a security
  hole a model can produce without intent or a weakened check whose reason the author does not name, not for a
  constructed edge case, which is filed as a backlog case.
  The full test suite runs once on the accepted state, before the commit.
- The table follows the template's defaults. Every rule can be switched off or replaced in the project
  (`R-work-override`, [Layers and overrides](/agentic-coding-template-docs/concepts/layers/)); the rule texts are
  in the [rules reference](/agentic-coding-template-docs/reference/rules/).
