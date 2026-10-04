<!-- German catalog for the reference page "coding-rules". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## bash
<!-- source: 5ccd706af7f08593 -->
<!-- todo: translate -->
Coding rules — Bash
summary: strict mode, quoting, exit codes, error messages, shellcheck, pitfalls

Rules for Bash scripts. Group IDs (`CR-bash-<name>`) are stable and never reassigned; a group
whose purpose no longer holds gets a new ID and is listed as `retired:` in this header.

## CR-bash-basics
<!-- source: 3031ea346436f142 -->
<!-- todo: translate -->
Strict mode, quoting, error handling, shellcheck
summary: set -euo pipefail, quoting, deliberate exit codes, errors on stderr, shellcheck, pitfalls

- Start every script with `set -euo pipefail` as the first executable line.
- Quote variables consistently (`"$var"`), especially paths that may contain spaces.
- Set exit codes deliberately (`exit 0`/`exit 1`/specific codes) instead of letting the last
  command's status pass through implicitly.
- Check arguments and inputs before use (count, whether a path exists); report failures on stderr,
  and name what failed and with what — not a bare "error".
- Run `shellcheck` as the stack's standard linter before every commit; do not suppress its
  warnings wholesale.
- Pitfalls:
  - Never parse the output of `ls` in a loop — use globbing or `find ... -print0` with
    `read -d ''`.
  - Check the result of `cd` (`cd dir || exit 1`); otherwise following commands run in the
    wrong directory.

## CR-bash-script-shape
<!-- source: 01029fe0b544ff6a -->
<!-- todo: translate -->
One script, one purpose
summary: header comment, functions over duplication, single-purpose scripts

- Start with a header comment stating purpose, an example call, and the expected output/exit
  behavior.
- Use functions for reusable sections instead of copying the same command sequence.
- One script, one clearly named purpose — no multi-purpose script with mode flags for
  unrelated tasks.

## csharp
<!-- source: 353516e5996fb867 -->
<!-- todo: translate -->
Coding rules — C#
summary: nullable context, async conventions, error handling, analyzers, DI, library code

Rules for C# projects. Group IDs (`CR-csharp-<name>`) are stable and never reassigned; a group
whose purpose no longer holds gets a new ID and is listed as `retired:` in this header.

## CR-csharp-basics
<!-- source: 912e974f283d9801 -->
<!-- todo: translate -->
Nullable context, async, error handling, analyzers
summary: nullable enabled, async suffix, no async void, no blocking on tasks, using, exceptions

- Keep the nullable context (`<Nullable>enable</Nullable>`) on project-wide; do not suppress the
  warnings it produces.
- Name asynchronous methods with the `Async` suffix and return `Task`/`Task<T>`.
- Never use `async void` outside event handlers — use `async Task`, otherwise exceptions are
  swallowed.
- Avoid `.Result`/`.Wait()` on tasks; blocking on a task this way risks a deadlock in synchronous
  contexts.
- Manage every `IDisposable` resource exclusively through `using`/`await using`.
- Use exceptions for exceptional cases, not for regular control flow — consider a return type
  (`Result<T>`/`bool`) for expected failure cases; wherever an exception is thrown, its message
  names what failed and with what.
- Run `dotnet format` and the analyzer rules (`.editorconfig` section `dotnet_diagnostic`) as the
  stack's standard linting/static analysis; set them up in every project, run what is installed.

## CR-csharp-conventions
<!-- source: ea7611f7c92f8945 -->
<!-- todo: translate -->
var, records, one type per file
summary: var only for an obvious type, records for value objects, one public type per file

- Use `var` only when the type is obvious from the right-hand side, an explicit type otherwise.
- Use records for immutable value objects/DTOs, classes for objects with identity and behavior.
- One public type per file, with the file name matching the type name.

## CR-csharp-dependency-injection
<!-- source: 42475e085b79c7d9 -->
<!-- todo: translate -->
Constructor injection
summary: constructor injection, no service locator

- Inject dependencies through the constructor; no hidden service-locator access.

