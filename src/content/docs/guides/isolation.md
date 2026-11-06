---
title: Isolation
description: Three levels of isolation as a recommendation - standard, isolated, local - with the switch per tool, the limits of each and what the template's checks add.
sidebar:
  order: 5
---

This page is a recommendation, not a mechanism. The template builds no sandbox and adds no file to your project for this. It points to the switches the tools themselves offer. Those tools change often, so every statement below carries the date it was checked (**checked 2026-11-06**) and a link to the vendor's page instead of a copied list. Read the source before you rely on a setting.

## Limits first

- **The template's checks are guard rails against mistakes, not a sandbox.** They catch a careless read or write; they do not hold back an agent, or text injected into its prompt, that is set on getting around them.
- **Claude Code's sandbox covers shell commands only.** Per [Anthropic's sandboxing page](https://code.claude.com/docs/en/sandboxing), Read, Edit, Write, WebFetch and WebSearch are governed by permission rules alone: a `denyRead` entry does not stop the Read tool, and `allowedDomains` does not limit WebFetch. Command hooks, local MCP servers, LSP servers, the status line and `apiKeyHelper` also run outside it. Isolating the whole process takes the sandbox runtime, a container or a VM ([overview](https://code.claude.com/docs/en/sandbox-environments)).
- **The sandbox is off by default,** and by default shell commands can read most of the machine, `~/.ssh` and `~/.aws/credentials` included, unless you deny it. If the platform or its dependencies are missing, Claude Code runs unsandboxed without stopping, unless `sandbox.failIfUnavailable` is `true`.
- **Native Windows:** Claude Code has no sandbox there and runs commands unsandboxed. Anthropic names a container, a VM, or the Bash sandbox inside WSL2. Of the tools below, only Claude Code and Cursor lack a native Windows sandbox; Cursor runs its Linux sandbox inside WSL2.
- **Local models:** Anthropic documents `ANTHROPIC_BASE_URL` for gateways but does not support routing Claude Code to non-Claude models through any gateway ([source](https://code.claude.com/docs/en/llm-gateway)). A fully local level therefore needs another tool. Which tools run local models was **not verified**.
- **Isolation does not change what is sent to the model,** and any network target you allow can still receive what the agent has read.

## Three levels

| Level | Model | Network | Where it runs |
| :--- | :--- | :--- | :--- |
| Standard | cloud | open | your developer machine |
| Isolated | cloud | only to allowed targets | sandbox, container or VM |
| Local | local | none | a machine with no internet |

### Standard

The default: the tool's normal permission prompts, plus the template's checks below. Switching on the tool's own sandbox for shell commands is a cheap first step. Only the Claude Code sandbox is enforced by Claude Code itself; a committed dev container is a convention, not an enforcement boundary ([source](https://code.claude.com/docs/en/sandbox-environments)).

### Isolated

Cloud model, network limited to targets you name. The switch per tool, all checked 2026-11-06:

| Tool | Switch | Source |
| :--- | :--- | :--- |
| Claude Code | `/sandbox` or `sandbox.enabled`, domains in `sandbox.network.allowedDomains` (shell commands only, WebFetch and MCP are not limited); a command can retry unsandboxed via `dangerouslyDisableSandbox`, closed with `sandbox.allowUnsandboxedCommands: false`; for the whole process the reference dev container with its firewall script, the sandbox runtime (beta research preview), a container or a VM. Always run `--dangerously-skip-permissions` sessions inside a container, a VM or the sandbox runtime. | [sandboxing](https://code.claude.com/docs/en/sandboxing), [environments](https://code.claude.com/docs/en/sandbox-environments), [dev container](https://code.claude.com/docs/en/devcontainer) |
| OpenAI Codex CLI | `sandbox_mode` (`read-only`, `workspace-write`, `danger-full-access`); network is off by default and is enabled in the sandbox settings; domain rules are a beta profile. Whether MCP servers run sandboxed: not verified. | [security](https://learn.chatgpt.com/docs/agent-approvals-security), [sandboxing](https://learn.chatgpt.com/docs/sandboxing) |
| Gemini CLI | opt-in: `--sandbox`, `GEMINI_SANDBOX` or `tools.sandbox`; backends include Seatbelt, Docker, Podman, gVisor and Windows native. Whether the sandbox is on by default with `--yolo`: not verified, read the configuration page. | [sandbox](https://geminicli.com/docs/cli/sandbox/), [configuration](https://github.com/google-gemini/gemini-cli/blob/main/docs/reference/configuration.md) |
| GitHub Copilot | cloud agent: a firewall, on by default, with a custom allowlist in the repository settings; it covers the agent's Bash tool, not MCP servers or setup steps. CLI: local sandbox, off by default (`/sandbox enable`); outbound internet is on by default there. A domain allowlist for the CLI: not verified. | [firewall](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-firewall), [local sandboxing](https://docs.github.com/en/copilot/how-tos/cloud-and-local-sandboxes/using-local-sandboxing) |
| Cursor | sandbox for terminal commands, network denied by default and set in `sandbox.json`. Whether file edits and MCP are sandboxed: not verified. The default Auto-review mode is, in Cursor's words, not a security boundary. | [run modes](https://cursor.com/docs/agent/security/run-modes), [sandbox](https://cursor.com/docs/reference/sandbox) |

A dev container is only as tight as its settings. Anthropic warns that with `--dangerously-skip-permissions` the reference container does not stop a malicious project from exfiltrating what is inside it, including the credentials in `~/.claude`; use it for trusted repositories only and do not mount `~/.ssh` or cloud credentials. Workspace edits reach the host through the bind mount.

### Local

No internet, local model. Claude Code is not an option here (see the limits). The pages above were not checked for local-model support, so this level is **not verified** for every tool; check the tool's own documentation for a local provider, and cut the machine off from the network yourself, for instance with a firewall or a network-less container.

## What the template's checks add

`secret-read`, `outside-root`, `git-metadata-guard` and the worker's write scope work inside the session, in Claude Code only (the other tools have no hooks, Gemini CLI gets only the skills; see the [introduction](/agentic-coding-template-docs/start/introduction/)): they refuse a read of a secret file, a read or write outside the project and its allowed places, a write to git hooks and repository config, and a worker's write outside its assignment. They are guard rails against mistakes; none of them replaces a level's isolation, and their limits are in [Configuration](/agentic-coding-template-docs/concepts/configuration/) and the rules they belong to.
