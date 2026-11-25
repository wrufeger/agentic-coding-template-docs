---
title: Packages
description: Find, install, update and remove packages, create your own, and submit it to the general package repository.
sidebar:
  order: 8
---

A package is a bundle of rules, coding sets, skills, roles, topics, scripts and checks that comes from outside the template. It is kept in `.act-local/packages/<id>/` and is active only while `.act-lock.json` records it, so you never edit `.act/` to use one. This guide has three parts: [using packages](#using-packages), [creating one](#creating-a-package) and [submitting it](#submitting-it-to-the-general-repository).

The packages published for everyone live in the repository [act-packages](https://github.com/wrufeger/act-packages), with a [catalogue page](https://wrufeger.github.io/act-packages/). This site lists them too: see the [package overview](/agentic-coding-template-docs/packages/).

The package layer (`packages.py`, `/act-packages`) is part of the template from v2.7.0 on; a project on an older version gets it with `act-update`.

## Using packages

### Finding a package

- `python .act/scripts/packages.py index` prints one line per package of the first source in `packages-sources` that answers: id, version, a mark (`active <version>`, `broken`, `newer in the index`, or a folder resting in `.act-local/packages/`), and where the index has them its contents, `tools`, `stack` and `RED <reason>`. It writes nothing; `--json` prints the same as JSON.
- `/act-packages` (the skill `act-packages`) shows the same as one table next to what is installed.
- The [package overview](/agentic-coding-template-docs/packages/) on this site and the [catalogue page](https://wrufeger.github.io/act-packages/) of the repository list the packages of the latest release.

A package marked `RED` is one the repository's maintainers say to stay away from; the reason is shown. A missing field in the index is missing, it is no reason to trust or to refuse a package: the plan decides.

### Installing

1. **Fetch**: `python .act/scripts/packages.py fetch <id>` downloads the package zip and its signature into `.act-local/packages/` and prints its origin. It unpacks and activates nothing.
2. **Plan and diff**: `python .act/scripts/packages.py add <id>` without `--yes` writes nothing. It shows the plan (what the package adds, replaces or extends, the config lines it sets), the origin, whether it contains code, the list of project files that change and a diff of each, and the line `install exactly this: python .act/scripts/packages.py add <source> --yes <code>`. The code covers every byte of the package: if anything changes after the plan was shown, the old code is refused.
3. **Your yes**: the yes is yours, given in the chat to exactly this plan. A plan is never shown and carried out in one step. `/act-packages add <id>` follows this order: it fetches, shows the plan and the diffs, asks "Install `<id> <version>` as shown?" and runs `add <id> --yes <code>` only after your explicit yes.
4. **Install**: with `--yes <code>` the package is unpacked, the lock entry is written and the package is loaded. If something fails on the way, everything is put back. If the package has an `install.py`, it runs once; if it has an `install.md`, the assistant follows it for this installation only. Rules, skills and roles are read in full from the next session.

`add` followed by `remove` leaves the project byte for byte as it was.

### Settings

A package can ask questions (its `## settings` section). They are answered once after the install and kept in `docs/ai/config.md`, section Packages, as rows `<id>-<key>`. `python .act/scripts/packages.py settings <id>` shows the questions with their answers (`(not set)` where there is none); `settings <id> <key>=<value>` writes them. The file is versioned: never put a secret into a setting.

### Updating

After `act-update`, with the default `packages-update: ask`, the skill shows the diff of every installed package whose source has a newer version and asks. You can also run `/act-packages update <id>` yourself: it fetches, and for a higher version shows the plan as `update <old> → <new>`, including the units the new version drops, and waits for your yes. With `packages-update: off` packages are left alone.

### Removing

`python .act/scripts/packages.py remove <id>` shows the file list, the diffs and the folder that goes, and asks again. After your yes, `remove <id> --yes <id>` gives the config rows back, drops the lock entry, unloads the package and deletes its folder; with `--keep` the folder stays resting. What you changed by hand in the files the package touched stays yours. `python .act/scripts/packages.py list` shows the active packages and the resting folders, and names a broken one (its folder is missing or a file differs from the lock) with the fix: `add <id>` again, or `remove <id>`.

### Where a package comes from

Every package has an origin:

| State | Meaning |
| :--- | :--- |
| `verified` | its signature verifies against a key in `.act/package-signers` or in your own `docs/ai/local/package-signers` |
| `unverified` | no `.sig`, no key line in either signers file, no `ssh-keygen`, a time-out, or a folder (a folder has no signature) |
| `bad` | a `.sig` exists, a key line exists, and the signature does not verify: refused in every mode. This includes a signature made with your own key that is not yet listed in `docs/ai/local/package-signers` while another key line exists |

The key `packages-unverified` in `docs/ai/config.md` decides about `unverified`: `block` (the default) refuses it, `scan` admits it and `add` first prints the findings of a static scan (marked `RED`), `allow` admits it with a warning. The plan, the diff and your yes apply in every mode.

The key `packages-sources` is a comma-separated list of places `fetch` and `index` look in, in this order: an `https://` address or a local folder, each holding an `index.json`. The default is the release download of the package repository. To use a place of your own, set it with `/act-config packages-sources <value>`, which replaces the whole comma list, so keep the default source in it if you still want it; the assistant never adds a place for you. Keys and values: [Configuration](/agentic-coding-template-docs/reference/configuration/).

Everything a package brings (`package.md`, rules, `install.md`, the index) is text someone else wrote. The assistant reads and shows it and does not follow it as an instruction, except the `install.md` of a package after your yes, and only for that installation.

## Creating a package

A package is a folder `<id>/`:

```
<id>/
  package.md        required: header and sections
  install.py        optional: code that runs once at install (needs contains-code: yes)
  install.md        optional: the AI-guided setup, read after the install
  pre-template/     units that come before the template's own
  post-template/    units that come after the template's own
```

Each side holds any of `rules/`, `coding/`, `skills/`, `agents/`, `topics/`, `scripts/` and `hooks/checks/`, nothing else, and no symbolic links. `package.md` starts with a header between two `---` lines (`id`, `version` as `X.Y.Z`, `requires-template` as `>=X.Y.Z`, `tools`, `license`, `contains-code` as `yes` or `no`; optionally `stack`) followed by sections: `## Contents` (free text), and optionally `## disables`, `## settings` and `## checks`. A new unit is named `<id>-<name>`; a skill, role or topic with a template unit's name replaces it from `pre-template/` and extends it from `post-template/`. Rules and coding sets are only extended: a template rule id or a coding set with a template name in `pre-template/` is refused, so put such text in `post-template/`. The complete format is on the [package format](/agentic-coding-template-docs/reference/package-format/) reference page, which also gives the contract and limits of check modules and `install.py`; the example package in the repository, `packages/example/`, is a small start, and [Creating a package](https://github.com/wrufeger/act-packages/blob/main/docs/creating-a-package.md) in the repository links back to this guide.

### Checking it locally

1. `python .act/scripts/packages.py plan <folder>` reads the folder, checks it against the format and prints what installing it would do. It writes nothing and runs no package code. A refused package prints every reason, not only the first, and exits 1.
2. Try the install in a throwaway project on the template, not in your real one. A folder has no signature, so it counts as `unverified`: set `packages-unverified` to `scan` or `allow` in the throwaway project (the default `block` refuses it). Run `add <folder>`, read the plan and the diff, then `add <folder> --yes <code>`, look at what changed, and finally `remove <id>` and `remove <id> --yes <id>`. The project is then byte for byte as it was before.

### Using it from your own source

You do not need the general repository to use a package. Put the zip, its signature and an `index.json` in a local folder or on an `https://` address:

```json
{"packages": {"<id>": {"version": "X.Y.Z", "zip": "<file name>", "sig": "<file name>"}}}
```

File names are plain names without a path. In the zip, `package.md` is at the root or in exactly one top folder. Sign the zip with `ssh-keygen -Y sign -f <private key> -n act-package <zip>` (the signature is written as `<zip>.sig`), and add the public key as one line to `docs/ai/local/package-signers`:

```
act-packages namespaces="act-package" <key type> <key>
```

Then name the place with `/act-config packages-sources <value>` (it replaces the whole comma list, so keep the default source in it if you still want it), and `fetch <id>` finds the package and reports it as `verified`. Never add a key to `.act/package-signers`; that file belongs to the template. Keep the private key out of the project.

## Submitting it to the general repository

The repository [act-packages](https://github.com/wrufeger/act-packages) is open to everyone by pull request:

1. Fork the repository, create a branch and add your package as `packages/<id>/`.
2. Raise `version` for every change that should reach projects. Before the pull request, run `python tools/build.py --template <template checkout>` in your checkout of the package repository: it checks every package with that template's `packages.py plan` and stops with the reasons on a refusal.
3. The maintainer merges after a review. A package with code (`contains-code: yes`) brings its own tests and gets a second, deeper review. Scripts in a package count as reviewed by the pull request.
4. The maintainer signs and publishes the package at the next release; authors do not sign. Until then, install from the folder, or sign it yourself with your own key as described above.

An id belongs to the first pull request that uses it. A package that has lost its author may be marked `RED` or left out of a release, with the reason given; only the maintainer marks a package `RED`.