## CR-csharp-library-code
<!-- source: 9b8d2f37173ea8e5 -->
<!-- todo: translate -->
ConfigureAwait in library code
summary: ConfigureAwait(false) in code without a UI context

- Use `ConfigureAwait(false)` in library code that has no dependency on a UI context.

## go
<!-- source: a1cf0bbe4110476f -->
<!-- todo: translate -->
Coding rules — Go
summary: strict error checking, static analysis tooling, package design

Rules for Go projects. Group IDs (`CR-go-<name>`) are stable and never reassigned; a group
whose purpose no longer holds gets a new ID and is listed as `retired:` in this header.

## CR-go-basics
<!-- source: f62de315fb3c3976 -->
<!-- todo: translate -->
Error handling, formatting, static analysis
summary: check and wrap errors, format with gofmt, run vet/staticcheck, avoid panics and leaks

- Format every file with `gofmt`/`goimports` before committing; no hand-tuned deviation from either.
- Check an error immediately after the call that returned it (`if err != nil`) instead of collecting
  errors for later, and never discard a return value with `_` when it comes with an unchecked error.
- Wrap errors with `%w` (`fmt.Errorf("...: %w", err)`) so `errors.Is`/`errors.As` keep working further
  up the call chain; never lose or flatten the underlying error.
- Run `go vet` and `staticcheck` in CI as the stack's standard static analysis — set them up, but run
  only what is installed; if a tool is missing, say so once and install nothing unasked.
- No panics in library code for expected failure cases; panic only for genuine programming errors.
- `context.Context` is the first parameter of any function that must propagate cancellation, a
  deadline, or request-scoped values.
- Every goroutine has a visible lifecycle end (`WaitGroup` or context cancellation) — a goroutine
  with no way to stop is a leak.
- Synchronize state shared between goroutines through channels or explicit locks, never silently.

## CR-go-package-design
<!-- source: 2a236e6b334ba672 -->
<!-- todo: translate -->
Small interfaces, no grab-bag packages
summary: interfaces defined by the consumer, packages named and cut by domain

- Define interfaces on the consumer side (small, often one or two methods), not upfront by the
  provider that implements them.
- Give packages short, meaningful names cut by domain; no `util`/`common` grab-bag package without a
  real subject of its own.

## java
<!-- source: e99152267bb70f37 -->
<!-- todo: translate -->
Coding rules — Java
summary: nullability, error handling, structure, toolchain, tests

Rules for Java projects. Group IDs (`CR-java-<name>`) are stable and never reassigned; a group
whose purpose no longer holds gets a new ID and is listed as `retired:` in this header.

## CR-java-basics
<!-- source: 484e3bbc035a0768 -->
<!-- todo: translate -->
Nullability, error handling, established pitfalls
summary: explicit nullability, no raw types, correct exception handling, logging and SQL safety

- Make nullability explicit on fields, parameters and return types (JSpecify `@Nullable`/`@NonNull` or
  the alternative the project has fixed on) instead of leaving it implicit.
- No raw `Object`, no raw types on generics.
- No empty `catch` blocks and no `catch (Exception e)` without a concrete reason; use unchecked
  exceptions for programming errors and checked exceptions for expected, recoverable failures — the
  message must name what failed and with what.
- Manage resources exclusively through try-with-resources.
- Use `java.util.concurrent` (executors, `CompletableFuture`, concurrent collections) instead of manual
  `synchronized`/`wait`/`notify`.
- Log through SLF4J, parametrized (`log.info("user {} failed", id)`, never string concatenation) —
  see `R-safe-no-secret-log` for what never goes into a log line at all.
- Use `var` only where the type is obvious from the right-hand side, otherwise spell out the type.
- Return `Optional<T>` only as a method's return type for "possibly no result" — never as a field, a
  parameter, or inside a collection.
- Pitfalls: override `equals`/`hashCode` only together; use `java.time`, never `Date`/`Calendar`; use
  `BigDecimal` for money, never `float`/`double`; state `UTF_8` explicitly, never rely on the platform
  default; use only parametrized SQL, never string-concatenated queries; a plain loop may read better
  than forcing a Stream.
