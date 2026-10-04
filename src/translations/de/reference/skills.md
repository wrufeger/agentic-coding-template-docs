<!-- German catalog for the reference page "skills". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## act
<!-- source: 37952c157389d862 -->
<!-- todo: translate -->
List the project's skills with a one-line description from each one's frontmatter, like a man page; given a name, show that skill in full. Use when asked what skills or commands exist, or for one skill's exact instructions.

## act-a11y
<!-- source: 036df85d5648b7e0 -->
<!-- todo: translate -->
Check an interface for accessibility and work through the findings by severity - keyboard operation, focus, contrast, labels, structure. Use when asked to check accessibility, whether something is usable with a screen reader, or against WCAG.

## act-adopt
<!-- source: 9f2f89006547304c -->
<!-- todo: translate -->
One-time takeover of an existing project's docs and AI tooling into this template's layout - old template, foreign template, or a homegrown structure, all through the same path. Use instead of a plain init.py --target whenever the project already has its own docs or AI tooling, or when asked to adopt/migrate an existing project's docs/ai-tooling.

## act-audit-docs
<!-- source: 8eeef3217bcca462 -->
<!-- todo: translate -->
Check docs/project against the actual code and bring outdated entries back in line - architecture, coding rules, testing, features, decisions. Use after a feature wave, before a handover, or when docs/project might be stale.

## act-bug
<!-- source: 78a421c2fe67cd2d -->
<!-- todo: translate -->
Fix a reported bug - reproduce it, localize the cause, then prove the fix with a test that is red before the change and green after. Use when a bug is reported, something is broken, or asked to debug specific behavior.

## act-commit
<!-- source: a936bd2d52472989 -->
<!-- todo: translate -->
Close out an accepted task - check the evidence, archive it, update the journal, commit by pathspec. Use right after a task is accepted and its evidence (a test run, an outside call, a commit) is in hand.

## act-deps
<!-- source: 6104dd9d727c36a6 -->
<!-- todo: translate -->
Update dependencies - inventory age and known gaps, bundle patch/minor, one commit per major after reading its changelog, checks green after every step. Use when dependencies are stale, a security advisory needs checking, or asked to update packages.

## act-design-assets
<!-- source: cccf09d6fabe990d -->
<!-- todo: translate -->
Produce graphics that stay in the project - logo, icon set, illustration, favicons - as hand-written SVG or through an image model, checked and placed in the repo. Use when asked to design a logo, icons, a favicon set, or a product image.

## act-design-build
<!-- source: 62139866ccc1f023 -->
<!-- todo: translate -->
Implement a component or page against a template and check the result yourself in the browser - in rounds, until it fits. Use when asked to build a component from a screenshot, implement a chosen variant, or turn a page design into code.

## act-design-ideas
<!-- source: 2442766c4c181628 -->
<!-- todo: translate -->
Generate three to four design variants as preview images, from a description, screenshots, or web links - for discussion before code exists. Use when asked for design ideas, variants for a component or page, or what something could look like.

## act-doctor
<!-- source: c420ca22de107815 -->
<!-- todo: translate -->
Reconcile project and template state - mechanical checks after every update (stale overrides, dead IDs, orphaned bridges), content checks only on request or for rules an update just changed. Use to check for drift against the template, after an update, or when asked whether local overrides still make sense.

## act-export-settings
<!-- source: 035925f9801d4fac -->
<!-- todo: translate -->
Write this project's own rule deviations, and optionally its own scripts/checklists/agents/skills, to a portable settings file for another project or for review before sharing. Use to hand this project's setup to a new project, or to check what a settings export would reveal before sending it anywhere.

## act-feedback
<!-- source: 743942cf99e1a9b2 -->
<!-- todo: translate -->
Send feedback to the template author about the working method itself - a rule, workflow, script, or skill that helped or was missing - never project specifics. Use when asked to send feedback, report something back to the template, or note a bug in the template.

## act-idea
<!-- source: 307121bdfc9bf3aa -->
<!-- todo: translate -->
Take in an idea, feature, or change request - check what exists, lay out options with a recommendation, get a decision, then estimate effort and missing tooling and file it as a backlog item and task. Use when a feature or change is proposed, or asked "can we add X", "it would be good if", "change request".

