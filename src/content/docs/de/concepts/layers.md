---
title: Schichten und Overrides
description: Wie Template-Schicht und Projekt-Schicht zusammenpassen und wie du eine Regel änderst, ohne sie beim Update zu verlieren.
sidebar:
  order: 1
sourceHash: ff468b63872a85d5d27c01349e78a6dcb981d3bde0ac9ad26bfd8dbc368bd189
---

## Zwei Schichten

| Schicht | Inhalt | Geändert von |
| :--- | :--- | :--- |
| `.act/` | Regeln, Coding-Regelsätze, Skills, Agent-Rollen, Hooks, Scripts, Tier-Tabelle | Ein Update ersetzt sie als Ganzes. Du bearbeitest sie nie. |
| `docs/` | `ai/` (Config, Regeln, Board, Inbox, Aufgaben, Journal) und `project/` (deine Dokumentation) | Dir und dem Assistenten. Ein Update überschreibt deine Inhalte nie; es frischt unbearbeitete erzeugte Dateien auf, legt Befunde in der Inbox ab und führt Migrationen aus. |

`.act-local/` bleibt auf deinem Rechner: lokaler Zustand und Caches. Das erzeugte Board ist `docs/ai/board.md` (per gitignore ausgeschlossen) im Standardmodus `board: docs` und liegt nur im Modus `local` in `.act-local/`. In Claude Code blockiert ein Hook
Schreibzugriffe nach `.act/`.

## Das Projekt gewinnt

Ein Override ist eine eigene Fassung, die die des Templates ersetzt. Eine projektspezifische Fassung von allem unter `.act/` kommt nach `docs/ai/local/<gleicher Pfad>`. Derselbe
relative Pfad wird dort vor `.act/` gesucht, sodass eine Regeldatei, ein Skill-Ordner
(`docs/ai/local/skills/<name>/`) oder ein Agent (`docs/ai/local/agents/<name>.md`) den des Templates überdeckt.
`docs/ai/local/` gehört dir: Der Assistent schreibt dort nur auf deine ausdrückliche Anweisung. Ein Skill oder
Agent, den du mit `act-load-settings` hinzufügst, landet ebenfalls dort.

## Regeln an- und ausschalten

`docs/ai/rules.md` importiert die Regeldateien und listet jede Regel mit einem Kontrollkästchen. Eine
angekreuzte Regel gilt; eine nicht angekreuzte ist aus, obwohl ihr Text geladen wird. Streiche eine Import-Zeile,
um einen ganzen Bereich abzuschalten. Dein eigener Text kommt in die Abschnitte am Ende der Datei:

- `## Overrides`: ``- replaces `R-id`: <dein Wortlaut>``. Die Zeile ersetzt den ganzen Text dieser Regel, angekreuzt oder nicht.
- `## Own rules`: ``- `R-your-id`: text`` oder ein bloßer Aufzählungspunkt, zusätzlich zu den Regeln des Templates.

`python .act/scripts/rules.py --list --area core` zeigt jede Regel mit ihrem Zustand, Overrides als `[~]` und eigene Regeln als `[+]` (ohne `--area core` listet es die Coding-Sätze);
`--validate` meldet Text, den es nicht lesen konnte.

## Coding-Regelsätze

`docs/project/coding_rules.md` funktioniert genauso für Coding-Regeln. Jede Zeile `- [x] use: @../../.act/coding/<set>.md` (angekreuzt) oder `- [ ] use: .act/coding/<set>.md` (nicht angekreuzt) schaltet
einen Satz an oder aus, mit seinen Gruppen (`CR-<set>-<group>`) darunter, jede einzeln ankreuzbar. `init` belegt
die Kästchen anhand des erkannten Stacks vor, und `stack` in `docs/ai/config.md` ist die Stelle, an der du das
korrigierst. Dieselben Abschnitte für Overrides und eigene Regeln gelten auch hier.

## Einstellungen

`docs/ai/config.md` steuert Arbeitsablauf, Prüfungen, Rollen und Sprachen. Die Tabelle `## Roles` darin
überschreibt Tier, Reasoning oder Modell einer einzelnen Rolle. Siehe die
[Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/), die
[Regelreferenz](/agentic-coding-template-docs/de/reference/rules/) und die
[Referenz der Coding-Regeln](/agentic-coding-template-docs/de/reference/coding-rules/).

## Warum die Trennung

Ein Update kann `.act/` ohne Merge ersetzen, weil das Projekt es nie bearbeitet hat. Deine Entscheidungen liegen
in Dateien, die dem Update nicht gehören. Findet ein Update trotzdem eine Handänderung in `.act/`, entscheidest
du: `rescue` verschiebt sie nach `docs/ai/local/`, `discard` verwirft sie, `abort` bricht das Update ab.
