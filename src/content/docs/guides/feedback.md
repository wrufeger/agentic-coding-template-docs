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
| `local` | nothing is ever sent to the template author; findings become backlog entries in your project |

New projects start with `confirm` whenever nobody chooses: a run without a terminal (as `act-setup` and `act-adopt` run it), an empty answer or three invalid ones; `off` stays one edit away. A `config.md` without the key still counts as `off`. `python .act/scripts/feedback.py --enable [--mode off|confirm|automatic|manual|local]` sets the mode; `--enable` without `--mode` means `automatic`, which sends without asking; `--disable` turns it off.

## Mode `local`

With `feedback: local` the project never sends anything: `feedback.py --send` (also with `--force`), `--direct` and `--add` refuse and point to the backlog, `--plan` shows nothing, and reminders never fall due. What would otherwise go out becomes a backlog entry in your project (`entries.py new backlog`): a bug in the template itself, a sentence you write after `feedback:` (in your words, unchanged) and the recurring findings the feedback rule names (an impractical rule or format, a missing workflow, a needed workaround), which the assistant files without asking. `/act-config feedback local` sets it too. The sections below apply to the other modes.

## Cadence and scope

`feedback-cadence` is an upper limit, never an obligation: `manual`, `immediate`, `hourly`, `daily`, `weekly` (the usual value) or `adaptive`, which learns from how often reminders are acted on or postponed. With nothing to report, nothing is sent, however short the cadence. With `immediate`, `feedback.py --add` sends each entry when it is added (consent and mode still apply; `--help` says so), so `--send` with an empty outbox sends nothing and says so; `--send --force` sends anyway.

`feedback-scope` says what the assistant may collect **on its own**:

| Scope | Collects |
| :--- | :--- |
| `a` | metrics |
| `b` | rule and structure changes |
| `c` | tool usage: how many agents, skills and scripts exist, and how often each of the template's own skills and scripts was used since the last sending (a skill started by typing its slash command counts too). Your own skills and scripts appear only as one `own` count per kind, never by name. A send also counts the recorded reasons for reworked or escalated worker results per template role and tier since the last send; a role or tier of your own goes only as `own` / `other`, never by name. No MCP server names are sent. |

The metrics of scope `a` count only the project's files (`git ls-files`), so a vendor, IDE or media folder that git ignores adds nothing; outside a git checkout, a directory or link that cannot be read is skipped. A finding written by hand always goes into the outbox, whatever the scope.

## Two ways to send

1. **A sentence after the trigger**, for example `feedback: the update left a file behind`. That sentence is the message itself, sent unchanged, even with `feedback: off`. Only the text, the template's own commit hash and a random project id leave the project, whatever the mode, never the repository URL or anything else. The project id lets several messages from one project be told apart. If you want an answer, name a reply address in the same request: the assistant adds it with `feedback.py --direct "<text>" --contact <address>`. It goes with this one message only and stays in its local copy, is never reused for a later message and never taken from anywhere else, such as your Git settings.
2. **The trigger alone** (the skill `act-feedback`). The assistant goes through `.act/`, the generated files and `docs/ai/`, writes one entry per finding (two to six sentences), previews the batch with `feedback.py --plan` and sends it under your mode and cadence. A rule that keeps being violated is worth an entry too: report it as a candidate for a mechanical check.

A bug in the template itself (a script or skill that fails, two rules that contradict each other, a rule that never fires) is stored and, where consent allows, sent at once, bypassing the cadence. It still never bypasses consent: with `feedback: off` it stays in the outbox.

## What is never sent

Every string that could leave the project runs through a privacy check first: credential-like words, mail addresses (the one exception is a reply address you named yourself, which must be a plain `name@host.tld`), IP addresses, absolute paths, long hex values and any URL other than the feedback endpoint or github.com. A match is **not silently stripped**. Nothing is sent, and the reason is reported so the entry can be rewritten without that part. Nothing about your project belongs in an entry anyway: no names, paths, numbers, code or people, and no praise, only what concretely helped or was missing.

## The local copy

- Every send writes a full copy of its payload to `.act-local/feedback/sent/` (gitignored, never leaves your checkout). Pending entries and bookkeeping live next to it in `.act-local/feedback/`.
- Worker measurements (`usage.py --estimates`) stay in `.act-local/usage.json` and are never part of a payload; only the reason counts of scope `c` go along, as counts without names of your own.
- The project's journal gets one entry per day, `<date>-feedback-sent.md`, with one line per send: the time, the kind of send (batch or direct message) and, for a batch, the number of entries and each entry's kind and title. The text of an entry and of a direct message is never recorded.

## The local incident log

Separate from feedback, and never sent: real faults (a protected file that was put back, a check that crashed, a model switch, a `warn` hit that let a write, a delete or a secret-file read through) are logged on your machine in `.act-local/incidents.jsonl` and arrive as one inbox report per day at session start. Only identifiers are logged, never a command or a path. `ACT_INCIDENT_LOG=off` in the environment pauses it for one run.

Refusals of the safety checks are only counted, per check and role (in `.act-local/usage.json`). When one check refused workers at least 3 times within 7 days, `doctor.py --inbox` files one question proposing a sentence for the role file or the assignment header that tells workers beforehand what that check does not allow.

See also the [configuration reference](/agentic-coding-template-docs/reference/configuration/) for the three keys, and [Configuration](/agentic-coding-template-docs/concepts/configuration/) for how the file works.