## act-integrations
<!-- source: f939905d122ed085 -->
<!-- todo: translate -->
Check which ways lead from this project to its repo host and issue tracker (REST token, MCP servers), what each can do, and record it in docs/project/integrations.md. Read-only probes, never a write. Also proposes MCP servers from the catalog (.act/mcp-catalog.md) when asked, e.g. "which MCP servers fit?", and sets one up only after a yes. Use when asked what GitHub/GitLab access exists, before act-pr or act-issue when the file is missing or older than 30 days, after a token or MCP server changed, or when the human asks which MCP servers or tools fit the project.

## act-issue
<!-- source: 8e52a9c5727fad45 -->
<!-- todo: translate -->
Read, create, comment on, close and start work on issues and stories of GitHub or GitLab. Use when asked to "show issues", "show my open stories", "show issue 42", to create or comment on or close an issue, or to "start work on issue 42".

## act-load-settings
<!-- source: ace54b491e4e70a2 -->
<!-- todo: translate -->
Import a settings file (act-export-settings' output) into this project - mechanical checks decide new/identical/dead on their own, content overlaps go to a model for judgment, everything unresolved lands in the inbox instead of being applied silently. Use when handed a settings.md or settings.zip file to bring into this project.

## act-perf
<!-- source: 9013650ee421bed5 -->
<!-- todo: translate -->
Improve the performance of a named, concrete part of the system - measure first, form a hypothesis, change one thing, measure again, compare. Use when something is reported as slow, or asked to speed up a page, query, or endpoint.

## act-pr
<!-- source: edee616e4b1589f5 -->
<!-- todo: translate -->
Prepare a pull request (GitHub) or merge request (GitLab) from the diff against the target branch and create it only after the human's explicit yes. Use when asked to open a pull request, create a merge request, write a PR description, or "send this branch for review".

## act-prepare
<!-- source: 8f486c03d465f40b -->
<!-- todo: translate -->
Prepare a larger block so it runs without interruptions - research what exists, cut it into tasks, check readiness, then ask everything open in one bundle. Use when planning a feature, asked to "plan this out", before a block that should run unattended, or when the human says they'll be away.

## act-refactor
<!-- source: 2cdd686c50be53e6 -->
<!-- todo: translate -->
Restructure existing code without changing its behavior - state the goal and scope, check the test net, refactor in small steps, verify with tests after each one. Use when asked to refactor, clean up, or restructure code without changing what it does.

## act-release
<!-- source: 2839617af97c921c -->
<!-- todo: translate -->
Prepare a new release - check preconditions, pick a semantic version, generate a readable changelog from commits, tag it. Use when asked to prepare a release, publish a new version, or generate a changelog.

## act-setup
<!-- source: 44af45079767f98c -->
<!-- todo: translate -->
Set up this checkout as a project, or dock it onto one that already exists - the first thing to run in a fresh template clone, and whenever the owner asks to set up, initialize or install a project. Triggers include "setup", "initialize", "install", "richte ... ein", "neues Projekt".

## act-slides
<!-- source: edc23cda4be4ea1a -->
<!-- todo: translate -->
Create or update a presentation about the project - slides as Markdown in the repo, content from the existing docs, exported to HTML/PDF. Use when asked for a presentation, slides for the project, or a training deck.

## act-test-gap
<!-- source: 6e3e351519d0f4bb -->
<!-- todo: translate -->
Find untested areas in a scope, prioritize by risk, and close the gaps after approval - measure what's covered, propose a prioritized list, write targeted tests instead of chasing coverage percentages. Use when asked to find test gaps, check test coverage for an area, or backfill tests for existing code.

## act-update
<!-- source: c73b5e61be323a8a -->
<!-- todo: translate -->
Pull a newer template state into the project - review the diff, give consent, then let update.py replace .act/, refresh copies, run migrations, and hand off to the doctor. Use to check for or apply a template update.

## _intro
<!-- source: 46565377cf8cbe79 -->
<!-- todo: translate -->
A skill is a reusable procedure the assistant runs on request or when its description matches the situation.
