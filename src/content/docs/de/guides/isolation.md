---
title: Isolation
description: Drei Stufen der Isolation als Empfehlung - Standard, isoliert, lokal - mit Schalter je Werkzeug, Grenzen und dem Zusatz der Template-Prüfungen.
sidebar:
  order: 5
sourceHash: f34a6e061552c1351e65485cabfadf0bceb298496677f8b094665690630d1325
---

Diese Seite ist eine Empfehlung, keine Mechanik. Das Template baut keine Sandbox und legt dafür keine Datei in deinem Projekt an. Es verweist auf die Schalter, die die Werkzeuge selbst bieten. Diese Werkzeuge ändern sich oft; darum trägt jede Aussage unten das Datum ihrer Prüfung (**geprüft 2026-11-06**) und einen Link auf die Seite des Herstellers statt einer abgeschriebenen Liste. Lies die Quelle, bevor du dich auf eine Einstellung verlassen.

## Zuerst die Grenzen

- **Die Prüfungen des Templates sind Leitplanken gegen Versehen, keine Sandbox.** Sie fangen ein unachtsames Lesen oder Schreiben ab; einen Agenten, oder einen in seinen Prompt eingeschleusten Text, der sie umgehen will, halten sie nicht auf.
- **Die Sandbox von Claude Code deckt nur Shell-Befehle ab.** Laut [Sandbox-Seite von Anthropic](https://code.claude.com/docs/en/sandboxing) unterliegen Read, Edit, Write, WebFetch und WebSearch allein den Permission-Regeln: Ein `denyRead`-Eintrag hält das Read-Werkzeug nicht auf, und `allowedDomains` begrenzt WebFetch nicht. Auch Command-Hooks, lokale MCP-Server, LSP-Server, die Statuszeile und `apiKeyHelper` laufen außerhalb. Den ganzen Prozess zu isolieren verlangt die Sandbox-Runtime, einen Container oder eine VM ([Übersicht](https://code.claude.com/docs/en/sandbox-environments)).
- **Die Sandbox ist standardmäßig aus,** und Shell-Befehle können standardmäßig den größten Teil des Rechners lesen, auch `~/.ssh` und `~/.aws/credentials`, solange du das nicht verbietest. Fehlen Plattform oder Abhängigkeiten, läuft Claude Code ohne Sandbox weiter, ohne anzuhalten, außer `sandbox.failIfUnavailable` ist `true`.
- **Windows nativ:** Claude Code hat dort keine Sandbox und führt Befehle ohne Sandbox aus. Anthropic nennt einen Container, eine VM oder die Bash-Sandbox in WSL2. Von den Werkzeugen unten haben nur Claude Code und Cursor keine native Windows-Sandbox; Cursor startet seine Linux-Sandbox in WSL2.
- **Lokale Modelle:** Anthropic beschreibt `ANTHROPIC_BASE_URL` für Gateways, unterstützt es aber nicht, Claude Code über ein Gateway auf Nicht-Claude-Modelle zu leiten ([Quelle](https://code.claude.com/docs/en/llm-gateway)). Eine ganz lokale Stufe braucht deshalb ein anderes Werkzeug. Welche Werkzeuge lokale Modelle ausführen, wurde **nicht geprüft**.
- **Isolation ändert nicht, was ans Modell gesendet wird,** und jedes erlaubte Netzziel kann bekommen, was der Agent gelesen hat.

## Drei Stufen

| Stufe | Modell | Netz | Wo es läuft |
| :--- | :--- | :--- | :--- |
| Standard | Cloud | offen | dein Entwicklerrechner |
| Isoliert | Cloud | nur zu freigegebenen Zielen | Sandbox, Container oder VM |
| Lokal | lokal | keines | ein Rechner ohne Internet |

### Standard

Der Normalfall: die üblichen Rückfragen des Werkzeugs plus die Prüfungen des Templates weiter unten. Die eigene Sandbox des Werkzeugs für Shell-Befehle einzuschalten ist ein günstiger erster Schritt. Nur die Sandbox von Claude Code setzt Claude Code selbst durch; ein eingecheckter Dev Container ist eine Konvention, keine erzwungene Grenze ([Quelle](https://code.claude.com/docs/en/sandbox-environments)).

### Isoliert

Cloud-Modell, Netz nur zu Zielen, die du nennst. Der Schalter je Werkzeug, alle geprüft 2026-11-06:

| Werkzeug | Schalter | Quelle |
| :--- | :--- | :--- |
| Claude Code | `/sandbox` oder `sandbox.enabled`, Domains in `sandbox.network.allowedDomains` (nur Shell-Befehle, WebFetch und MCP sind nicht begrenzt); ein Befehl kann über `dangerouslyDisableSandbox` ohne Sandbox wiederholt werden, geschlossen mit `sandbox.allowUnsandboxedCommands: false`; für den ganzen Prozess der Referenz-Dev-Container mit seinem Firewall-Script, die Sandbox-Runtime (Beta, Research Preview), ein Container oder eine VM. Sitzungen mit `--dangerously-skip-permissions` immer in einem Container, einer VM oder der Sandbox-Runtime ausführen. | [Sandboxing](https://code.claude.com/docs/en/sandboxing), [Umgebungen](https://code.claude.com/docs/en/sandbox-environments), [Dev Container](https://code.claude.com/docs/en/devcontainer) |
| OpenAI Codex CLI | `sandbox_mode` (`read-only`, `workspace-write`, `danger-full-access`); das Netz ist standardmäßig aus und wird in den Sandbox-Einstellungen eingeschaltet; Domain-Regeln sind ein Beta-Profil. Ob MCP-Server in der Sandbox laufen: nicht geprüft. | [Security](https://learn.chatgpt.com/docs/agent-approvals-security), [Sandboxing](https://learn.chatgpt.com/docs/sandboxing) |
| Gemini CLI | Opt-in: `--sandbox`, `GEMINI_SANDBOX` oder `tools.sandbox`; Backends sind unter anderem Seatbelt, Docker, Podman, gVisor und Windows nativ. Ob die Sandbox mit `--yolo` standardmäßig an ist: nicht geprüft, die Konfigurationsseite lesen. | [Sandbox](https://geminicli.com/docs/cli/sandbox/), [Konfiguration](https://github.com/google-gemini/gemini-cli/blob/main/docs/reference/configuration.md) |
| GitHub Copilot | Cloud-Agent: eine Firewall, standardmäßig an, mit eigener Allowlist in den Repository-Einstellungen; sie deckt das Bash-Werkzeug des Agenten ab, nicht MCP-Server oder Setup-Schritte. CLI: lokale Sandbox, standardmäßig aus (`/sandbox enable`); ausgehendes Internet ist dort standardmäßig an. Eine Domain-Allowlist für die CLI: nicht geprüft. | [Firewall](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-firewall), [Lokale Sandbox](https://docs.github.com/en/copilot/how-tos/cloud-and-local-sandboxes/using-local-sandboxing) |
| Cursor | Sandbox für Terminal-Befehle, Netz standardmäßig gesperrt und in `sandbox.json` gesetzt. Ob Dateiänderungen und MCP in der Sandbox laufen: nicht geprüft. Der Standardmodus Auto-review ist laut Cursor keine Sicherheitsgrenze. | [Run Modes](https://cursor.com/docs/agent/security/run-modes), [Sandbox](https://cursor.com/docs/reference/sandbox) |

Ein Dev Container ist nur so dicht wie seine Einstellungen. Anthropic warnt: Mit `--dangerously-skip-permissions` hindert der Referenz-Container ein bösartiges Projekt nicht daran, Inhalte nach außen zu schaffen, die in ihm liegen, auch die Zugangsdaten in `~/.claude`; nur für vertrauenswürdige Repositories verwenden und weder `~/.ssh` noch Cloud-Zugangsdaten einbinden. Änderungen im Workspace erreichen den Host über den Bind Mount.

### Lokal

Kein Internet, lokales Modell. Claude Code scheidet hier aus (siehe die Grenzen). Die Seiten oben wurden nicht auf Unterstützung lokaler Modelle geprüft, diese Stufe ist daher für jedes Werkzeug **nicht geprüft**; in der Dokumentation des Werkzeugs nachsehen, ob es einen lokalen Provider gibt. Den Rechner trennst du selbst vom Netz, etwa mit einer Firewall oder einem Container ohne Netz.

## Was die Prüfungen des Templates zusätzlich geben

`secret-read`, `outside-root`, `git-metadata-guard` und der Write Scope des Workers wirken innerhalb der Sitzung, nur in Claude Code (die anderen Werkzeuge haben keine Hooks, Gemini CLI bekommt nur die Skills; siehe die [Einführung](/agentic-coding-template-docs/de/start/introduction/)): Sie sperren das Lesen einer Geheimnis-Datei, ein Lesen oder Schreiben außerhalb des Projekts und seiner erlaubten Orte, ein Schreiben in Git-Hooks und Repository-Konfiguration und ein Schreiben eines Workers außerhalb seines Auftrags. `outside-root` und `secret-read` prüfen auch die Pfade, die die bekannten Lese-Werkzeuge des IDE-Servers nehmen. Ein Ort außerhalb des Projekts ist nur als Eintrag in `outside-root-allow` erlaubt; ein absoluter Eintrag außerhalb von Projekt und Home (ein Browser- oder SDK-Ordner) ist nur lesbar, ein `file:`-Eintrag wird ignoriert. `protected-watch` prüft zusätzlich im Nachhinein: Nach jedem Tool-Aufruf vergleicht es die Dateien, die `R-safe-git-metadata` schützt (Git-Hooks, die Schlüssel von `.git/config`, die Code starten, Claude-Einstellungen, Agents und Skills, `.mcp.json`, `.envrc`, Dev Container und Editor-Tasks), mit einem Schnappschuss vom Sitzungsstart, auf welchem Weg sie sich auch geändert haben, eine Script-Datei eingeschlossen. Eine Änderung eines Workers wird zurückgesetzt und unter `.act-local/protected-watch/kept/` aufbewahrt; eine des Orchestrators wird nur gemeldet. Es verhindert nichts, da es nach dem Aufruf meldet ([Prüfungen](/agentic-coding-template-docs/de/reference/configuration/#checks)). Es sind Leitplanken gegen Versehen; keine ersetzt die Isolation einer Stufe, und ihre Grenzen stehen in [Konfiguration](/agentic-coding-template-docs/de/concepts/configuration/) und in den Regeln, zu denen sie gehören.