- Static analysis is the stack's standard — set it up, but run only what is installed; if a tool is
  missing, say so once and install nothing unasked.

## CR-java-modern-idioms
<!-- source: 6685f30bda21814b -->
<!-- todo: translate -->
Records, sealed types, text blocks, virtual threads
summary: modern language features, requires Java 17 for most, Java 21 for virtual threads

- Use records for immutable data carriers (DTOs, value objects) instead of a manual class with
  getters, `equals`, `hashCode` and a constructor — requires Java 17 (records) or 16 (preview).
- Use sealed interfaces/classes with pattern matching (`switch` on type) instead of `instanceof` chains
  — requires Java 17.
- Use text blocks for multi-line strings (SQL, JSON templates) instead of concatenation — requires
  Java 17.
- Use virtual threads only where the runtime and every library on the path support them — requires
  Java 21.

## CR-java-structure
<!-- source: bf4cc84ed8f80849 -->
<!-- todo: translate -->
Package cut, immutability, constructor injection
summary: packages by domain, immutability as the default, constructor injection

- Cut packages by business domain, not by technical layer.
- Keep visibility as narrow as possible, fields `final`, no setter without a reason — immutability is
  the default and the best guard against concurrency bugs.
- Use constructor injection instead of field injection, even outside a DI container.

## CR-java-toolchain
<!-- source: 381e2c8f7ee679b2 -->
<!-- todo: translate -->
Build and static analysis tools
summary: Maven or Gradle by default; static analysis whichever the project has set up

- Build with Maven or Gradle — the project decides which.
- Enforce formatting and static analysis in CI: Spotless or google-java-format for formatting, plus
  Checkstyle, SpotBugs, Error Prone or PMD — the template's usual choice; run whatever the project
  actually has set up (see `R-code-tools`).

## CR-java-tests
<!-- source: 46082cb29b5e2077 -->
<!-- todo: translate -->
JUnit 5 with AssertJ by default
summary: JUnit 5/AssertJ by default, behavior-describing names, no unseeded randomness, no Thread.sleep

- Write tests with JUnit 5 and AssertJ — the template's usual choice; use the test framework the
  project actually has set up instead (see `R-code-tools`).
- Name tests after the expected behavior, not after the method under test.
- Never use randomness without a fixed seed.
- Never wait with `Thread.sleep`; wait on the actual condition instead.

## nuxt
<!-- source: de51014c7dacc9f2 -->
<!-- todo: translate -->
Coding rules — Nuxt
summary: directory conventions, data fetching, runtime config, SSR mode, tooling

requires: vue, typescript

Rules for Nuxt projects. Group IDs (`CR-nuxt-<name>`) are stable and never reassigned; a group
whose purpose no longer holds gets a new ID and is listed as `retired:` in this header.

## CR-nuxt-basics
<!-- source: beb284259423da23 -->
<!-- todo: translate -->
Established Nuxt defaults
summary: directory layout, data fetching, typed handlers, runtime config, pitfalls

- Follow the directory convention (`pages/`, `components/`, `composables/`, `server/`) instead of
  inventing a structure; use auto-imports, no manual re-exports for files in those directories.
- Read data with `useFetch`/`useAsyncData` while rendering, use `$fetch` for one-off writes and actions.
- Never copy the return value of `useFetch`/`useAsyncData` into your own `ref` — pass the returned
  object through and `await` it where `data`/`status`/`error` reach the template. Copying loses
  awaitability: the call resolves later, the server renders without data, the client fills it in, and
  the result is a hydration mismatch.

      ```ts
      // Wrong — awaitability is lost
      function useThing() {
        const result = ref()
        useFetch('/api/thing').then(r => (result.value = r.data.value))
        return result
      }

      // Right — pass the returned object through unchanged
      async function useThing() {
        return await useFetch('/api/thing')
      }
      ```

