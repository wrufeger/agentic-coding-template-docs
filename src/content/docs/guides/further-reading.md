---
title: Further reading
description: "Checked links on agentic coding: background, getting started, tools, standards, news and limits, each with an assessment and check date."
sidebar:
  order: 7
---

Sources outside the template that help you work with coding agents: what the approach is, how to start, the tools and standards it builds on, where news appears, and where its limits lie. Each entry says in our own words what you find there, who it suits and where it falls short, followed by the language of the source and the date the link was last checked. The template has no ties to any of them.

`npm run check:links` in the docs repository checks every link on this page for reachability and redirects. An assessment is rewritten when its link fails, and at the latest six months after its check date.

## What agentic coding is

- [Building effective agents](https://www.anthropic.com/research/building-effective-agents) (Anthropic): The reference text on workflow patterns such as prompt chaining, routing and orchestrator-workers versus autonomous agents, cited by many later guides. Written for people who build agents rather than use them, and from December 2024: the page itself says the tooling it describes has changed since. *English, checked 2026-11-01*
- [What is agentic coding?](https://cloud.google.com/discover/what-is-agentic-coding) (Google Cloud): A short explainer that sets coding agents apart from code completion and "vibe coding", with a section on securing agent workflows. Good for a first definition; the second half advertises Google's own agent tools. *English, checked 2026-11-01*
- [Agentic engineering patterns](https://simonwillison.net/guides/agentic-engineering-patterns/) (Simon Willison): A growing guide by an independent developer, in chapters on principles, working with agents, testing, understanding code and annotated real prompts. Practical and frank about anti-patterns; the chapters carry no update date, so you cannot tell how current each one is. *English, checked 2026-11-01*
- [Between speed and sustainability: AI agents in software development](https://www.heise.de/en/background/Between-Speed-and-Sustainability-AI-Agents-in-Software-Development-11098799.html) (heise online, December 2025): Background by two consultants on where agents fall short on non-functional requirements (performance, security, architecture conventions) and how technical debt piles up as a result. Worth it for team leads weighing speed against upkeep; behind the heise+ paywall. *English, translated from German, checked 2026-11-01*

## Getting started

If you have so far only asked an assistant questions in a chat, start with the first two entries: they explain what changes when it acts on its own.

- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works): Explains the agentic loop: the assistant gathers context, acts through tools, checks the result and goes round again, and what it can reach along the way. The clearest short answer to "what is different from a chat"; specific to Claude Code. *English, checked 2026-11-01*
- [Build with AI in VS Code](https://code.visualstudio.com/docs/agents/overview): Overview of the levels in one editor, from inline suggestions through the chat to agents that change code and run checks. Shows the step from asking to delegating; it mostly links on and leaves that difference implicit. *English, checked 2026-11-01*
- [Claude Code quickstart](https://code.claude.com/docs/en/quickstart): Install, sign in, first questions about a codebase, a first change and Git, step by step. For the first hour with Claude Code; needs a paid Claude plan or an API account. *English, checked 2026-11-01*
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices): The vendor's advice: give the assistant a check it can run, write specific prompts, keep `CLAUDE.md` short, and enforce the rules that allow no exception mechanically. Much of the template rests on the same ideas; the page is tied to Claude Code's features. *English, checked 2026-11-01*
- [Best practices for using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices): Short official page on Copilot's strengths and weaknesses, choosing the right Copilot tool, writing prompts and checking the output. Good orientation for Copilot users; general, with little on agent work. *English, checked 2026-11-01*
- [Cursor quickstart](https://cursor.com/docs/get-started/quickstart): From installing Cursor to a first reviewed change: sign in, let the agent explain the codebase, make a small edit. A brief start for Cursor users; vendor material without background. *English, checked 2026-11-01*
- [KI-Chat: Agentic Coding](https://www.zdv.uni-mainz.de/ki-chat-agentic-coding/) (computing centre of the University of Mainz): A short introduction with best practices: a clear goal, a plan before acting, version control throughout. Easy reading for newcomers who read German; brief, general and tied to the university's own AI service. *German, checked 2026-11-01*

## Tools and their documentation

Which of these the template supports, and what each one gets, is in [Supported AI tools](/agentic-coding-template-docs/start/introduction/#supported-ai-tools).

- [Claude Code](https://code.claude.com/docs/en/overview): Anthropic's coding agent for terminal, IDE, desktop and browser; the documentation covers setup, settings, hooks, skills and sub-agents. The tool the template supports most fully; needs a paid Claude plan or an API account. *English, checked 2026-11-01*
- [GitHub Copilot](https://docs.github.com/en/copilot): Documentation for Copilot in the editor, on GitHub.com and as a cloud agent that works on issues and pull requests. Very broad, so the article list is hard to find your way through; the best practices above are the better start. *English, checked 2026-11-01*
- [Cursor](https://cursor.com/docs): Documentation of the AI editor: agent, rules, skills, MCP servers, CLI and cloud agents. Well structured; the product changes fast, so third-party guides often no longer match it. *English, checked 2026-11-01*
- [Aider](https://aider.chat/docs/): Open-source pair programming in the terminal that works directly in a local Git repository with many model providers. Lean and transparent; no release since August 2025, so check that it still fits the models you use. *English, checked 2026-11-01*
- [Gemini CLI](https://geminicli.com/docs/): Google's open-source agent for the terminal; the documentation covers install, configuration, tools, extensions and IDE integration. Complete from install to release notes; built around Gemini models. *English, checked 2026-11-01*
- [Codex CLI](https://learn.chatgpt.com/docs/codex/cli): OpenAI's coding agent for terminal and scripts: install, sign-in with a ChatGPT account and a first task; the source is on [GitHub](https://github.com/openai/codex). The documentation has moved to the ChatGPT site, and older links to it now land on its general start page. *English, checked 2026-11-01*
- [Cline](https://docs.cline.bot/): Open-source agent for the editor and as a desktop app that reads files, writes code and runs commands, each step with your approval. Good for staying close to every change; you choose the model provider yourself. *English, checked 2026-11-01*
- [OpenHands](https://docs.openhands.dev/): Open-source platform for coding agents that runs locally, as an SDK with its own agent server, or as a hosted cloud. For teams that want to operate agents themselves; more setup than an editor extension. *English, checked 2026-11-01*
- [Amp](https://ampcode.com/docs): Coding agent on the web, in a terminal CLI and in mobile apps, whose agents run on cloud machines and use a different model per kind of task. For working with agents away from your own machine; pricing is on a separate page, and your code is processed in the vendor's cloud. *English, checked 2026-11-01*
- [Devin](https://docs.devin.ai/): Hosted "AI software engineer" that works on tickets in its own cloud environment and opens pull requests. Aimed at teams with a backlog of well-defined tasks; commercial, and your code runs on the vendor's machines. *English, checked 2026-11-01*

Roo Code was shut down on 15 May 2026; older guides still mention it. Its repository is archived and points to Cline, from which it was forked, and to a community fork.

## Standards

- [Model Context Protocol](https://modelcontextprotocol.io/): Open protocol that connects assistants to tools and data sources through servers; the site holds the specification, the SDKs and guides for building servers and clients. The reference for MCP; every server widens what an agent can reach, so treat each one like a dependency. *English, checked 2026-11-01*
- [AGENTS.md](https://agents.md/): Open, vendor-neutral convention for one rules file that coding agents read, "a README for agents", with examples; history and discussion in its [repository](https://github.com/agentsmd/agents.md). Short and practical; a convention rather than a specification, so each tool reads it in its own way. The template writes an `AGENTS.md` into every project. *English, checked 2026-11-01*
- [Agent Skills](https://agentskills.io/): Open format for skills: a folder with a `SKILL.md` plus optional scripts and references, loaded only when a task needs it. Specification and quickstart for skill authors and tool makers; the template's skills follow this format. *English, checked 2026-11-01*

## Ways of working and guides

- [Agentic Coding Handbook](https://tweag.github.io/agentic-coding-handbook/) (Tweag): A good start for people: it explains ways of working such as planning before prompting, spec-first work and validation loops, each with its reasons, an example prompt and its pitfalls. It covers the human side, not mechanics such as hooks or checks, and the "45 % faster" figure on its front page comes without method or data. *English, checked 2026-11-01*
- [Writing and reviewing agent skills: common pitfalls](https://smcleod.net/2026/07/writing-and-reviewing-agent-skills-common-pitfalls/) (Sam McLeod, 4 July 2026): For authors of their own skills, five pitfalls from many reviews: a description that summarises instead of naming the trigger, no progressive disclosure, leaving a script's job to the model, too much content (cut a line and ask whether the agent would behave differently), and multi-step workflows without numbered steps. Short and concrete; one practitioner's view. *English, checked 2026-11-01*
- [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) (Anthropic, September 2025): Why an agent's context is a limited budget and how to spend it: concise instructions, tools with clear boundaries, retrieval on demand, compaction and notes for long tasks. Background for anyone who writes rules or skills; written from the side of those who build agents. *English, checked 2026-11-01*

## News and changelogs

Changelogs age fastest, which is why they are here.

- [Claude Code changelog](https://code.claude.com/docs/en/changelog): Release notes for every version, often several a week. Complete and precise; a list of changes, not an introduction to the features. *English, checked 2026-11-01*
- [GitHub changelog: Copilot](https://github.blog/changelog/label/copilot/): Every Copilot release and improvement, often several a day. Complete but unweighted; the volume makes it a place to look things up rather than to read. *English, checked 2026-11-01*
- [Cursor changelog](https://cursor.com/changelog): Feature releases with short descriptions and pictures. Easy to read; written in the vendor's promotional tone. *English, checked 2026-11-01*
- [Codex releases](https://github.com/openai/codex/releases): Release notes of the open-source Codex CLI on GitHub. Precise but terse, and crowded with alpha builds. *English, checked 2026-11-01*
- [Latent Space](https://latent.space/): Newsletter and podcast for engineers who build with AI, with interviews and analysis rather than announcements. Covers the whole AI industry; coding agents are only one topic. *English, checked 2026-11-01*
- [Hacker News](https://news.ycombinator.com/): Discussion forum where new tools and studies show up early, often with sharp criticism in the comments. Unfiltered and noisy; an early signal, not a source. *English, checked 2026-11-01*

## Criticism and limits

This section belongs here: knowing the limits makes you delegate better.

- [METR: early-2025 AI and experienced open-source developers](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/): Randomized trial with 16 developers on 246 issues in their own repositories: with AI tools they took 19 % longer, while believing they were faster. The [update of February 2026](https://metr.org/blog/2026-02-24-uplift-update/) finds a possible speed-up with newer tools but calls its own evidence weak, partly because developers increasingly refused to work without AI. *English, checked 2026-11-01*
- [GitClear: The maintainability gap](https://www.gitclear.com/the_ai_code_quality_maintainability_gap): Analysis of 623 million code changes from 2023 to 2026: duplicated blocks rise while refactoring and reuse fall as more code is written by AI. Useful figures for a team discussion; GitClear sells code analytics, and the full paper sits behind a contact form. *English, checked 2026-11-01*
- [OWASP: LLM01 prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): The reference entry on the most important attack path: direct and indirect injection, example scenarios and countermeasures. For anyone who lets an agent read foreign content; written for LLM applications in general, not for coding agents in particular. *English, checked 2026-11-01*
- ["Your AI, My Shell": prompt injection attacks on agentic AI coding editors](https://arxiv.org/abs/2509.22040) (arXiv): Research paper that tested 314 injected instructions against GitHub Copilot and Cursor and got malicious commands executed in up to 84 % of cases. Shows concretely why foreign content must stay data; academic, and the tools tested have changed since 2025. *English, checked 2026-11-01*
- [The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) (Simon Willison, June 2025): Short essay: an agent that has private data, reads untrusted content and can communicate outward can be made to leak that data, and no prompt reliably prevents it. The clearest rule of thumb for deciding what to give an agent access to; it names the risk, not a complete defence. *English, checked 2026-11-01*
- [caveman: Honest numbers](https://github.com/JuliusBrussee/caveman/blob/main/docs/HONEST-NUMBERS.md): caveman is a skill and local proxy that shortens the answers and tool output of coding agents. Worth reading above all for this page: shorter answers save little in agent sessions, the lever is the input. Before installing, check: the CLI sends usage telemetry by default, and its cloud mode sends your prompts with the attached context to the vendor, who may keep them on the free plan. *English, checked 2026-11-01*
- [OmniRoute](https://github.com/cheaper-inference/OmniRoute): **A warning, not a recommendation.** A local AI gateway that routes requests across many providers with automatic fallback; it carries a stealth layer against Claude Code's client identification and uses web sessions and pooled subscription accounts as a "free" API, which can breach the providers' terms and get your main account blocked. Every prompt passes through third parties, and on fallback a different model answers without you noticing; never use it for company or customer code. *English, checked 2026-11-01*

## Related projects

- [reginaldosilva27/agentic-coding-template](https://github.com/reginaldosilva27/agentic-coding-template): A different project with the same name: a light starting point for Claude Code, Codex and Antigravity that you copy once, spec first (SDD) and test first (TDD), with no enforcement and no updates. If that is what you need, go there; this template is a working layer that keeps running, enforces its rules through hooks and carries the working state across sessions and updates. No changes since 23 June 2026 apart from automated dependency updates. *English, checked 2026-11-01*
