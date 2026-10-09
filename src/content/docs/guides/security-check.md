---
title: The security check
description: What the security check looks for before a commit - dangerous patterns, vulnerable dependencies, the deep check - and what each security-check value runs.
sidebar:
  order: 2
---

The security check is set with one key, `security-check`, in the Checks table of `docs/ai/config.md`. Unlike the other checks it does not take `block`, `warn` or `off`; it takes a level.

| Value | Runs |
| :--- | :--- |
| `off` | nothing |
| `local` (default) | the dangerous-pattern scan |
| `deps` | the pattern scan plus the dependency lookup |
| `full` | both, plus the deep check on request and before a release |

## Dangerous patterns (all levels but `off`)

On `git commit`, the added lines are scanned for constructs such as `eval`/`exec`, `shell=True`, `pickle.loads`, `yaml.load` without a safe loader, `v-html`, `innerHTML =` and SQL built by string concatenation. Only coding rule sets you have switched on in `docs/project/coding_rules.md` are scanned for.

- A hit stops the commit **once** per file and pattern, with its location. Fix it, or commit again to let it through.
- A line carrying `act:allow-danger` is exempt.
- Documentation (`.md`, `.txt`, `.rst`) and everything under `.act/` are never scanned.

This is separate from `secret-scan`, a regular `block`/`warn`/`off` check that stops a commit whose staged diff holds a key, token, private key, `.env` file or high-entropy assignment. It also catches a credential in a URL query string, a single-quoted key (`{'token': '...'}`), a PHP array entry (`'token' => '...'`), a literal fallback after an environment lookup (`os.environ.get("API_TOKEN", "...")`, `process.env.API_TOKEN || "..."`) and a credential pair inside a quoted value. A line carrying `act:allow-secret` is exempt.

## Dependency gaps (`deps`, `full`)

A live lookup of known vulnerabilities in your dependencies. It uses `osv-scanner` if installed, otherwise `npm audit`, `composer audit` or `pip-audit` for the matching ecosystem. Lock files and requirement files it reads include `package-lock.json`, `composer.lock`, `requirements.txt`, `go.mod` and `Cargo.lock`.

- **On commit**: for exactly the lock files that commit touches. The scan runs in the background; if it has not finished, the commit is denied once with "dependency scan running", and the retry reads the result, which is cached for the day.
- **After `git merge`, `git pull` or `git cherry-pick`**: the lock files the command brought in are checked right after it. Nothing is held up; a finding lands in the inbox as one report, once per lock-file state and day.
- **At session start**: once a day over every lock file in the project, reported as one line.
- **What holds a commit**: an unaccepted finding of severity high or critical, naming package, version, advisory id, severity and fixed version. A lower or unknown severity only notes. `pip-audit` reports no severity, so its findings only note.
- **Accepting a finding**: add a line `- <advisory-id>: <reason>` to `docs/ai/local/security-accepted.md`, one per line; `#` comments and blank lines are ignored.
- **Failures never block**: a missing tool is noted once per machine with its install command; a network or tool failure is noted every time and the commit goes through.

## The deep check (`full`)

`python .act/scripts/security_deep.py [--since <ref> | --all]` runs Semgrep with open rule sets over the files changed since the latest tag (or the whole tree with `--all`). It runs only on request and before a release (`act-release`), never on every commit, and with a level other than `full` it prints one line and does nothing unless you pass `--force`. The release skill adds a security pass by the `reviewer` role.

## Which level to choose

`local` costs nothing and needs no tool. Switch to `deps` when the project has lock files and you want known-vulnerability findings before they ship; `full` before releases. See the [configuration reference](/agentic-coding-template-docs/reference/configuration/) for the exact row and [Configuration](/agentic-coding-template-docs/concepts/configuration/) for how checks work in general.