- Declare path aliases in `tsconfig.json` **and** `nuxt.config.ts`. Since Nuxt 4, `~` points at `app/`,
  so without its own entry `~/types` resolves somewhere other than `~types`.
- Use `runtimeConfig` for configuration values instead of reading `process.env` in components; secrets
  live in the private part of `runtimeConfig`, never under `public`.
- Write out types for props, emits, store actions, composables and `defineEventHandler`, including
  return types.
- Name server routes under `server/api/` with a verb suffix (`login.post.ts`, `users.get.ts`) and return
  failures with `createError` and a matching HTTP status — never swallow an error or answer 200.
- Lint and typecheck are the stack's standard and belong in the project; `nuxt typecheck` needs `vue-tsc`
  as a dependency, without it there is no typecheck. Run what is installed, install nothing unasked.
- Keep the npm scripts named the same everywhere: `lint` (`eslint .`), `typecheck` (`nuxt typecheck`),
  plus `test` (`vitest run`) and `test:e2e` (`playwright test`) where tests exist.
- Pitfalls:
  - SSR code must not touch browser globals (`window`, `document`) without a guard.
  - Use `<ClientOnly>` only where a component genuinely cannot render on the server, not as a default fix.
  - **Security:** never keep per-request state in a module-level `ref`/`reactive`. On the server such a
    value outlives the request and is shared between users — the next request sees the previous one's
    data. Use `useState` for state that must survive the request.
  - Forms with `@submit.prevent` also need `method="post"` (see `CR-vue-basics`).
  - **Windows:** an aborted dev server can keep its port bound; the next start moves to the next free
    port and HMR/WebSocket errors follow. Kill the running process (`netstat -ano | findstr :3000`,
    `taskkill /PID <pid> /F`; `lsof -i :3000`, `kill <pid>`) instead of configuring a custom HMR port.

## CR-nuxt-root-folders
<!-- source: a3ad57821a6f8362 -->
<!-- todo: translate -->
Fixed root folders with their own aliases
summary: /types, /constants and /server at the repo root, each the only place of its kind

- Keep three folders at the repository root, each with its own alias and each the only place of its kind:
  `/types` (`~types`, shared types and interfaces), `/constants` (`~constants`, constants, enumerations,
  fixed keys), `/server` (`~server`, the Nitro backend).
- Import types and constants from there instead of duplicating them in components. A second type folder
  under `app/types/` is a mistake, not an addition.

## CR-nuxt-ssr
<!-- source: 4301f7390de1d1f2 -->
<!-- todo: translate -->
Choose the SSR mode on purpose
summary: ask before assuming SSR, know the hydration cost, check for mismatches after SSR work

- `ssr: false` or a plain SPA is often the simpler choice for a purely local UI with no SEO or
  first-paint requirement (e.g. an admin tool). Ask the user once, when scaffolding or restructuring
  the app, instead of defaulting to SSR without asking.
- Know what SSR costs: every page render runs twice, once on the server and once on the client.
  Anything that only exists in the browser or differs between the two runs — timestamps, random
  values, `window`, `localStorage`, locale or timezone detection — produces a hydration mismatch.
- After working on a component that renders server-side, check for hydration errors on purpose:
  load the page in the browser and read the console warning "Hydration ... mismatch" — it names the
  component and the node. Treat that warning as a finding, not a footnote.
- Known causes and their fix, in short: gate browser-only values behind `onMounted`/
  `import.meta.client`; share request-scoped state through `useState`, never a module-level `ref`;
  fix invalid HTML nesting (e.g. a block element inside a `<p>`); reach for `<ClientOnly>` only as
  the last resort.
- Copying a `useFetch`/`useAsyncData` result into your own `ref` is a common hydration-mismatch
  cause too — see `CR-nuxt-basics` for why and the fix, not repeated here.

## CR-nuxt-toolchain
<!-- source: 342a42a91eb9e683 -->
<!-- todo: translate -->
Lint and format tooling
summary: ESLint with `@nuxt/eslint` plus Prettier, whichever the project has set up

