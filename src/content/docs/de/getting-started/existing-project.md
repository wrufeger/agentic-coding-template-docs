---
title: Bestehendes Projekt
description: Ein Projekt mit eigener Doku oder eigenem KI-Setup mit act-adopt übernehmen.
sidebar:
  order: 2
sourceHash: ab8f5594beb6df25e0d27ae26a4b3b7c8ca67f0b2874b35ce6aad5fc023bf338
---

Ein Projekt, das schon Doku, eine `CLAUDE.md` oder ein älteres KI-Setup hat, läuft über `act-adopt`, nicht allein
über `init.py --target <dir>`. Was mit jeder alten Datei geschieht, ist eine Einzelfallentscheidung, und die
braucht einen Assistenten.

## Starten

`act-adopt` läuft gegen das Projekt in `<dir>`, und zwar von einer von zwei Stellen aus:

- **Ein Checkout des Templates.** Der Checkout hat kein `.claude/skills/`, also lässt sich der Skill dort nicht per
  Namen aufrufen. Den Checkout im Assistenten öffnen und sagen:

  ```text
  Übernimm mein bestehendes Projekt in ~/dev/shop. Es hat schon eine CLAUDE.md und eigene Doku.
  ```

- **Ein anderes Projekt, das das Template schon nutzt.** Der Skill liegt in jedem Projekt, also geht dort auch
  `/act-adopt`. `<dir>` muss außerhalb des Projekts liegen, aus dem er gestartet wird (nicht das Projekt selbst, kein
  Ordner darin, auch nicht über einen Symlink oder eine Junction); `init.py` und `adopt.py` lehnen das ab und legen
  nichts an. Das neue Projekt bekommt das `.act/` des startenden Projekts, sein erstes `act-update` bringt also das
  aktuelle Template.

Welcher Fall vorliegt, entscheidet `<dir>`: ein Ordner, den es nicht gibt oder der nur `.git` enthält, startet ein
**neues Projekt** (`init.py --target <dir>`), ein Ordner mit anderem Inhalt ist eine **Übernahme** (die Schritte unten).
Der Assistent sagt vorher, welcher Fall es ist. Nichts ändert sich, bevor du einmal eine Tabelle freigibst, und kein
Script committet etwas.

### Mitnehmen aus dem startenden Projekt

Aus einem Projekt heraus listet der Assistent, was mitkommen könnte, und fragt einmal je Kategorie, Standard ja. Die
Antworten werden zu `--carry` von `init.py --target` (neues Projekt) oder `adopt.py --apply` (Übernahme):

| Kategorie | Nimmt mit |
| :--- | :--- |
| `skills` | Eigene Skills (`docs/ai/local/skills/`). |
| `rules` | Die eigenen Regeln (`## Own rules`). |
| `exceptions` | Abgeschaltete Regelgruppen und Regelsätze, mit ihrem Grund. |
| `overrides` | `replaces`-Zeilen und die übrigen Dateien unter `docs/ai/local/`. |
| `topics` | Eigene Topic-Regeln und Overrides von Template-Topics (`docs/ai/local/rules/topics/`). |

Alles ja lässt `--carry` weg, alles nein ist `--carry none` (`--no-local` tut dasselbe); `--carry` ohne `--target`
wird abgelehnt. Nur committeter Inhalt reist mit, nie `.env*`, Symlinks oder unversionierte Dateien. Was das neue
Projekt nicht aufnehmen kann (eine Regelgruppe oder ein Regelsatz, den es nicht kennt), landet in seiner Inbox. Aus dem
Template-Checkout gibt es nichts mitzunehmen.

## Die Schritte

