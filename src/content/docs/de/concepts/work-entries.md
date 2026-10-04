---
title: Arbeitseinträge
description: Was in docs/ai/ liegt - Inbox, Aufgaben, Backlog, Journal, Archiv, Ideen, das Board und die Statuszeile.
sidebar:
  order: 3
sourceHash: c73e31090c3397f797cec79824fb4fc606ac7ea906f601aca7644e1b351111d8
---

`docs/ai/` ist das gemeinsame Arbeitsgedächtnis von dir und dem Assistenten. Alles darin ist eine einfache Datei, eine Datei pro Eintrag, versioniert mit dem Projekt. Übersichten wie das Board werden aus diesen Dateien erzeugt und nie von Hand gepflegt.

| Ordner | Enthält | Geschrieben von |
| :--- | :--- | :--- |
| `docs/ai/inbox/` | alles, was auf einen Menschen wartet | dir und dem Assistenten |
| `docs/ai/proposals/` | vorgeschlagene Regeländerungen, die auf eine Entscheidung warten | dem Assistenten |
| `docs/ai/work/tasks/` | offene Aufgaben | dem Assistenten |
| `docs/ai/work/backlog/` | Ideen und Änderungswünsche, die noch nicht gebaut sind | dem Assistenten |
| `docs/ai/work/ledger/` | das Journal, ein Eintrag pro Schritt | dem Assistenten |
| `docs/ai/work/archive/` | erledigte Einträge, aufbewahrt statt gelöscht | dem Assistenten |
| `docs/ai/concept/` | eine Ideen-Datei pro Person | dir |

Worker (Sub-Agenten) schreiben nie in `docs/ai/`; das tut nur der Haupt-Assistent (siehe [Rollen](/agentic-coding-template-docs/de/concepts/roles/)).

## Inbox

Die Inbox ist der eine Ort, an dem etwas auf dich wartet. Jede Datei beginnt mit Kopffeldern (`id`, `kind`, `for`, `status`, `created`) und hat eine von vier Arten:

| `kind` | Id | Was es ist | Statusverlauf |
| :--- | :--- | :--- | :--- |
| `question` | `Q12` | eine Entscheidung oder Frage an dich; du antwortest darunter | `open` → `answered` → `done` |
| `todo` | `U3` | ein Schritt, den nur ein Mensch tun kann, angelegt, sobald er ansteht | `open` → `done` |
| `report` | keine | der schreibgeschützte Bericht eines Werkzeugs, zum Beispiel von `doctor` oder einer Übernahme | `open` → `done` (gelesen) |
| `note` | keine | deine eigene Notiz; der Assistent antwortet darunter | `open` → `answered` → `done` |

Ein Eintrag ohne `kind` zählt als `todo`. Das Feld `for:` sagt, an wen ein Eintrag gerichtet ist: `all` oder die Workspace-Identität einer Person. Ein Eintrag mit `done` wandert ins Archiv, egal welcher Art.

Der Assistent legt Einträge mit `python .act/scripts/entries.py new <kind> <title>` an; die [Script-Referenz](/agentic-coding-template-docs/de/reference/scripts/) listet alle Optionen.

Auf Notizen antwortet der Assistent in einem angehängten Block von höchstens drei Textzeilen, nie innerhalb deiner eigenen Worte. Deine Worte werden nie bearbeitet oder gelöscht, nur darunter kommentiert.

## Aufgaben, Backlog, Journal

- **Aufgaben** (`T7`): eine Datei pro offener Aufgabe mit Ziel und Prüfkriterien. Die erste Arbeitsstand-Zeile (`entries.py state T7 <text>`) oder `entries.py start T7` schreibt `started:` in den Kopf; das Board markiert die Aufgabe dann als laufend. Der aktuelle Arbeitsstand selbst liegt im per gitignore ausgeschlossenen `.act-local/state/`, nicht in der Aufgabendatei. Der Kopf `for:` sagt, wessen Aufgabe es ist; `all` oder kein Feld bedeutet geteilt.
- **Backlog** (`B5`): eine Idee oder ein Änderungswunsch, der noch nicht gebaut ist. Er wird zur Aufgabe, sobald die Arbeit daran beginnt. Mit `inbox-decisions: at-start` kann ein Eintrag bis zum Arbeitsbeginn `decision: open` tragen (siehe [Konfiguration](/agentic-coding-template-docs/de/concepts/configuration/)).
- **Journal**: eine Datei pro Schritt, benannt `YYYY-MM-DD-<slug>.md`. Journal-Einträge bekommen nie eine kurze Id.