- ESLint with `@nuxt/eslint`, configured in `eslint.config.mjs`, and Prettier for formatting are the
  template's usual choice; what the project actually has installed and configured governs
  (see `R-code-tools`).

## CR-nuxt-tests
<!-- source: 0e92ef5e3df806c0 -->
<!-- todo: translate -->
Unit and end-to-end tests
summary: vitest/Playwright by default, but whichever suite the project runs must pass

- `vitest` (`vitest.config.ts`) for unit and component tests, `@playwright/test`
  (`playwright.config.ts`) for end-to-end tests — the template's usual choice; if the project has a
  different test runner installed and configured (e.g. Selenium, Nightwatch, Cypress), use that one
  instead (see `R-code-tools`).
- Whichever test suites the project actually has exist and run; a change that breaks them is not done.

## php
<!-- source: 6d28e3173cec2ea7 -->
<!-- todo: translate -->
Coding rules — PHP
summary: strict types, PSR-12/PSR-4, exceptions, prepared statements, toolchain

Rules for PHP projects (8.x and later). Group IDs (`CR-php-<name>`) are stable and never reassigned; a
group whose purpose no longer holds gets a new ID and is listed as `retired:` in this header.

## CR-php-basics
<!-- source: 34fdd424990e0f9f -->
<!-- todo: translate -->
Strict types, safe errors, safe queries
summary: strict_types, PSR-12/PSR-4, typed methods, exceptions, PDO, production errors, static analysis

- Put `declare(strict_types=1);` as the first statement in every PHP file.
- Follow PSR-12 for formatting (4-space indentation) and PSR-4 for namespaces, one namespace per
  Composer autoload root.
- Keep one class per file, with the filename matching the class name.
- Manage dependencies through Composer only; never include a library by hand.
- Declare parameter and return types on every public method. Use `mixed` only with a comment justifying
  it, and mark nullable types (`?Type`) explicitly instead of falling back to an implicit `null`.
- Throw exceptions instead of returning `false` or an error code. Define one exception class per error
  domain rather than throwing a blanket `\Exception`, and let the message name what failed and with
  what — a database exception names the query or table, a validation exception names the field and the
  value it rejected.
- Keep business logic out of templates (Blade, Twig, plain PHP templates); templates render, they don't
  decide.
- Access the database only through PDO with prepared statements; never build SQL by concatenating
  values into the query string.
- Use `===`/`!==` wherever type equality is meant, not the loose operators.
- Turn `display_errors` off in production; errors go to the log, not into the response.
- Static analysis is the stack's standard and belongs in the project. Run what is installed, install
  nothing unasked.

## CR-php-conventions
<!-- source: 75963d2d459eda52 -->
<!-- todo: translate -->
Closures over global callbacks
summary: arrow functions and closures instead of global callback functions

- Use arrow functions/closures instead of global callback functions.

## CR-php-toolchain
<!-- source: ff6f339a77178e02 -->
<!-- todo: translate -->
Formatter and static analysis tooling
summary: PHP-CS-Fixer/PHP_CodeSniffer plus PHPStan/Psalm by default, or what the project has set up

- PHP-CS-Fixer or PHP_CodeSniffer, configured for PSR-12, and PHPStan or Psalm for static analysis —
  the template's usual choice; run whatever the project actually has set up (see `R-code-tools`).

## python
<!-- source: a65faf9791aea834 -->
<!-- todo: translate -->
Coding rules — Python
summary: strict annotations, stdlib-first, data models, module layout, toolchain, tests

Rules for Python 3 with type annotations, a stdlib-first preference and automated linting. Group IDs
(`CR-python-<name>`) are stable and never reassigned; a group whose purpose no longer holds gets a new ID
and is listed as `retired:` in this header.

## CR-python-basics
<!-- source: c03ef771d847127a -->
<!-- todo: translate -->
Established Python defaults
summary: annotations, f-strings, context managers, exception handling, venv, lint