1. **Sichtung.** `adopt_scan.py --target <dir>` ordnet jede Dokumentations- und KI-Werkzeug-Quelle einer Klasse zu
   (`ai-config`, `ai-machinery`, `work`, `log`, `project-doc`, `predecessor`, `unknown`), schreibt einen Scan und
   ändert nichts.
   Die Sichtung nennt auch einen übrig gebliebenen Git-Remote, der auf das Template-Repository zeigt (das Update-Script
   eines früheren Templates hat ihn angelegt). Der Assistent schlägt vor, ihn zu entfernen, und tut es nur mit deinem Ja.
   Hat das Projekt, in dem du arbeitest, schon die Hooks des Templates, verweigert die Prüfung `outside-root` den
   Zugriff auf einen Zielordner außerhalb. Dann startest du den ersten Scan selbst mit dem Präfix `!`
   (`! python .act/scripts/adopt_scan.py --target <dir>`). Der Scan legt eine Marke an, die das Ziel für 24 Stunden
   oder bis `--abort` öffnet, auch über `--finish` hinaus, damit die späteren Schritte es weiter erreichen. Siehe [`R-safe-outside-root`](/agentic-coding-template-docs/de/reference/rules/#r-safe-outside-root).
2. **Tabelle vorschlagen.** Eine Zeile pro Quelle mit einer Aktion: `keep`, `adopt`, `legacy` oder `delete`.
3. **Du gibst einmal frei.** Die ganze Tabelle in einem Durchgang. Du kannst jede Zeile ändern. Eine `adopt`-Zeile der
   Klasse `project-doc`, `ai-machinery`, `predecessor` oder `unknown` braucht ein Ziel (die Datei, in die ihr Inhalt
   geht); nenne hier die Zeilen ohne Ziel, denn `--apply` lehnt sie ohne dein Ja ab.
4. **Anwenden.** `adopt.py --apply` legt den Branch `act-adopt` an, verschiebt `legacy`-Zeilen ins Archiv und
   führt `init.py` aus. Die Doku-Sprache stellst du hier mit `--language-docs` ein, den
   [Update-Channel](/agentic-coding-template-docs/de/getting-started/update/#update-channel) mit `--update-channel release|latest` (Standard `release`; er wird an `init.py` weitergegeben). Zeilen ohne Ziel
   brauchen `--confirm-no-targets`, nur mit deinem Ja.
5. **Einstellungen.** `adopt_config.py` überträgt Werte aus einer alten `AI-CONFIG.md` nach `docs/ai/config.md`.
6. **Inhalte füllen.** Offene Aufgaben, Backlog-Punkte und Fragen werden zu Einträgen; Regeltext wird zu
   Overrides, eigenen Regeln oder Vorschlägen. Eine vorhandene Richtliniendatei wird danach sortiert, wohin jeder Teil gehört, und Teil für Teil vorgeschlagen, nie ganz in „Own rules“ übernommen; eigene Regeln bleiben Einzeiler. Text wird aus den alten Dateien ausgeschnitten, nie neu
   getippt. Ein Vorschlag in `docs/ai/proposals/` bekommt einen Frontmatter-Kopf (`author`, `date`, `target`); ältere Vorschläge in der schlichten Form werden weiter gelesen.
7. **Abschluss.** `adopt.py --finish` brückt übernommene Dateien, entfernt, was weg sollte, führt `doctor.py`
   aus und schreibt einen Übernahmebericht in die Inbox.
8. **Commit.** Per Pathspec auf dem Branch `act-adopt`, in Gruppen. Du prüfst den Branch und führst ihn zusammen.

`adopt.py --abort` nimmt die Übernahme zurück, aber nur, bevor `--finish` gelaufen ist.

### Baseline-Prüfung vor dem ersten Commit

Zwischen Schritt 7 und 8 führt der Assistent einmal `adopt_baseline.py --target <dir>` aus. Der vorhandene Code ist nie
durch die Commit-Prüfungen des Templates gelaufen; ohne diesen Lauf würde der erste Commit wegen Mustern angehalten, die
schon lange da sind, und ein Geheimnis im Code fiele erst dann auf. Der Lauf liest nur und gibt drei Dinge aus: die
Muster für Geheimnis-Dateien, die in `.gitignore` fehlen (`.env`-Varianten, private Schlüssel, Keystores), die Funde
des Secret-Scans und des Scans auf gefährliche Muster über den vorhandenen Baum (Datei, Zeile und Regel, nie ein Wert)
und die Backlog-Einträge, die er anlegen würde. Mit deinem Ja läuft er erneut mit `--write-gitignore --book`: das hängt
die Muster an `.gitignore` an und bucht je Datei einen Backlog-Eintrag für ein Geheimnis und je Regel einen für ein
gefährliches Muster, nichts doppelt. Die `.gitignore` kommt in den Commit der Template-Schicht, die Einträge in einen
eigenen Commit.

Ein gebuchter Fund eines gefährlichen Musters geht dann beim ersten Commit ohne Halt durch (der Schlüssel `Datei|Regel`
gilt ohne Ablauf, bis er aus `.act-local/danger-scan-hints/baseline.json` entfernt wird). Ein Geheimnis hält bei
jedem Versuch, bis der Wert entfernt und rotiert ist, die Zeile `act:allow-secret` trägt oder in
`docs/ai/local/secret-accepted.md` steht. Das Buchen schaltet es nicht stumm. Siehe
[`adopt_baseline.py`](/agentic-coding-template-docs/de/reference/scripts/#adopt_baselinepy).

## Was wandert, was bleibt

| Aktion | Ergebnis |
| :--- | :--- |
| `legacy` | Die Datei wandert byte-identisch nach `docs/ai/work/archive/legacy/<alter Pfad>`. Ihre offenen Punkte werden zu Einträgen. `legacy` ist der Vorschlag für Journale und Logs; `keep` ist ebenfalls erlaubt. |
| `adopt` | Der Inhalt kommt an einen Platz des Templates: ein Eintrag, ein Vorschlag, `docs/ai/config.md`, `docs/project/` oder `docs/ai/local/`. |
| `keep` | Die Datei bleibt unangetastet. Das ist der Standard für Projektdoku, eine fremde `README.md` im Wurzelverzeichnis und lokale Dateien wie `CLAUDE.local.md`, `.mcp.json` `.claude/settings.json`, `.claude/rules/*.md` und eine `.junie/guidelines.md`, die nur auf AGENTS.md oder CLAUDE.md verweist. |
| `delete` | Empfohlen für das eigene Tooling eines früheren Templates, das nichts von dir enthält; adopt erlaubt es auch für KI-Konfiguration, Arbeitsdateien und bestätigte Projektdoku. Es geschieht auf dem Branch, also geht nichts verloren. |

Die Ids alter Einträge werden nicht wiederverwendet: die reservierten Ids stehen in der versionierten Datei
`docs/ai/work/reserved-ids.json`. Im Solo-Modus folgt die Arbeitsplatz-Identität dem übernommenen Besitzer; im
Team-Modus bekommst du nur einen Hinweis.

Deine Formulierungen bleiben, wie sie sind: Titel und Texte werden aus dem alten Text kopiert, nie
zusammengefasst oder übersetzt. Einzige Ausnahme ist ein Titel über 80 Zeichen: `adopt_entries.py` kürzt ihn auf seinen ersten Satz, sonst auf einen Schnitt an einer Wortgrenze mit „…“, und der volle alte Text steht am Anfang des Eintrags. `init.py` führt seine Hook-Einträge in `.claude/settings.json` zusammen und lässt
deine eigenen Einträge stehen. Ohne `artifacts: on` trägt er zusätzlich `"enableArtifact": false` ein. Außerdem setzt er `PYTHON_BASIC_REPL=1` unter `env` (ein selbst gesetzter Wert bleibt).
Bei einer `language-docs` außer Englisch übersetzt `act-adopt` das Gerüst im selben Lauf. `feedback` steht standardmäßig
auf `confirm` (jede Nachricht wird gezeigt und erst nach deinem Ja gesendet); `local` (es wird nie etwas gesendet) setzt `/act-config feedback local`.

## Ohne die vollständige Übernahme

Lehnst du den Umbau ab, brich nach der Sichtung ab und führe `python .act/scripts/init.py --target <dir>` aus. Es
überschreibt nie eine Datei, ergänzt `.act/` und alles, was fehlt, und lässt eine bestehende `CLAUDE.md`
unverändert, der dann noch der Import der Regeln fehlt. Aus einem Projekt gestartet, übernimmt es dessen eigene
Skills, Regeln, Ausnahmen, Overrides und Topics, sofern `--carry` nicht weniger nennt.
