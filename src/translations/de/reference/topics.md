<!-- German catalog for the reference page "topics". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## feedback
<!-- source: 8e66813319a3b7e4 -->
<!-- todo: translate -->
Feedback to the template author

Detail page for a rule that references it as `topics/feedback.md`. Read this when
`docs/ai/config.md` § Feedback has `feedback` set to anything other than `off`, or when a
template bug needs reporting regardless of that switch (see "Immediate trigger" below).
Mechanism: `.act/scripts/feedback.py` (privacy checks in `feedback_privacy.py`), skill
`act-feedback`.

## ide
<!-- source: ab54a19c2036e1f1 -->
<!-- todo: translate -->
IDE MCP server

Detail page for a rule that references it as `topics/ide.md`. Loaded only when a session start
detects a connected IDE MCP server (JetBrains `idea` and similar names in `.mcp.json`, the Claude
settings or `~/.claude.json`, or Claude Code's own `ide` server — see `checks/session.py`'s
`_ide_mcp_connected`). Not loaded otherwise; nothing here applies to a project without one.
Claude Code's `ide` server offers `getDiagnostics` (read, fine for anyone) and `executeCode`
(orchestrator only, like every tool that runs code).

## ideas
<!-- source: 6cdeac7b19e8f2ba -->
<!-- todo: translate -->
Ideas

Detail page announced by the session-start topic line. "ideas" is active when the session owner's
own ideas file — `docs/ai/concept/ideas-<identity>.md`, rules for the human in that folder's
`README.md` — has entries that are new or changed since they were last processed; the session
start names them in an `[act] ideas:` note. Mechanism: `.act/scripts/ideas.py`, called from
`.act/hooks/checks/session.py`.

## live-systems
<!-- source: a1d03acb0e39d7c5 -->
<!-- todo: translate -->
Access to live systems

Detail page for `R-safe-approval` (`.act/rules/shared/10-safety.md`). Read this whenever a task
reaches beyond the repo into a reachable system: a server over SSH, a database, a service's API, a
container host, a router, a smart-home or monitoring instance.

## logging
<!-- source: c8d4ca2c4fd335b0 -->
<!-- todo: translate -->
Logging

Detail page announced by the session-start topic line. Read this when
`docs/ai/config.md` § Logging has `logging` set to `on` — the session-start status line names
every topic whose switch is on, this one included, see `.act/hooks/checks/session.py`'s
`refresh_session()`. Mechanism: `.act/scripts/log.py`, observer `.act/hooks/checks/event_log.py`.

## safeguards
<!-- source: 96b06e61daf30d89 -->
<!-- todo: translate -->
Safeguard blocks

Detail page for `R-safe-block` (`.act/rules/shared/10-safety.md`). Read this whenever a tool
flags a request or an action as risky — a guardrail, a content filter, a permission escalation.

## _intro
<!-- source: 8c88cf2e463d41fe -->
<!-- todo: translate -->
A rule points to a topic when the detail is only needed in some situations.
