---
title: Bestehendes Projekt
description: Ein Projekt mit eigener Doku oder eigenem KI-Setup mit act-adopt übernehmen.
sidebar:
  order: 2
sourceHash: c631bd317df72620d4579cff7b6ca847401d3bfabef648f9d6cedee1cd558b2a
---

Ein Projekt, das schon Doku, eine `CLAUDE.md` oder ein älteres KI-Setup hat, läuft über `act-adopt`, nicht allein
über `init.py --target <dir>`. Was mit jeder alten Datei geschieht, ist eine Einzelfallentscheidung, und die
braucht einen Assistenten.

## Starten

`act-adopt` läuft in einem Checkout des Templates, gegen das Projekt in `<dir>`. Der Checkout hat kein
`.claude/skills/`, also kannst du den Skill dort nicht per Namen aufrufen. Öffne den Checkout in deinem
Assistenten und sag:

```text
Take over my existing project in ~/dev/shop. It already has a CLAUDE.md and its own docs.
```

Nichts ändert sich, bevor du einmal eine Tabelle freigibst, und kein Script committet etwas.

## Die Schritte

1. **Sichtung.** `adopt_scan.py --target <dir>` ordnet jede Dokumentations- und KI-Werkzeug-Quelle einer Klasse zu
   (`ai-config`, `ai-machinery`, `work`, `log`, `project-doc`, `predecessor`, `unknown`), schreibt einen Scan und
   ändert nichts.
   Die Sichtung nennt auch einen übrig gebliebenen Git-Remote, der auf das Template-Repository zeigt (das Update-Script
   eines früheren Templates hat ihn angelegt). Der Assistent schlägt vor, ihn zu entfernen, und tut es nur mit deinem Ja.
2. **Tabelle vorschlagen.** Eine Zeile pro Quelle mit einer Aktion: `keep`, `adopt`, `legacy` oder `delete`.
3. **Du gibst einmal frei.** Die ganze Tabelle in einem Durchgang. Du kannst jede Zeile ändern.
4. **Anwenden.** `adopt.py --apply` legt den Branch `act-adopt` an, verschiebt `legacy`-Zeilen ins Archiv und
   führt `init.py` aus. Die Doku-Sprache stellst du hier mit `--language-docs` ein.
5. **Einstellungen.** `adopt_config.py` überträgt Werte aus einer alten `AI-CONFIG.md` nach `docs/ai/config.md`.
6. **Inhalte füllen.** Offene Aufgaben, Backlog-Punkte und Fragen werden zu Einträgen; Regeltext wird zu
   Overrides, eigenen Regeln oder Vorschlägen. Text wird aus den alten Dateien ausgeschnitten, nie neu
   getippt.
7. **Abschluss.** `adopt.py --finish` brückt übernommene Dateien, entfernt, was weg sollte, führt `doctor.py`
   aus und schreibt einen Übernahmebericht in die Inbox.
8. **Commit.** Per Pathspec auf dem Branch `act-adopt`, in Gruppen. Du prüfst den Branch und führst ihn zusammen.

`adopt.py --abort` nimmt die Übernahme zurück, aber nur, bevor `--finish` gelaufen ist.

## Was wandert, was bleibt

| Aktion | Ergebnis |
| :--- | :--- |
| `legacy` | Die Datei wandert byte-identisch nach `docs/ai/work/archive/legacy/<alter Pfad>`. Ihre offenen Punkte werden zu Einträgen. `legacy` ist der Vorschlag für Journale und Logs; `keep` ist ebenfalls erlaubt. |
| `adopt` | Der Inhalt kommt an einen Platz des Templates: ein Eintrag, ein Vorschlag, `docs/ai/config.md`, `docs/project/` oder `docs/ai/local/`. |
| `keep` | Die Datei bleibt unangetastet. Das ist der Standard für Projektdoku, eine fremde `README.md` im Wurzelverzeichnis und lokale Dateien wie `CLAUDE.local.md`, `.mcp.json` und `.claude/settings.json`. |
| `delete` | Empfohlen für das eigene Tooling eines früheren Templates, das nichts von dir enthält; adopt erlaubt es auch für KI-Konfiguration, Arbeitsdateien und bestätigte Projektdoku. Es geschieht auf dem Branch, also geht nichts verloren. |

Die Ids alter Einträge werden nicht wiederverwendet: die reservierten Ids stehen in der versionierten Datei
`docs/ai/work/reserved-ids.json`. Im Solo-Modus folgt die Arbeitsplatz-Identität dem übernommenen Besitzer; im
Team-Modus bekommst du nur einen Hinweis.

Deine Formulierungen bleiben, wie sie sind: Titel und Texte werden aus dem alten Text kopiert, nie
zusammengefasst oder übersetzt. `init.py` führt seine Hook-Einträge in `.claude/settings.json` zusammen und lässt
deine eigenen Einträge stehen.

## Ohne die vollständige Übernahme

Lehnst du den Umbau ab, brich nach der Sichtung ab und führe `python .act/scripts/init.py --target <dir>` aus. Es
überschreibt nie eine Datei, ergänzt `.act/` und alles, was fehlt, und lässt eine bestehende `CLAUDE.md`
unverändert, der dann noch der Import der Regeln fehlt.
