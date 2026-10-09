---
title: Sending feedback
description: Voluntary feedback to the template author - the modes, cadence and scope, what is never sent, and where the local copy stays.
sidebar:
  order: 1
---

You can report back to the template author what served the working method well or was missing. Feedback is voluntary, covers the **working method only, never your project**, and everything that leaves the machine is also kept locally.

The test for every entry: would this help someone who will never see your project? A rule you had to add because the template lacked it, a workflow that kept failing, a script that generalizes: that is feedback. A fact about your project (its name, its stack, a number, a quote from its docs) is not.

## Modes

Three keys in the Feedback section of `docs/ai/config.md` control it:

| `feedback` | Behavior |
| :--- | :--- |
| `off` | nothing is sent on its own |
| `confirm` | the assistant shows you the payload and asks |
| `automatic` | the payload is sent without asking |
| `manual` | entries are collected but never sent on their own; only the `act-feedback` skill sends |

`python .act/scripts/feedback.py --enable [--mode off|confirm|automatic|manual]` sets the mode; `--enable` without `--mode` means `automatic`, which sends without asking; `--disable` turns it off.

## Cadence and scope

`feedback-cadence` is an upper limit, never an obligation: `manual`, `immediate`, `hourly`, `daily`, `weekly` (the usual value) or `adaptive`, which learns from how often reminders are acted on or postponed. With nothing to report, nothing is sent, however short the cadence.

`feedback-scope` says what the assistant may collect **on its own**:

| Scope | Collects |
| :--- | :--- |
| `a` | metrics |
| `b` | rule and structure changes |
| `c` | tool usage: how many agents, skills and scripts exist, and how often each of the template's own skills and scripts was used since the last sending. Your own skills and scripts appear only as one `own` count per kind, never by name. No MCP server names are sent. |

A finding written by hand always goes into the outbox, whatever the scope.

## Two ways to send

1. **A sentence after the trigger**, for example `feedback: the update left a file behind`. That sentence is the message itself, sent unchanged, even with `feedback: off`. Only the text, the template's own commit hash and a random project id leave the project, whatever the mode, never the repository URL or anything else. The project id lets several messages from one project be told apart. If you want an answer, name a reply address in the same request: the assistant adds it with `feedback.py --direct "<text>" --contact <address>`. It goes with this one message only and stays in its local copy, is never reused for a later message and never taken from anywhere else, such as your Git settings.
2. **The trigger alone** (the skill `act-feedback`). The assistant goes through `.act/`, the generated files and `docs/ai/`, writes one entry per finding (two to six sentences), previews the batch with `feedback.py --plan` and sends it under your mode and cadence.

A bug in the template itself (a script or skill that fails, two rules that contradict each other, a rule that never fires) is stored and, where consent allows, sent at once, bypassing the cadence. It still never bypasses consent: with `feedback: off` it stays in the outbox.

## What is never sent

Every string that could leave the project runs through a privacy check first: credential-like words, mail addresses (the one exception is a reply address you named yourself, which must be a plain `name@host.tld`), IP addresses, absolute paths, long hex values and any URL other than the feedback endpoint or github.com. A match is **not silently stripped**. Nothing is sent, and the reason is reported so the entry can be rewritten without that part. Nothing about your project belongs in an entry anyway: no names, paths, numbers, code or people, and no praise, only what concretely helped or was missing.

## The local copy

- Every send writes a full copy of its payload to `.act-local/feedback/sent/` (gitignored, never leaves your checkout). Pending entries and bookkeeping live next to it in `.act-local/feedback/`.
- The project's journal gets one line per send: date, kind, number of entries and schema version, never content or titles.

See also the [configuration reference](/agentic-coding-template-docs/reference/configuration/) for the three keys, and [Configuration](/agentic-coding-template-docs/concepts/configuration/) for how the file works.
