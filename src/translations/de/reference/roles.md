<!-- German catalog for the reference page "roles". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## builder
<!-- source: 18febb351480ec94 -->
<!-- todo: translate -->
Implements a bounded assignment - code, migration, tests, configuration - and returns a result plus evidence; never commits.

## builder#about
<!-- source: 311a918b3b385de6 -->
<!-- todo: translate -->
Implements a bounded assignment: code, migration, tests, configuration. Applies `R-role-worker`.

## debugger
<!-- source: 3bceaaa2f6c25186 -->
<!-- todo: translate -->
Searches for a bug's cause by hypothesis rather than guesswork; reproduces first, separates symptom from cause.

## debugger#about
<!-- source: d18718184076056b -->
<!-- todo: translate -->
Searches for the cause of a reported bug that the orchestrator describes. Fixes nothing — the fix
is a separate assignment (`builder`). Applies `R-role-worker`.

## doc-writer
<!-- source: c290dce552652e04 -->
<!-- todo: translate -->
Maintains docs/project/ (never docs/ai/) - works findings into the project docs, keeps cross-references and status markers current.

## doc-writer#about
<!-- source: 269b317dbbe11ab5 -->
<!-- todo: translate -->
Maintains `docs/project/` — project documentation, not the collaboration workspace under
`docs/ai/`. Applies `R-role-worker`.

## expert-solver
<!-- source: 67097544e420609b -->
<!-- todo: translate -->
High-reasoning escalation, called only after a worker has failed the same task twice or hit an unsolvable error.

## expert-solver#about
<!-- source: 32c7e6675fafecf5 -->
<!-- todo: translate -->
Escalation only, per `R-role-escalate` — called after a worker has failed the same task twice, or
an edge case has a standard worker stuck. Senior architect and problem-solver for exactly that
case, not routine implementation. Applies `R-role-worker`.

## explorer
<!-- source: 49430822cabdf716 -->
<!-- todo: translate -->
Read-only codebase research across multiple files and directories; reports findings backed by path:line.

## explorer#about
<!-- source: 34f0cb32fed94a65 -->
<!-- todo: translate -->
Read-only research across multiple files and directories; findings backed by `<path>:<line>`.
Applies `R-role-worker`.

## optimizer
<!-- source: bde5b9671f615258 -->
<!-- todo: translate -->
Polishes freshly written code for brevity and readability - at most two rounds, no algorithm tuning.

## optimizer#about
<!-- source: 564be43f4d0ed33f -->
<!-- todo: translate -->
Runs after `builder`, only on the code that assignment just wrote — files and lines named in the
assignment, never grown code from elsewhere and never project-wide. Applies `R-role-worker`.

## quick-check
<!-- source: dc952c767a01b276 -->
<!-- todo: translate -->
Fixed, read-only lookups without judgment (git status, tests, files, line counts).

## quick-check#about
<!-- source: cace6d37f7fd3e1a -->
<!-- todo: translate -->
Runs a fixed set of read-only lookups and returns the raw result, without judgment. Applies
`R-role-worker`.

## reviewer
<!-- source: db27b9e02fbc6b4e -->
<!-- todo: translate -->
Adversarial review before a commit — bugs, style, and task fidelity — plus ALLOW/BLOCK on a flagged safeguard call.

## reviewer#about
<!-- source: b1a43d753b082121 -->
<!-- todo: translate -->
Adversarial review before a commit, plus ALLOW/BLOCK on a flagged tool call. Applies
`R-role-worker`.

## test-writer
<!-- source: e6dbc3c49677ea08 -->
<!-- todo: translate -->
Writes tests to existing code, or test-first from a concept/interface alone; checks behavior, not implementation.

## test-writer#about
<!-- source: 485a942ab447849c -->
<!-- todo: translate -->
Writes tests — to existing code, or test-first from a concept/interface description alone — and
proves them with a test run. Applies `R-role-worker`.

## _intro
<!-- source: bb784335680ef087 -->
<!-- todo: translate -->
A role is a bounded kind of worker; its tier says how much model capacity it gets, and `.act/tiers.json` maps tiers to concrete models only at generation time.
