---
title: Neues Projekt
description: Ein neues Projekt aus dem Template einrichten, mit dem Assistenten oder von Hand.
sidebar:
  order: 1
sourceHash: 3ab4c029cbd08b78df77167e1e2ff4866e3dc0157bdea079c40b87e5a1cf55ed
---

## Das Template holen

Klone [das Template-Repository](https://github.com/wrufeger/agentic-coding-template) oder nutze auf GitHub
**Use this template**, und öffne den Ordner dann in deinem Assistenten: Claude Code, Codex, GitHub Copilot,
Cursor oder Gemini CLI. Du brauchst Python 3.9 oder neuer; der Assistent prüft das und erklärt die Installation,
falls es fehlt.

## Mit dem Assistenten: `act-setup`

Was auch immer deine erste Nachricht ist, der Assistent startet den Skill `act-setup`. Er prüft, ob Python
vorhanden ist, fragt, wohin das Projekt kommt, zeigt den Plan und führt ihn aus. Zum Beispiel:

```text
Set up a new project right here.
Set up a new project in ../shop-api.
```

Jede Sprache funktioniert. Es gibt zwei Wege:

1. **Genau hier.** Der Klon wird zum Projekt. Der Remote `origin` wird entfernt, wenn er auf das
   Template-Repository zeigt, und das Projekt startet auf einem frischen `main` ohne die Historie des Templates.
   Spätere Updates des Templates kommen nur über
   [`act-update`](/agentic-coding-template-docs/de/getting-started/update/).
2. **Woanders.** Ein leerer oder fehlender Ordner wird direkt mit `--target` eingerichtet. Ein Ordner, der schon
   ein Projekt enthält, geht an [`act-adopt`](/agentic-coding-template-docs/de/getting-started/existing-project/).

Der Assistent führt die Befehle selbst aus. Er hat kein Terminal, in dem er dir Fragen stellen könnte, also
übernimmt `init.py` die Standardwerte und schreibt jeden offenen Punkt (Name, Owner, Stack, Werkzeuge) in die
Inbox. Du gehst diese Notiz mit dem Assistenten durch, und die Antworten kommen in `docs/ai/config.md`.

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
`--no-commit`. Alle Optionen stehen in der [Scripts-Referenz](/agentic-coding-template-docs/de/reference/scripts/).

## Was init tut

Zehn feste Schritte, jeder ausgegeben als `[n/10]`:

1. Sammelt die Einstellungen: Name, Owner, Sprachen, Stack, Befehle, Werkzeuge, Modus, Feedback.
2. Klärt Git: im Klon entfernt es `origin` und baut `main` neu auf; mit `--target` führt es bei Bedarf `git init` aus.
3. Prüft deine Git-Identität.
4. Schreibt deine Workspace-Identität und den lokalen Import-Ordner `.act-local/import/`.
5. Dünnt die Brücken auf die gewählten Werkzeuge aus.
6. Schreibt das Gerüst: `docs/ai/` (`config.md`, `rules.md`, `concept/`, Inbox, Arbeitsordner), `docs/project/coding_rules.md`,
   `docs/README.md`, die Brückendateien, Skill-Kopien und die Hook-Einträge in `.claude/settings.json`.
7. Hängt Blöcke des Templates an `.gitattributes` und `.gitignore` an.
8. Nur im Klon: legt README und LICENSE des Templates still.
9. Schreibt `.act-lock.json` (die festgehaltene Quelle und Version des Templates) und `.act/MANIFEST.json`.
10. Macht den ersten Commit.

`init.py` überschreibt nie eine Datei, die das Projekt schon hat. Eine `language-docs` außer Englisch lässt das
Gerüst auf Englisch und legt eine Inbox-Notiz an, die den Assistenten bittet, es einmal zu übersetzen;
gängige englische Fachbegriffe (Skill, Inbox, Hook, Branch …) bleiben stehen, vor allem in Überschriften.

## Deine erste Sitzung

Öffne das Projekt in deinem Assistenten und sag `continue`. Der Assistent liest das Board und die Inbox. Fang
mit den init-Notizen in `docs/ai/inbox/` an, und probiere dann eine Idee (`Idea: export the orders as CSV`), einen
Fehler (`Bug: login fails with an umlaut`) oder `Which skills are there?`. Die Einstellungen stehen in `docs/ai/config.md`.
