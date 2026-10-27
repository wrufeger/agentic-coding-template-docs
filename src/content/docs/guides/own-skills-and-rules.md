---
title: Own rules, skills and roles
description: Switch template rules off, add your own, override template files under docs/ai/local/, add skills and roles, and carry them to another project.
sidebar:
  order: 3
---

The project always overrides the template. You never edit anything under `.act/`; a guard (`template-write-guard`) refuses writes there. Everything that is yours goes into `docs/ai/` and `docs/project/`, and survives every update.

## Rules in docs/ai/rules.md

`docs/ai/rules.md` lists the rule files the assistant loads, each import followed by its rules as checkboxes:

```markdown
@../../.act/rules/shared/20-code.md
  - [x] `R-code-language`
  - [ ] `R-code-encoding`
```

- **Switch a rule off**: remove its cross. The file is still loaded whole, but an unchecked rule counts as off. If a template update moves a rule to another rule file, `act-update` moves its checkbox line along in an edited `docs/ai/rules.md`, mark and reason unchanged, so a rule you switched off stays off. If you do not import the new file, the move is only reported.
- **Switch a whole area off**: delete its `@` import line.
- **Replace a rule's wording**: under `## Overrides`, add a bullet of the form ``- replaces `R-...`: <your version>`` naming the rule and your version (lines starting with `<!--` are skipped). A `replaces` line wins over the template text whether the rule is checked or not.
- **Add your own rules**: under `## Own rules`, one item per rule that has no counterpart in the template. An indented list directly below an own rule (or a `replaces` line) belongs to it and is read as part of its text.

The orchestrator rule files imported in the section "Orchestrator only" of `docs/ai/rules.md` (`.act/rules/orchestrator/`, or their overrides under `docs/ai/local/rules/orchestrator/`) do not reach workers; other text in that section does. The template's roles load no `CLAUDE.md`, and a hook hands them the shared rules, the coding rules, your own rules from `docs/ai/rules.md`, `CLAUDE.local.md` and `~/.claude/CLAUDE.md` instead, without `.act/rules/orchestrator/`. A rule meant for workers therefore belongs in the shared or coding sections or under `## Own rules`. `python .act/scripts/rules.py --worker` shows what a worker gets.

Keep the marks (`<!-- act:overrides -->`, `<!-- act:own-rules -->`) where they are; the mechanism finds the sections through them. `python .act/scripts/rules.py --imports` shows what is actually loaded. Each file ends with its size in characters (a CRLF line end counts as one), and a last line gives the total, split into the template's share under `.act/` and the project's. Coding rule sets work the same way in `docs/project/coding_rules.md`; a set of your own, or a local override of a template set, goes to `docs/ai/local/coding/<set>.md` and is switched on in `docs/project/coding_rules.md` too (only the local file is loaded, instead of the template one). `act-update` lists new template sets and groups in `docs/project/coding_rules.md`: a new set unchecked, a new group of a checked set checked; your lines, boxes and reasons stay. `rules.py --list` and `--validate` also show Claude Code's path-bound rules under `.claude/rules/` with their `paths:` patterns, warn about a pattern that matches no file, and note a file without `paths:` (it loads at every start); such a rule loads only once a matching file is read or written, and `act-adopt` offers to keep these files as they are. The rule IDs are in the [rules reference](/agentic-coding-template-docs/reference/rules/) and the [coding rules reference](/agentic-coding-template-docs/reference/coding-rules/).

## Overriding a file: docs/ai/local/

`docs/ai/local/` mirrors `.act/`: a file with the same relative path wins over the template version. `docs/ai/local/<path>` is looked up before `.act/<path>`. To change a template skill file, copy it to `docs/ai/local/skills/<name>/<file>` and edit the copy; the project copy is then generated from your override. You own the folder, and the assistant writes there only when you tell it to.

The folder also holds optional files of your own, for example `reminders.md` (one "remind me" line per row, with an optional cadence) and `security-accepted.md` (see [The security check](/agentic-coding-template-docs/guides/security-check/)).

## Own skills