- Annotate every function signature (parameters and return value), including internal/private functions.
- Use f-strings, not `%` formatting or `.format()`.
- Use `with` for anything that must be opened and closed (files, locks, connections).
- Never use a mutable default argument (`def f(x: list = [])`) — default to `None` and initialize inside
  the function body.
- Catch specific exception types; never a bare `except Exception` without re-raising or logging it. Every
  raised or logged error states what failed and with what value — a caller or log reader must find the
  cause without opening the source.
- Use `is`/`is not` only for identity comparisons (`None`, singletons), never for values.
- One virtual environment (`venv`) per project, dependencies pinned in a lockfile (`requirements.txt`,
  `poetry.lock`); never a global install of project dependencies.
- Lint is the stack's standard and belongs in the project; run what is installed, install nothing unasked.

## CR-python-stdlib-first
<!-- source: 690cc47cc736f5d7 -->
<!-- todo: translate -->
Standard library before a new dependency
summary: reach for the stdlib before adding a package

- Prefer the standard library over adding an external dependency; add one only where the stdlib genuinely
  falls short.

## CR-python-data-models
<!-- source: e6059b6a4a744461 -->
<!-- todo: translate -->
Typed data instead of loose dicts
summary: dataclasses, TypedDict or pydantic for structured data

- Model structured data with `dataclasses`, `TypedDict` or `pydantic`, not a loose `dict`.

## CR-python-module-structure
<!-- source: 1892c2da9b9a4c86 -->
<!-- todo: translate -->
One module per responsibility
summary: module boundaries, no circular imports

- One module per functional responsibility, no catch-all module without a clear boundary.
- Resolve circular imports by fixing the module boundaries, not by working around them with deferred or
  local imports.

## CR-python-toolchain
<!-- source: 0f86ea1fa0876228 -->
<!-- todo: translate -->
Lint and format tooling
summary: ruff by default for lint and formatting, or what the project has set up

- `ruff` for both linting and formatting is the template's usual choice; `black` remains a common
  alternative for formatting in existing projects — either way, run what the project actually has
  configured (see `R-code-tools`).

## CR-python-tests
<!-- source: 45c09e28763d538d -->
<!-- todo: translate -->
Unit tests
summary: pytest by default, or the test runner the project has set up

- `pytest` is the template's usual choice, with fixtures instead of repeating setup code in every
  test module; use the test runner the project actually has configured (see `R-code-tools`).

## sql
<!-- source: d78785b1cb6b6a1e -->
<!-- todo: translate -->
Coding rules — SQL
summary: query safety, transactions, indexing, naming, migrations

Rules for schema changes and database access from application code. Group IDs (`CR-sql-<name>`) are
stable and never reassigned; a group whose purpose no longer holds gets a new ID and is listed as
`retired:` in this header.

## CR-sql-basics
<!-- source: 3bc1f5f759d33efc -->
<!-- todo: translate -->
Query safety and schema discipline
summary: parametrized queries, transactions, UTC, indexing, no hidden logic, locking

- Use parametrized queries only — never build a query by concatenating values into the SQL string, in
  any language or driver.
- Never `SELECT *` in application code; name columns explicitly, so a schema change breaks visibly
  instead of silently changing what a query returns.
- Bundle multi-step writes into one transaction; don't reconcile partial failures by hand afterward.
- Store timestamps in UTC; convert to a time zone only in the presentation layer.
- Add an index to every foreign-key column — without one, joins and cascading deletes degrade as the
  table grows.
- Keep application logic out of stored procedures and triggers; logic that isn't visible in the
  application code isn't reviewable.
- Check a column type change on a large table for lock behavior and expected runtime before running it
  live.

## CR-sql-naming
<!-- source: eb7842a7f235e9c5 -->
<!-- todo: translate -->
Identifier naming
summary: snake_case, plural tables, singular columns

- Name tables and columns in `snake_case`.
- Use the plural for table names, the singular for column names.

## CR-sql-migrations
<!-- source: 1555ff10f74b12c8 -->
<!-- todo: translate -->
Migration discipline
summary: versioned naming, idempotent, reversible, one tool

