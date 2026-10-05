---
title: "Skills"
description: "Every skill the template ships, with its one-line description."
sidebar:
  order: 2
---

:::note
Generated from template version 2.0.0 (commit 1829319) — do not edit by hand. Regenerate with `npm run gen`.
:::

28 skills. A skill is a reusable procedure the assistant runs on request or when its description matches the situation.

## act

List the project's skills with a one-line description from each one's frontmatter, like a man page; given a name, show that skill in full. Use when asked what skills or commands exist, or for one skill's exact instructions.

Source: `.act/skills/act/SKILL.md`

## act-a11y

Check an interface for accessibility and work through the findings by severity - keyboard operation, focus, contrast, labels, structure. Use when asked to check accessibility, whether something is usable with a screen reader, or against WCAG.

Source: `.act/skills/act-a11y/SKILL.md`

## act-adopt

One-time takeover of an existing project's docs and AI tooling into this template's layout - old template, foreign template, or a homegrown structure, all through the same path. Use instead of a plain init.py --target whenever the project already has its own docs or AI tooling, or when asked to adopt/migrate an existing project's docs/ai-tooling.

Source: `.act/skills/act-adopt/SKILL.md`

## act-audit-docs

Check docs/project against the actual code and bring outdated entries back in line - architecture, coding rules, testing, features, decisions. Use after a feature wave, before a handover, or when docs/project might be stale.

Source: `.act/skills/act-audit-docs/SKILL.md`

## act-bug

Fix a reported bug - reproduce it, localize the cause, then prove the fix with a test that is red before the change and green after. Use when a bug is reported, something is broken, or asked to debug specific behavior.

Source: `.act/skills/act-bug/SKILL.md`

## act-check-translations

Check a project's translation files for completeness and consistency - missing, extra and empty keys, placeholder mismatches, keys used in code but not defined, defined but unused - and work through the findings. Use when asked to check translations or i18n, whether all languages are complete, or after adding a language or new UI text.

Source: `.act/skills/act-check-translations/SKILL.md`

## act-commit

Close out an accepted task - check the evidence, archive it, update the journal, commit by pathspec. Use right after a task is accepted and its evidence (a test run, an outside call, a commit) is in hand.

Source: `.act/skills/act-commit/SKILL.md`

## act-deps

Update dependencies - inventory age and known gaps, bundle patch/minor, one commit per major after reading its changelog, checks green after every step. Use when dependencies are stale, a security advisory needs checking, or asked to update packages.

Source: `.act/skills/act-deps/SKILL.md`

## act-design-assets

Produce graphics that stay in the project - logo, icon set, illustration, favicons - as hand-written SVG or through an image model, checked and placed in the repo. Use when asked to design a logo, icons, a favicon set, or a product image.

Source: `.act/skills/act-design-assets/SKILL.md`

## act-design-build

Implement a component or page against a template and check the result yourself in the browser - in rounds, until it fits. Use when asked to build a component from a screenshot, implement a chosen variant, or turn a page design into code.

Source: `.act/skills/act-design-build/SKILL.md`

## act-design-ideas

Generate three to four design variants as preview images, from a description, screenshots, or web links - for discussion before code exists. Use when asked for design ideas, variants for a component or page, or what something could look like.

Source: `.act/skills/act-design-ideas/SKILL.md`

## act-doctor

Reconcile project and template state - mechanical checks after every update (stale overrides, dead IDs, orphaned bridges), content checks only on request or for rules an update just changed. Use to check for drift against the template, after an update, or when asked whether local overrides still make sense.

Source: `.act/skills/act-doctor/SKILL.md`

## act-export-settings

Write this project's own rule deviations, and optionally its own scripts/checklists/agents/skills/topics, to a portable settings file for another project or for review before sharing. Use to hand this project's setup to a new project, or to check what a settings export would reveal before sending it anywhere.

Source: `.act/skills/act-export-settings/SKILL.md`

## act-feedback

Send feedback to the template author about the working method itself - a rule, workflow, script, or skill that helped or was missing - never project specifics. Use when asked to send feedback, report something back to the template, or note a bug in the template.

Source: `.act/skills/act-feedback/SKILL.md`

## act-idea

