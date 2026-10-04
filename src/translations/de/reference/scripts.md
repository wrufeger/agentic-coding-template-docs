<!-- German catalog for the reference page "scripts". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## table:actlib.py
<!-- source: 8911ee0e74f116a2 -->
<!-- todo: translate -->
Shared library for every script under .act/scripts/ and .act/hooks/ — the single place that knows how to resolve template vs. project…

## table:adopt.py
<!-- source: 76f810bbadf5d455 -->
<!-- todo: translate -->
Mechanical executor of an approved adoption table (skill `act-adopt`, steps 4 and 7). Runs from a template checkout against a project that…

## table:adopt_config.py
<!-- source: 04acfad216fda8bc -->
<!-- todo: translate -->
Carry the settings of an older German AI-CONFIG.md (the predecessor template's control file) over into the project's docs/ai/config.md…

## table:adopt_entries.py
<!-- source: 7135d10e3e6d811e -->
<!-- todo: translate -->
Batch writer for the content step of an adoption (skill `act-adopt`). The model reads the old material in whatever format it has and writes…

## table:adopt_passages.py
<!-- source: 93048cc6a37b6980 -->
<!-- todo: translate -->
Mechanical insertion of an adopted project's own passages into docs/project/coding_rules.md and docs/README.md (skill `act-adopt`, step 6…

## table:adopt_scan.py
<!-- source: cc1b929d0ace3c8f -->
<!-- todo: translate -->
Read-only sighting of an existing project's documentation and AI-tooling material, before adoption (skill `act-adopt`). Walks the target…

## table:board.py
<!-- source: 4bb21fb40b4a4068 -->
<!-- todo: translate -->
Generate the board — a fully derived snapshot (current branch, last commit, dirty state, recent journal entries, one "Waiting for you" list…

## table:doctor.py
<!-- source: 3cf9de477dcfd1f4 -->
<!-- todo: translate -->
Mechanical half of the reconcile skill `act-doctor` — the cheap checks that run after every update and on demand, without a model in the…

## table:entries.py
<!-- source: c2c3cf3e6b9fc8c4 -->
<!-- todo: translate -->
Create and account for the project's short-lived entry files — tasks, backlog items, journal entries, and docs/ai/inbox/ entries (question…

## table:feedback.py
<!-- source: 2b08639c30cb90f8 -->
<!-- todo: translate -->
Voluntary feedback from a derived project to the template author — so real work in real projects turns into better default rules, scripts…

## table:feedback_privacy.py
<!-- source: 30db4e368a39a1b2 -->
<!-- todo: translate -->
The privacy checks that decide whether a string may leave the project as part of a feedback payload (.act/scripts/feedback.py) — patterns…

## table:forge.py
<!-- source: cb93b1ee95211681 -->
<!-- todo: translate -->
A small REST client for the project's git host (GitHub, GitHub Enterprise, GitLab.com and self-hosted GitLab) — the one script the skills…

## table:frontmatter.py
<!-- source: d5e574c6e2ab4c9a -->
<!-- todo: translate -->
One shared frontmatter parser for every "---\n...\n---\n" block under .act/ and docs/ai/local/ -- used to be two: tiers.py's…

## table:ideas.py
<!-- source: b2df8059a1b0ea78 -->
<!-- todo: translate -->
The per-person ideas file `docs/ai/concept/ideas-<identity>.md` — one versioned file for every person on a project, written by that person…

## table:init.py
<!-- source: d2e5bd01a6c2fdf3 -->
<!-- todo: translate -->
Turn a checkout of this template into a project ("here, in this clone"), or dock onto an existing/empty directory ("--target"). Ten steps…

## table:integrations.py
<!-- source: e76bd501b0d52097 -->
<!-- todo: translate -->
Find out which ways lead from this project to its repo host and issue tracker (REST access through forge.py, MCP servers) and what each one…

## table:log.py
<!-- source: ce74ae1a64c05aa5 -->
<!-- todo: translate -->
Write one line to ai.log at the project root (AGENTS.md § "Logging (optional)", .act/rules/topics/logging.md) and the small tools to read…

## table:manifest.py
<!-- source: da5917c3a95a3d83 -->
<!-- todo: translate -->
Generate or verify .act/MANIFEST.json — a SHA-256 hash per file under .act/, used to detect local edits to the template before an update…

## table:rules.py
<!-- source: 5c387e9b86e110f4 -->
<!-- todo: translate -->
Read the *effective* rules — the template's rule sets after the project's own checkboxes, replacements and additions are applied. One…

## table:script_docs.py
<!-- source: 406ed1258f2c9271 -->
<!-- todo: translate -->
Generate .act/scripts/README.md — a reference for every script under .act/scripts/, built from each script's own `--help` output plus a…

## table:security_deep.py
<!-- source: 9464a5a890a12325 -->
<!-- todo: translate -->
Security check "Art C": a deep, cross-language scan with Semgrep over the files changed since a ref (default: the latest tag) or the whole…

## table:security_scan.py
<!-- source: 5bb99ae4ad45d9af -->
<!-- todo: translate -->
Security check Art B: a live library-vulnerability lookup against the lock files an ecosystem actually has, run either as a manual command…

## table:settings_export.py
<!-- source: 36814737f8168627 -->
<!-- todo: translate -->
`act-export-settings` — write the project's own rule deviations (and, with a switch, local scripts/checklists) to a portable settings file…

## table:settings_format.py
<!-- source: 14ab4c08ab4bec32 -->
<!-- todo: translate -->
Data model, parser and serializer for the settings file ("settings.md") — the portable snapshot of a project's own rule deviations (and, in…

## table:settings_load.py
<!-- source: 62e3dfae2ddee264 -->
<!-- todo: translate -->
`act-load-settings` — import a portable settings file (or several) into this project: the counterpart to settings_export.py. Runs the same…

## table:skills.py
<!-- source: bcef523f67d68b13 -->
<!-- todo: translate -->
List the project's skills like a man page (name + one-line description from each `SKILL.md`'s frontmatter), or print one skill's `SKILL.md`…

## table:tiers.py
<!-- source: c7ee14df033437f0 -->
<!-- todo: translate -->
Resolve a role's tier/reasoning -- never a real model name anywhere else under .act/ -- into a concrete model alias/effort pair for one…

## table:update.py
<!-- source: e5451d99c921d588 -->
<!-- todo: translate -->
Pull a newer state of the template into an already-initialized project. Ten steps, always in the same order: fetch the template into a temp…

## table:usage.py
<!-- source: 5f4b17ec0429dca6 -->
<!-- todo: translate -->
Local usage counter — how often each role starts, at which tier/model; how often each skill, slash command, script and checklist is used…

## _intro
<!-- source: 374e60a4342af8ad -->
<!-- todo: translate -->
One row per script under `.act/scripts/`; the per-script sections below are each script's own `--help` output, not retyped by hand. Regenerate with `python .act/scripts/script_docs.py` after changing a script's arguments — `--check` catches drift, and `doctor.py` reports it as a finding.