- Name migrations with a version (sequence number or timestamp) plus a description; one file per change.
- Write migrations idempotently (`IF NOT EXISTS` or an existence check) — running an already-migrated
  state again must not fail.
- Ship a down-migration with every migration where the migration tool supports it.
- Use one migration tool consistently (e.g. Flyway, Prisma Migrate, Alembic); don't mix.

## tailwind
<!-- source: 64187d320bfffffa -->
<!-- todo: translate -->
Coding rules — Tailwind
summary: utility-first styling, design tokens, dark mode, class sorting

Rules for Tailwind CSS, usually applied inside a frontend framework. Group IDs (`CR-tailwind-<name>`) are
stable and never reassigned; a group whose purpose no longer holds gets a new ID and is listed as `retired:`
in this header.

## CR-tailwind-basics
<!-- source: 3b4b0dc15b0ff9ae -->
<!-- todo: translate -->
Established Tailwind defaults
summary: utilities in markup, tokens, theme, dark mode, extraction, tooling, pitfalls

- Write utility classes directly in markup; no separate CSS files without a concrete reason.
- Use design tokens (the spacing, color and radius scale from the config) instead of arbitrary values —
  `p-[13px]` only as a documented exception.
- Keep theme changes (colors, fonts, breakpoints) centralized in the Tailwind config, not scattered across
  files.
- Map dark mode through the configured tokens/variants, never parallel hardcoded color values.
- Extract a repeated class combination into a component/partial; never copy it around as a text snippet.
- Lint/format tooling is the stack's standard and belongs in the project: `prettier-plugin-tailwindcss` for
  automatic class sorting (layout, box model, typography, color, state), enforced by the formatter instead
  of sorted by hand. Run what is installed, install nothing unasked.
- Pitfalls:
  - Use `@apply` only in exceptions (e.g. base styles of a third-party component), never as the default way
    to style.
  - Keep `content` paths in the config correct — a wrong or missing path either drops classes that are
    actually used or leaves unused utility classes in the build.

## typescript
<!-- source: c1dd0390eb1f8881 -->
<!-- todo: translate -->
Coding rules — TypeScript
summary: strict mode, no any, typed errors, module structure, tooling

Rules for TypeScript projects in strict mode. Group IDs (`CR-typescript-<name>`) are stable and never
reassigned; a group whose purpose no longer holds gets a new ID and is listed as `retired:` in this
header.

## CR-typescript-basics
<!-- source: 995bd336a8753935 -->
<!-- todo: translate -->
Strict mode, narrowing, typed errors
summary: strict, no any, return types, as/!, error handling, lint

- Enable `strict: true` in `tsconfig.json`; loosen it only with a comment explaining why.
- Never use `any` — type unknown values as `unknown` and narrow them before use.
- Draw the line where strictness stops helping: a type nested deeper than the code it describes
  (heavily nested generics, chained conditional types, stretched mapped types) is worse than a
  simpler one. Fall back to `unknown` with a check at the boundary, or a narrow `interface` for just
  the fields used, with a comment saying why — the exception serves readability, not convenience,
  and `any` stays excluded even here.
- Give exported functions an explicit return type instead of relying on inference.
- Use `as Type` only when narrowing cannot do the job, and say why in a comment.
- Never use the non-null assertion (`!`) — it suppresses a real nullability check.
- Raise errors as typed Error objects, never `throw` an arbitrary value; whatever is thrown, logged
  or rethrown, its message names what failed and with what — a caller must find the cause without
  opening the source.
- Lint and typecheck (`tsc --noEmit`) are the stack's standard and belong in the project; run what is
  installed, install nothing unasked.

## CR-typescript-conventions
<!-- source: 8834a2e54c129055 -->
<!-- todo: translate -->
interface, type, generics
summary: interface for shapes, type for unions, no enums, generics from second use

- Use `interface` for object shapes/contracts, `type` for unions, intersections and derived types.
- Avoid enums — use `as const` objects or union literal types instead.
- Introduce a generic only once a second concrete use exists; a concrete type is fine for the first.

