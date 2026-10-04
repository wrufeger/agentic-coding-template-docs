---
title: Im Team arbeiten
description: Team-Modus - Ids, die auf dem Standard-Branch vergeben werden, Adressierung mit for:, Dateien pro Person und was wie zu mergen ist.
sidebar:
  order: 4
sourceHash: 9c8b650bee77e44d15c8c01bbcc5d20d674acbc60e23e1e91b3d356c6a94e60c
---

Mehrere Personen können in einem Projekt arbeiten, jede mit eigenen Assistenten-Sitzungen, weil jeder Eintrag eine eigene Datei ist und jede persönliche Ansicht ebenfalls.

## Team-Modus einschalten

Setze `mode: team` im Abschnitt Project von `docs/ai/config.md`. `init` lässt ein Projekt auf `solo`, wenn es nur eine Autorin oder einen Autor sieht. Der Modus ändert genau eines, nämlich wann ein Eintrag seine kurze Id bekommt, und du kannst jederzeit hin- und herwechseln; bereits vergebene Ids bleiben.

## Ids auf dem Standard-Branch

Im Modus `solo` gibt der Assistent einer Aufgabe (`T7`), einem Backlog-Eintrag (`B5`), einer Frage (`Q12`) oder einem Todo (`U3`) seine Id sofort. Würden zwei Personen das auf getrennten Branches tun, vergäben sie dieselbe Nummer; deshalb hat ein Eintrag im Modus `team` nur einen Dateinamen, bis er den Standard-Branch erreicht, zum Beispiel `T-anna-20261004-1030-fix-login.md`. Bis dahin zitierst du den Dateinamen.

`python .act/scripts/entries.py assign` vergibt die fehlenden Ids. Auf einem Feature-Branch ändert es nichts und sagt das. Der Skill `act-commit` führt es beim Abschluss einer Aufgabe aus: Es benennt jede Datei um und meldet `<old> -> <new>`, und du merkst beide Pfade vor, den alten als Löschung, damit ein Klon, der die alte Datei schon hat, sie nicht herumliegen lässt.

## Adressieren mit for:

Einträge und Aufgaben tragen einen Kopf `for:`: `all` für alle, oder eine Workspace-Identität, den Kurznamen in `.act-local/identity.json`. Eine Aufgabe wird für die aktuelle Identität angelegt, sofern du nicht `--for` übergibst; Todos, Berichte und Notizen sind standardmäßig `all`. Das Board listet deine und die geteilten Aufgaben, und mit eingeschaltetem `board-others` (im Team-Modus Standard) einen eigenen Abschnitt für Aufgaben, die anderen Personen zugewiesen sind. Deine Inbox-Ansicht `.act-local/inbox-<identity>.md` sammelt die offenen Einträge, die an dich oder an `all` gerichtet sind.

## Dateien pro Person

| Datei | Wer schreibt | Versioniert |
| :--- | :--- | :--- |
| `docs/ai/concept/ideas-<identity>.md` | nur ihr Eigentümer | ja |
| `docs/ai/board.md` (Standard `board: docs`) | pro Checkout erzeugt | nein, per gitignore ausgeschlossen |
| `docs/ai/board-<identity>.md` (`board: shared`) | von `act-commit` erzeugt | ja |
| `.act-local/**` (Identität, Arbeitsstand, Rückmeldung, Inbox-Ansicht) | pro Rechner | nein |

Mit `board: shared` lässt das versionierte Board jeder Person die anderen offene Aufgaben sehen, ohne einen Arbeitsbaum zu teilen. Die Ideen-Datei einer anderen Person gehört ihr: Lies sie, schreibe in deine eigene.

## Was wie zu mergen ist

- **Eintragsdateien** (Inbox, Aufgaben, Backlog, Journal) sind eine Datei pro Eintrag, sodass zwei Personen selten dieselbe Datei berühren. Das Journal und jeder neue Eintrag tragen einen Zeitstempel `created:`, sodass zwei Branches, die denselben Titel anlegen, nie einen stillen Merge identischer Dateien erzeugen.
- **Erzeugte Dateien** (`CLAUDE.md`, `AGENTS.md`, `docs/ai/rules.md`) sind in `.gitattributes` mit `merge=ours` markiert, ebenso `docs/ai/board-*.md`. Ist kein Merge-Treiber registriert (`git config merge.ours.driver true`), mergt Git normal; der Sitzungsstart leitet eine unveränderte Brücke neu ab, und der nächste Commit schreibt eine Board-Datei neu, sodass eine veraltete nie überlebt.
- **`docs/ai/config.md` und deine eigenen Regeln** sind geteilte Projektentscheidungen; merge sie von Hand wie jede andere Quelldatei.
- **Die Vorlage aktualisieren**: Andere Branches bekommen ein Update nur mit dem Merge. Ein Update auf einem Branch, der nicht der Standard-Branch ist, gibt einen Hinweis, der das sagt.

Siehe [Arbeitseinträge](/agentic-coding-template-docs/de/concepts/work-entries/) für die Eintragsarten und [Konfiguration](/agentic-coding-template-docs/de/concepts/configuration/) für `mode` und `board`.