Take in an idea, feature, or change request - check what exists, lay out options with a recommendation, get a decision, then estimate effort and missing tooling and file it as a backlog item and task. Use when a feature or change is proposed, or asked "can we add X", "it would be good if", "change request".

Source: `.act/skills/act-idea/SKILL.md`

## act-integrations

Check which ways lead from this project to its repo host and issue tracker (REST token, MCP servers), what each can do, and record it in docs/project/integrations.md. Read-only probes, never a write. Also proposes MCP servers from the catalog (.act/mcp-catalog.md) when asked, e.g. "which MCP servers fit?", and sets one up only after a yes. Use when asked what GitHub/GitLab access exists, before act-pr or act-issue when the file is missing or older than 30 days, after a token or MCP server changed, or when the human asks which MCP servers or tools fit the project.

Source: `.act/skills/act-integrations/SKILL.md`

## act-issue

Read, create, comment on, close and start work on issues and stories of GitHub or GitLab. Use when asked to "show issues", "show my open stories", "show issue 42", to create or comment on or close an issue, or to "start work on issue 42".

Source: `.act/skills/act-issue/SKILL.md`

## act-load-settings

Import a settings file (act-export-settings' output) into this project - mechanical checks decide new/identical/dead on their own, content overlaps go to a model for judgment, everything unresolved lands in the inbox instead of being applied silently. Use when handed a settings.md or settings.zip file to bring into this project.

Source: `.act/skills/act-load-settings/SKILL.md`

## act-perf

Improve the performance of a named, concrete part of the system - measure first, form a hypothesis, change one thing, measure again, compare. Use when something is reported as slow, or asked to speed up a page, query, or endpoint.

Source: `.act/skills/act-perf/SKILL.md`

## act-pr

Prepare a pull request (GitHub) or merge request (GitLab) from the diff against the target branch and create it only after the human's explicit yes. Use when asked to open a pull request, create a merge request, write a PR description, or "send this branch for review".

Source: `.act/skills/act-pr/SKILL.md`

## act-prepare

Prepare a larger block so it runs without interruptions - research what exists, cut it into tasks, check readiness, then ask everything open in one bundle. Use when planning a feature, asked to "plan this out", before a block that should run unattended, or when the human says they'll be away.

Source: `.act/skills/act-prepare/SKILL.md`

## act-refactor

Restructure existing code without changing its behavior - state the goal and scope, check the test net, refactor in small steps, verify with tests after each one. Use when asked to refactor, clean up, or restructure code without changing what it does.

Source: `.act/skills/act-refactor/SKILL.md`

## act-release

Prepare a new release - check preconditions, pick a semantic version, generate a readable changelog from commits, tag it. Use when asked to prepare a release, publish a new version, or generate a changelog.

Source: `.act/skills/act-release/SKILL.md`

## act-seo

Check a project's pages for basic search-engine optimization in the code - title and description, headings, lang, canonical, Open Graph, image alt text, internal links, robots.txt and sitemap - and work through the findings. Use when asked to check SEO, why pages are poorly found, or before launching a site.

Source: `.act/skills/act-seo/SKILL.md`

## act-setup

Set up this checkout as a project, or dock it onto one that already exists - the first thing to run in a fresh template clone, and whenever the owner asks to set up, initialize or install a project. Triggers include "setup", "initialize", "install", "richte ... ein", "neues Projekt".

Source: `.act/skills/act-setup/SKILL.md`

## act-slides

Create or update a presentation about the project - slides as Markdown in the repo, content from the existing docs, exported to HTML/PDF. Use when asked for a presentation, slides for the project, or a training deck.

Source: `.act/skills/act-slides/SKILL.md`

## act-test-gap

Find untested areas in a scope, prioritize by risk, and close the gaps after approval - measure what's covered, propose a prioritized list, write targeted tests instead of chasing coverage percentages. Use when asked to find test gaps, check test coverage for an area, or backfill tests for existing code.

Source: `.act/skills/act-test-gap/SKILL.md`

## act-update

Pull a newer template state into the project - review the diff, give consent, then let update.py replace .act/, refresh copies, run migrations, and hand off to the doctor. Use to check for or apply a template update.

Source: `.act/skills/act-update/SKILL.md`