## Archiv

Erledigte Aufgaben, Backlog-Einträge, bearbeitete Inbox-Einträge und entschiedene Vorschläge wandern unter ihrem alten Namen nach `docs/ai/work/archive/`, damit die Historie lesbar und die Übersichten erzeugt bleiben. Der Assistent erledigt das, wenn er eine abgenommene Aufgabe abschließt (`act-commit`).

## Ideen-Datei

Jede Person hat ihre eigene Datei `docs/ai/concept/ideas-<identity>.md`, wobei `<identity>` der Kurzname in `.act-local/identity.json` ist. Du schreibst jede Idee als eigenen Abschnitt `## <title>`; nur du schreibst dort Einträge, sodass nie zwei Personen dieselbe Datei bearbeiten. Der nächste Sitzungsstart bemerkt, was neu oder geändert ist, und lässt es bearbeiten:

- Der Assistent antwortet unter dem Eintrag, nur wo etwas von dir gebraucht wird, in höchstens drei Zeilen und höchstens drei Blöcken pro Eintrag.
- Eine Überschrift mit „Entwurf" bekommt nur eine kurze erste Reaktion. Entfernst du das Wort, wird der Eintrag vollständig analysiert.
- Eine Entscheidung, die nur du treffen kannst, wird zur Inbox-Frage.
- Ein bearbeiteter Eintrag wandert wortgetreu in den Backlog-Eintrag oder das Konzept, aus dem er wurde, und verlässt die Datei.

## Board und Statuszeile

Das **Board** ist ein erzeugter Schnappschuss: Branch, jüngste Journal-Einträge, was auf dich wartet, offene Aufgaben, offene Entscheidungen im Backlog und das Backlog selbst. Es wird beim Sitzungsstart neu geschrieben und nach Git-Befehlen, die den ausgecheckten Stand ändern. Wohin es geht, hängt vom Schlüssel `board` ab: `docs` (Standard, `docs/ai/board.md`, per gitignore ausgeschlossen), `shared` (zusätzlich ein versioniertes `docs/ai/board-<identity>.md`, beim Commit geschrieben) oder `local` (unter `.act-local/`). Eine zweite erzeugte Datei, `.act-local/inbox-<identity>.md`, sammelt den vollen Text jedes offenen Eintrags, der an dich gerichtet ist, sodass eine Datei zum Lesen genügt.

Die **Statuszeile** von Claude Code zeigt eine Zeile unter dem Chat, zum Beispiel `act · Q103 Q104 · tasks: 1 running, 4 new`. Offene Fragen und Todos erscheinen mit Id, Berichte und Notizen als Anzahl pro Art. Um sie dauerhaft abzuschalten, setze in `.claude/settings.json` einen eigenen `statusLine`-Befehl; die Vorlage ersetzt nie einen Eintrag, den sie nicht selbst erzeugt hat.

## Solo- und Team-Modus

Der Schlüssel `mode` (`solo` oder `team`) ändert genau eines: wann ein Eintrag seine kurze Id bekommt.

- **`solo`**: Der Assistent vergibt die Id sofort.
- **`team`**: Die Id vergibt nur, wer den Eintrag auf dem Standard-Branch ablegt (`entries.py assign`), sodass zwei Personen nie dieselbe Nummer vergeben. Bis dahin zitierst du den Dateinamen, zum Beispiel `T-<identity>-<YYYYMMDD-HHMM>-<slug>.md`.

Dateinamen, Orte und Formate sind in beiden Fällen gleich, du kannst also jederzeit wechseln; bereits vergebene Ids bleiben. Siehe [Im Team arbeiten](/agentic-coding-template-docs/de/guides/team/).