A skill is a directory with a `SKILL.md` that starts with YAML frontmatter (`name`, `description`) and contains tool-neutral instructions. Put your own at `docs/ai/local/skills/<name>/SKILL.md`; its tool copies (`.claude/skills/<name>/`, and `.agents/skills/<name>/` only when codex, copilot, gemini or cursor is configured) are written by `act-load-settings` on import. A hand-placed skill gets them at the next session start (with `session-start-refresh` at its default `block`) or `update.py` run, or by `python .act/scripts/unit_copies.py`. A copy you edited yourself is kept, and one you deleted stays deleted. Until then the skill is reachable via `/act <name>`. A skill name that the template already ships is an override of that skill, not a new one. Write the `description` trigger-first ("Use when ...", 15 to 55 words, no list of steps), because it is all an agent sees before loading the skill; `python .act/scripts/skills.py --check` lints it, and `doctor` reports a missing or overlong description in your own skills. `doctor` also checks the frontmatter of your own skills and roles: valid YAML, a `name` equal to the folder or file name, no unknown or invalid fields. A long skill keeps the core flow in `SKILL.md` and puts detail in `references/<topic>.md`, loaded only when needed. The shipped skills are listed in the [skills reference](/agentic-coding-template-docs/reference/skills/).

## Own roles

An own role is a file `docs/ai/local/agents/<name>.md` with its rules. A new role is its own bridge source and needs frontmatter (`name`, `description`, tier/reasoning, `tools`); only an override of a template role is plain text without frontmatter. Tier and reasoning (of a skill: `reasoning` in its frontmatter, overridable by a row with the skill's name) can also be set in the Roles table of `docs/ai/config.md` (see [Tiers and reasoning](/agentic-coding-template-docs/concepts/reasoning/)); the tool-specific file under `.claude/agents/` is created by init and update; an own role also gets it at session start under the default `session-start-refresh`. Once such a file exists, its text is yours: updates only refresh its `model` and `effort` lines. The template's roles carry `omitClaudeMd: true`; an own role without the field loads `CLAUDE.md` as before, including the orchestrator rules, so add the field if you want it to get only the worker rules (see [Update](/agentic-coding-template-docs/getting-started/update/)). The built-in roles are described in [Roles](/agentic-coding-template-docs/concepts/roles/).

## Taking it to another project

Two skills carry your deviations from the template to another project.

Both skills start only as typed slash commands (`/act-export-settings`, `/act-load-settings`); a request in plain words does not start them.

**`act-export-settings`** writes what you changed against the template into one `settings.md`: your own rules, switched-off rules and groups, `replaces` overrides. Nothing about the project itself (name, work state) goes in. Options:

- `--all` also lists the unchanged rules.
- `--with-scripts`, `--with-checklists`, `--with-agents`, `--with-skills` add the files from `docs/ai/local/`; any of them produces a `.zip` instead of a `.md`.
- `--with-topics` adds the topic rules under `docs/ai/local/rules/topics/`: a topic of your own as `[+] <name>.md`, an override of a template topic as `[~] <name>.md` with a fingerprint of the template topic it overrides. Whole files, so it also produces a `.zip`.
- `--strict` aborts instead of substituting a placeholder; use it when the file leaves your own hands.
- `--out PATH` chooses the location; the default is `.act-local/export/`. `--profile` writes to your personal profile instead. A path outside the project is refused by the `outside-root` check: keep the default folder, add the path to `outside-root-allow` ([Checks](/agentic-coding-template-docs/reference/configuration/#checks)), or set `ACT_OUTSIDE_ROOT=warn` for one run.

The script scans every value for credentials, mail addresses, IP addresses, local paths and internal hosts and replaces a hit with a visible `<setup:KIND>` placeholder. It reports the finding count; skim the file before sending it anywhere.

**`act-load-settings`** imports such a file. `python .act/scripts/settings_load.py plan` shows what would happen and writes nothing; with no file named, it takes everything in `.act-local/import/`. A file outside the project is refused by `outside-root`: put it into `.act-local/import/`, allow its folder in `outside-root-allow`, or set `ACT_OUTSIDE_ROOT=warn` for one run. `apply` then writes what is clear. Overlaps with your own rules are judged, not applied silently, and anything unresolved lands in one inbox entry. Bundled scripts, skills and roles are shown to you before they are written, and a skill or role that shares a name with a template one, or asks for risky frontmatter (hooks, MCP servers, permission modes), is reported and never written. Own topic rules and topic overrides go to `docs/ai/local/rules/topics/<name>.md`: a topic already there with different content is reported as changed and left alone; an override whose template topic no longer exists is reported as dead and not written; one whose template topic changed since the export is reported as changed-since-export, to review by hand.
