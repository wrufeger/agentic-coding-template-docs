---
title: Neues Projekt
description: Ein neues Projekt aus dem Template einrichten, mit dem Assistenten oder von Hand.
sidebar:
  order: 1
sourceHash: b222c93ae8f28e3f00cfdf90837bc3b42b12c1b48481119f7f79b7fb5702917a
---

## Das Template holen

Klone [das Template-Repository](https://github.com/wrufeger/agentic-coding-template) oder nutze auf GitHub
**Use this template**, und öffne den Ordner dann in deinem Assistenten: Claude Code, Codex, GitHub Copilot,
Cursor oder Gemini CLI. Du brauchst Python 3.9 oder neuer und Git 2.25 oder neuer; der Assistent prüft Python und
erklärt die Installation, falls es fehlt.

## Mit dem Assistenten: `act-setup`

Was auch immer deine erste Nachricht ist, der Assistent startet den Skill `act-setup`. Er prüft, ob Python
vorhanden ist, fragt, wohin das Projekt kommt, zeigt den Plan und führt ihn aus. Zum Beispiel:

```text
start
Erstelle hier im Verzeichnis ein neues Projekt.
Erstelle ein neues Projekt in ../shop-api.
Übernimm mein bestehendes Projekt in ~/dev/shop — es hat schon eine CLAUDE.md und eigene Doku.
```

Jede Sprache funktioniert. Es gibt drei Wege:

1. **Genau hier.** Der Klon wird zum Projekt. Der Remote `origin` wird entfernt, wenn er auf das
   Template-Repository zeigt, und das Projekt startet auf einem frischen `main` ohne die Historie des Templates.
   Spätere Updates des Templates kommen nur über
   [`act-update`](/agentic-coding-template-docs/de/getting-started/update/).
2. **Woanders.** Ein leerer oder fehlender Ordner wird direkt mit `--target` eingerichtet.
3. **Ein bestehendes Projekt.** Ein Ordner, der schon ein Projekt enthält — eigene Doku, eine `CLAUDE.md`, ein
   älteres KI-Setup —, wird mit `act-adopt` übernommen. Der Assistent sichtet jede Quelle für Doku und KI-Werkzeuge,
   schlägt je Quelle eine Aktion vor, wartet, bis du die Tabelle einmal freigibst, und zieht das Material dann auf
   einem Branch `act-adopt` um, ohne es zu committen. Die Schritte stehen unter
   [Bestehendes Projekt](/agentic-coding-template-docs/de/getting-started/existing-project/).

Läuft das Template in einem Projekt schon, startet `/act-adopt` dort das nächste Projekt oder übernimmt von dort aus ein
anderes und kann dessen eigene Skills, Regeln, Ausnahmen, Overrides und Topics mitnehmen (`--carry`); siehe
[Bestehendes Projekt](/agentic-coding-template-docs/de/getting-started/existing-project/#starten). Danach schlägt der
Assistent `act-update` im neuen Projekt vor, denn es hat das `.act/` des Projekts bekommen, aus dem es kam.

Vor dem Lauf fragt der Assistent einmal, ob eine Arbeitsmethode an sein soll (`test-first`, `spec-first`,
`simple-changes`; Standard keine), und gibt die Antwort als `--methods` weiter. Die Zeile `methods` in `docs/ai/config.md`
§ [Scope](/agentic-coding-template-docs/de/reference/configuration/#scope) ändert sie jederzeit.

Der Assistent führt die Befehle selbst aus. Er hat kein Terminal, in dem er dir Fragen stellen könnte, also
übernimmt `init.py` die Standardwerte und schreibt jeden offenen Punkt (Name, Owner, Stack, Werkzeuge) in die
Inbox. Du gehst diese Notiz mit dem Assistenten durch, und die Antworten kommen in `docs/ai/config.md`. Ohne Antwort steht `feedback` auf `confirm`: Jede Nachricht an den
Template-Autor wird gezeigt und erst nach deinem Ja gesendet. `off` ist mit einer Änderung in `docs/ai/config.md` gesetzt, ebenso `local`: Es wird nie etwas gesendet, Funde werden zu Backlog-Einträgen im Projekt. `/act-config feedback local` setzt es ohne Modell-Durchlauf; `/act-config` allein listet alle Einstellungen.

## Von Hand: `init.py`

Die Einrichtung braucht keine KI. In einem Terminal fragt `init.py` nach Name, Owner, Stack, Lint- und
Testbefehlen, Werkzeugen und Sprachen:

```bash
python .act/scripts/init.py --plan                    # show what would happen, change nothing
python .act/scripts/init.py                           # turn this clone into the project
python .act/scripts/init.py --target ../my-project    # set up a new, empty folder instead
python .act/scripts/init.py --non-interactive         # no questions: defaults, open points to the inbox
```

Nützliche Optionen: `--language-docs <code>` (Sprache von `docs/`, Standard `en`), `--language-chat <code|auto>`,
`--update-channel <release|latest>` (was `act-update` verfolgt, siehe [Update](/agentic-coding-template-docs/de/getting-started/update/#update-channel); `init` fragt, wenn du es weglässt), `--methods <Namen|none>` (Arbeitsmethoden, die an sein sollen; `init` fragt, wenn du es weglässt), `--carry <Liste>` (mit `--target`, aus einem Projekt gestartet: was von dort mitkommt, Standard alles), `--no-commit`. Alle Optionen stehen in der [Scripts-Referenz](/agentic-coding-template-docs/de/reference/scripts/).

Bei einem **bestehenden Projekt** überschreibt `init.py --target <dir>` nie eine Datei. Es ergänzt `.act/` und alles,
was fehlt, hängt seine eigenen Blöcke an `.gitignore`/`.gitattributes` an, führt seine Hook-Einträge in
`.claude/settings.json` zusammen und lässt jede andere Datei genau so, wie sie ist — auch eine vorhandene
`CLAUDE.md`, der dann noch der Import der Regeln fehlt. Was aus der eigenen Doku und den KI-Dateien des Projekts
werden soll, ist eine Einzelfallentscheidung je Datei, und die braucht einen Assistenten:
[`act-adopt`](/agentic-coding-template-docs/de/getting-started/existing-project/).

## Was init tut

Zehn feste Schritte, jeder ausgegeben als `[n/10]`:

1. Sammelt die Einstellungen: Name, Owner, Sprachen, Stack, Befehle, Werkzeuge, Modus, Feedback, Update-Channel (`release` oder `latest`, geschrieben nach `docs/ai/config.md` § Update), Arbeitsmethoden (`methods`, Standard `none`). Es weist darauf hin, wenn der Klon schon über dem neuesten Release liegt.
2. Klärt Git: im Klon entfernt es `origin` und baut `main` neu auf; mit `--target` führt es bei Bedarf `git init` aus.
3. Prüft deine Git-Identität.
4. Schreibt deine Workspace-Identität (auch wenn `.act-local/identity.json` existiert, aber `identity` fehlt) und den lokalen Import-Ordner `.act-local/import/`.
5. Dünnt die Brücken auf die gewählten Werkzeuge aus.
6. Schreibt das Gerüst: `docs/ai/` (`config.md`, `rules.md`, `concept/`, Inbox, Arbeitsordner), `docs/project/coding_rules.md`, `docs/project/glossary.md`,
   `docs/project/README.md` (der Index der Projektdoku, eine Zeile je Datei), `docs/ai/local/resources.md`, `docs/README.md`, die Brückendateien, Skill-Kopien und die Hook-Einträge in `.claude/settings.json` (mit `"enableArtifact": false`, außer bei `artifacts: on`, und `PYTHON_BASIC_REPL=1` unter `env`, damit unter Windows ein leeres Heredoc in einem Bash-Aufruf unter Python 3.13 und neuer nicht hängt). Skill-Kopien und Rollen-Brücken, die `profile` oder `exclude` in `docs/ai/config.md` § [Scope](/agentic-coding-template-docs/de/reference/configuration/#scope) auslassen, werden nicht geschrieben.
7. Hängt Blöcke des Templates an `.gitattributes` und `.gitignore` an und hält `.act-local/` aus den Indizes der IDEs heraus (`excludeFolder` in `.idea/*.iml`, `files.watcherExclude` in `.vscode/settings.json`, wo `.vscode/` existiert).
8. Nur im Klon: legt die eigenen Dateien des Templates still: README (die neue folgt dem Layout `readme-format` aus
   [Formats](/agentic-coding-template-docs/de/reference/configuration/#formats), standardmäßig `standard`), `CHANGELOG.md` und die Community-Dateien unter
   `.github/` (Beitragshinweise, Sicherheit, Verhaltenskodex, Barrierefreiheit, Vorlagen für Issues und Pull Requests),
   und fragt, ob seine LICENSE bleibt. Im Klon wie mit `--target` legt es dann das eigene `CHANGELOG.md` des Projekts mit
   einem leeren Abschnitt `## [Unreleased]` an, außer `changelog` in § Formats steht auf `release-notes-only` oder `off`
   oder das Projekt führt schon ein Changelog unter anderem Namen; eine vorhandene Datei wird nie überschrieben.
9. Schreibt `.act-lock.json` (die festgehaltene Quelle und Version des Templates) und `.act/MANIFEST.json`.
10. Macht den ersten Commit.

`init.py` überschreibt nie eine Datei, die das Projekt schon hat. Eine Frage ohne Eingabe nimmt ihren angezeigten Standardwert. Eine `language-docs` außer Englisch lässt das
Gerüst auf Englisch. `act-setup` übersetzt es im selben Lauf; nach einem einfachen `init.py` bittet eine Inbox-Notiz den
Assistenten, es einmal zu übersetzen;
gängige englische Fachbegriffe (Skill, Inbox, Hook, Branch …) bleiben stehen, vor allem in Überschriften.

## Deine erste Sitzung

Öffne das Projekt in deinem Assistenten und sag `weiter`. Der Assistent liest das Board und die Inbox. Fang
mit den init-Notizen in `docs/ai/inbox/` an, und probiere dann eine Idee (`Idee: die Bestellungen als CSV exportieren`),
einen Fehler (`Bug: Login scheitert an einem Umlaut`) oder `Welche Skills gibt es?`. Die Einstellungen stehen in `docs/ai/config.md`.