## CR-typescript-module-structure
<!-- source: 71bea2bc6f737512 -->
<!-- todo: translate -->
Central types, explicit exports
summary: shared types in one place, public exports through an index

- Define shared types/schemas in one central place and import them, instead of redeclaring them per
  module.
- Expose a module's public API through an explicit index, not deep import paths into another module.

## CR-typescript-toolchain
<!-- source: 05cf1f3a8aa1903a -->
<!-- todo: translate -->
Lint and format tooling
summary: ESLint with `@typescript-eslint` plus Prettier by default, or what the project has set up

- ESLint with `@typescript-eslint` and Prettier for formatting are the template's usual choice; what
  the project actually has installed and configured governs (see `R-code-tools`).

## vue
<!-- source: 82101ec282385d0b -->
<!-- todo: translate -->
Coding rules — Vue
summary: composition API, typed props, SFC order, shared state, tooling

requires: typescript

Rules for Vue 3 components using the Composition API. Group IDs (`CR-vue-<name>`) are stable and
never reassigned; a group whose purpose no longer holds gets a new ID and is listed as `retired:` in
this header.

## CR-vue-basics
<!-- source: cea36fff796e4b43 -->
<!-- todo: translate -->
Composition API, typed props, safe forms
summary: script setup, typed props/emits, conventions, error handling, pitfalls

- Use `<script setup lang="ts">` in every component; no Options API in new code.
- Type `defineProps<...>()` and `defineEmits<...>()` — no loose object props.
- Keep no business logic in the `<template>` — move computations into `computed` or a method.
- Choose `ref` for primitive/atomic values, `reactive` only for one connected object state.
- Give composables a `useX` name and an explicit return type when it is not trivially inferred.
- Clean up a watcher/effect that binds a resource (timer, listener) once it is no longer needed.
- Catch errors around calls in components and composables on purpose: surface them where the
  template can show them, or rethrow — never swallow one silently; the message names what failed
  and with what. Use `onErrorCaptured` to handle a child component's error deliberately, not as a
  global catch-all.
- Lint is the stack's standard and belongs in the project; run what is installed, install nothing
  unasked.
- Pitfalls:
  - Never combine `v-if` and `v-for` on the same element.
  - Never mutate a prop directly — report a change to the parent through an event.
  - **Security:** a form using `@submit.prevent` also needs `method="post"` on the `<form>` element.
    The handler only exists once hydration finishes; a submit before that point (a password manager
    pressing enter, a slow connection, a blocked JS bundle) triggers the browser's native submit.
    Without `method` that is a GET to the current URL — a form carrying credentials puts the values
    in the address bar, browser history and server log. Applies to every server-rendered app, not
    only auth forms (see GHSA-gj2h-2fpw-fhv9, the same bug in `@nuxt/ui` before 4.8.1).

## CR-vue-sfc-order
<!-- source: ef8ad68cef09f408 -->
<!-- todo: translate -->
Fixed SFC block order
summary: template, script setup, style

- Order SFC blocks as `<template>`, `<script setup>`, `<style>`.

## CR-vue-state-store
<!-- source: aae2a239ebd6cd85 -->
<!-- todo: translate -->
Store module for shared state
summary: Pinia store instead of provide/inject

- Keep state shared across the app in a dedicated store module (Pinia), not in `provide`/`inject`.

## CR-vue-toolchain
<!-- source: 01c4f76f6cb4b091 -->
<!-- todo: translate -->
Lint and format tooling
summary: ESLint with eslint-plugin-vue plus Prettier by default, or what the project has set up

- ESLint with `eslint-plugin-vue` and Prettier for formatting are the template's usual choice; what
  the project actually has installed and configured governs (see `R-code-tools`).

## _intro
<!-- source: 2ca805618d3642f7 -->
<!-- todo: translate -->
A project switches a set on in `docs/project/coding_rules.md`; group IDs `CR-<set>-<name>` are stable.
