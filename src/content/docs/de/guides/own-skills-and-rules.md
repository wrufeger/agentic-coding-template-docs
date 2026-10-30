---
title: Eigene Regeln, Skills und Rollen
description: Regeln des Templates abschalten, eigene ergänzen, Dateien des Templates unter docs/ai/local/ überschreiben, Skills und Rollen hinzufügen und in ein anderes Projekt mitnehmen.
sidebar:
  order: 3
sourceHash: 3f6cce4c7d0a7e5c3ec027c6d422b08013de88facd239d9024a36b480d600d90
---

Das Projekt überschreibt immer das Template. Du bearbeitest nie etwas unter `.act/`; ein Wächter (`template-write-guard`) verweigert dort Schreibzugriffe. Alles, was dir gehört, kommt nach `docs/ai/` und `docs/project/` und übersteht jedes Update.

## Regeln in docs/ai/rules.md

`docs/ai/rules.md` listet die Regeldateien auf, die der Assistent lädt, jeder Import gefolgt von seinen Regeln als Kontrollkästchen:

```markdown
@../../.act/rules/shared/20-code.md
  - [x] `R-code-language`
  - [ ] `R-code-encoding`
```

- **Eine Regel abschalten**: Entferne ihr Kreuz. Die Datei wird weiterhin ganz geladen, aber eine nicht angekreuzte Regel gilt als aus. Verschiebt ein Update der Vorlage eine Regel in eine andere Regeldatei, verschiebt `act-update` ihre Kästchenzeile in einer bearbeiteten `docs/ai/rules.md` mit, Kreuz und Begründung unverändert, sodass eine ausgeschaltete Regel ausgeschaltet bleibt. Importierst du die neue Datei nicht, wird die Verschiebung nur gemeldet.
- **Einen ganzen Bereich abschalten**: Lösche seine `@`-Importzeile.
- **Den Wortlaut einer Regel ersetzen**: Füge unter `## Overrides` einen Listenpunkt der Form ``- replaces `R-...`: <your version>`` hinzu, der die Regel und deine Fassung nennt (Zeilen, die mit `<!--` beginnen, werden übersprungen). Eine `replaces`-Zeile gewinnt gegenüber dem Text des Templates, egal ob die Regel angekreuzt ist oder nicht.
- **Eigene Regeln hinzufügen**: Lege unter `## Own rules` einen Punkt pro Regel an, die im Template keine Entsprechung hat. Eine eingerückte Liste direkt unter einer eigenen Regel (oder einer `replaces`-Zeile) gehört zu ihr und wird als Teil ihres Textes gelesen.

Die Regeldateien, die der Abschnitt „Orchestrator only“ in `docs/ai/rules.md` importiert (`.act/rules/orchestrator/` oder ihre Overrides unter `docs/ai/local/rules/orchestrator/`), erreichen Worker nicht; anderer Text in diesem Abschnitt schon. Die Rollen des Templates laden kein `CLAUDE.md`, ein Hook gibt ihnen stattdessen die geteilten Regeln, die Coding-Regeln, deine eigenen Regeln aus `docs/ai/rules.md`, `CLAUDE.local.md` und `~/.claude/CLAUDE.md`, ohne `.act/rules/orchestrator/`. Eine Regel für Worker gehört daher in die geteilten oder die Coding-Abschnitte oder unter `## Own rules`. `python .act/scripts/rules.py --worker` zeigt, was ein Worker bekommt.

Lass die Marken (`<!-- act:overrides -->`, `<!-- act:own-rules -->`) stehen, wo sie sind; die Mechanik findet die Abschnitte über sie. `python .act/scripts/rules.py --imports` zeigt, was tatsächlich geladen wird. Jede Datei endet mit ihrer Größe in Zeichen (ein CRLF-Zeilenende zählt als eins), und eine letzte Zeile gibt die Summe an, getrennt in den Anteil des Templates unter `.act/` und den des Projekts. Coding-Regelsätze funktionieren genauso in `docs/project/coding_rules.md`; ein eigener Satz oder eine lokale Überschreibung eines Template-Satzes liegt unter `docs/ai/local/coding/<set>.md` und wird ebenfalls in `docs/project/coding_rules.md` eingeschaltet (nur die lokale Datei wird geladen, statt der des Templates). `act-update` führt neue Sätze und Gruppen des Templates in `docs/project/coding_rules.md` auf: ein neuer Satz nicht angekreuzt, eine neue Gruppe eines angekreuzten Satzes angekreuzt; deine Zeilen, Kästchen und Begründungen bleiben. `rules.py --list` und `--validate` zeigen außerdem die pfadgebundenen Regeln von Claude Code unter `.claude/rules/` mit ihren `paths:`-Mustern, warnen vor einem Muster ohne passende Datei und vermerken eine Datei ohne `paths:` (sie wird bei jedem Start geladen); eine solche Regel wird erst geladen, wenn eine passende Datei gelesen oder geschrieben wird, und `act-adopt` bietet an, diese Dateien unverändert zu behalten. Die Regel-IDs stehen in der [Regelreferenz](/agentic-coding-template-docs/de/reference/rules/) und der [Coding-Regelreferenz](/agentic-coding-template-docs/de/reference/coding-rules/).

## Eine Datei überschreiben: docs/ai/local/

`docs/ai/local/` spiegelt `.act/`: Eine Datei mit demselben relativen Pfad gewinnt gegenüber der Fassung des Templates. `docs/ai/local/<path>` wird vor `.act/<path>` gesucht. Um eine Skill-Datei des Templates zu ändern, kopiere sie nach `docs/ai/local/skills/<name>/<file>` und bearbeite die Kopie; die Projektkopie wird dann aus deinem Override erzeugt. Der Ordner gehört dir, und der Assistent schreibt dort nur, wenn du es ihm sagst.

Der Ordner enthält auch optionale eigene Dateien, zum Beispiel `reminders.md` (eine Zeile „erinnere mich“ pro Zeile, mit optionalem Takt) und `security-accepted.md` (siehe [Sicherheitsprüfung](/agentic-coding-template-docs/de/guides/security-check/)).

## Eigene Skills

Ein Skill ist ein Verzeichnis mit einer `SKILL.md`, die mit YAML-Frontmatter (`name`, `description`) beginnt und werkzeugneutrale Anweisungen enthält. Lege deinen eigenen unter `docs/ai/local/skills/<name>/SKILL.md` ab; seine Werkzeugkopien (`.claude/skills/<name>/`, und `.agents/skills/<name>/` nur, wenn codex, copilot, gemini oder cursor eingerichtet ist) schreibt `act-load-settings` beim Import. Ein von Hand platzierter Skill bekommt sie beim nächsten Sitzungsstart (mit `session-start-refresh` auf dem Standard `block`) oder `update.py`-Lauf, oder mit `python .act/scripts/unit_copies.py`. Eine Kopie, die du selbst bearbeitet hast, bleibt erhalten, eine gelöschte bleibt gelöscht. Bis dahin ist der Skill über `/act <name>` erreichbar. Ein Skill-Name, den das Template schon mitliefert, ist ein Override dieses Skills, kein neuer. Schreibe die `description` mit dem Auslöser zuerst („Use when ...“, 15 bis 55 Wörter, keine Aufzählung von Schritten), denn sie ist alles, was ein Agent sieht, bevor er den Skill lädt; `python .act/scripts/skills.py --check` prüft sie, und `doctor` meldet bei deinen eigenen Skills eine fehlende oder zu lange Beschreibung. `doctor` prüft außerdem das Frontmatter deiner eigenen Skills und Rollen: gültiges YAML, ein `name` gleich dem Ordner- oder Dateinamen, keine unbekannten oder ungültigen Felder. Ein langer Skill hält den Kernablauf in `SKILL.md` und legt Details in `references/<topic>.md` ab, die nur bei Bedarf geladen werden. Die mitgelieferten Skills stehen in der [Skill-Referenz](/agentic-coding-template-docs/de/reference/skills/).

## Eigene Rollen

Eine eigene Rolle ist eine Datei `docs/ai/local/agents/<name>.md` mit ihren Regeln. Eine neue Rolle ist ihre eigene Brückenquelle und braucht Frontmatter (`name`, `description`, Tier/Reasoning, `tools`); nur ein Override einer Rolle des Templates ist reiner Text ohne Frontmatter. Tier und Reasoning (bei einem Skill: `reasoning` im Frontmatter, überschreibbar durch eine Zeile mit dem Namen des Skills) lassen sich auch in der Tabelle Roles von `docs/ai/config.md` setzen (siehe [Tiers und Reasoning](/agentic-coding-template-docs/de/concepts/reasoning/)); die werkzeugspezifische Datei unter `.claude/agents/` wird von init und update erzeugt; eine eigene Rolle bekommt sie unter dem Standard `session-start-refresh` auch beim Sitzungsstart. Sobald eine solche Datei existiert, gehört ihr Text dir: Updates frischen nur ihre Zeilen `model` und `effort` auf. Die Rollen des Templates tragen `omitClaudeMd: true`; eine eigene Rolle ohne das Feld lädt `CLAUDE.md` wie bisher, auch die Orchestrator-Regeln. Setze das Feld, wenn sie nur die Worker-Regeln bekommen soll (siehe [Update](/agentic-coding-template-docs/de/getting-started/update/)). Die eingebauten Rollen sind unter [Rollen](/agentic-coding-template-docs/de/concepts/roles/) beschrieben.

## In ein anderes Projekt mitnehmen

Zwei Skills tragen deine Abweichungen vom Template in ein anderes Projekt.

Beide Skills starten nur als eingetippter Slash-Befehl (`/act-export-settings`, `/act-load-settings`); eine Bitte in normalen Worten startet sie nicht.

**`act-export-settings`** schreibt, was du gegenüber dem Template geändert hast, in eine `settings.md`: deine eigenen Regeln, abgeschaltete Regeln und Gruppen, `replaces`-Overrides. Nichts über das Projekt selbst (Name, Arbeitsstand) kommt hinein. Optionen:

- `--all` listet auch die unveränderten Regeln auf.
- `--with-scripts`, `--with-checklists`, `--with-agents`, `--with-skills` fügen die Dateien aus `docs/ai/local/` hinzu; jede davon erzeugt statt einer `.md` eine `.zip`.
- `--with-topics` fügt die Topic-Regeln unter `docs/ai/local/rules/topics/` hinzu: ein eigenes Topic als `[+] <name>.md`, ein Override eines Topics des Templates als `[~] <name>.md` mit einem Fingerabdruck des überschriebenen Topics. Ganze Dateien, es erzeugt also ebenfalls eine `.zip`.
- `--strict` bricht ab, statt einen Platzhalter einzusetzen; nutze es, wenn die Datei deine Hände verlässt.
- `--out PATH` wählt den Ort; Standard ist `.act-local/export/`. `--profile` schreibt stattdessen in dein persönliches Profil. Einen Pfad außerhalb des Projekts verweigert die Prüfung `outside-root`: nimm den Standardordner, trag den Pfad in `outside-root-allow` ein ([Checks](/agentic-coding-template-docs/de/reference/configuration/#checks)) oder setze `ACT_OUTSIDE_ROOT=warn` für einen Lauf.

Das Script durchsucht jeden Wert nach Zugangsdaten, Mailadressen, IP-Adressen, lokalen Pfaden und internen Hosts und ersetzt einen Treffer durch einen sichtbaren Platzhalter `<setup:KIND>`. Es meldet die Zahl der Funde; überfliege die Datei, bevor du sie irgendwohin schickst.

**`act-load-settings`** importiert eine solche Datei. `python .act/scripts/settings_load.py plan` zeigt, was passieren würde, und schreibt nichts; ohne genannte Datei nimmt es alles in `.act-local/import/`. Eine Datei außerhalb des Projekts verweigert `outside-root`: leg sie nach `.act-local/import/`, erlaube ihren Ordner in `outside-root-allow` oder setze `ACT_OUTSIDE_ROOT=warn` für einen Lauf. `apply` schreibt dann, was eindeutig ist. Überschneidungen mit deinen eigenen Regeln werden beurteilt, nicht stillschweigend angewendet, und alles Ungeklärte landet in einem Inbox-Eintrag. Mitgelieferte Scripts, Skills und Rollen werden dir gezeigt, bevor sie geschrieben werden, und ein Skill oder eine Rolle, die denselben Namen wie einer des Templates trägt oder riskantes Frontmatter verlangt (Hooks, MCP-Server, Berechtigungsmodi), wird gemeldet und nie geschrieben. Eigene Topic-Regeln und Topic-Overrides gehen nach `docs/ai/local/rules/topics/<name>.md`: ein Topic, das dort mit anderem Inhalt schon liegt, wird als geändert gemeldet und nicht angetastet; ein Override, dessen Topic im Template nicht mehr existiert, wird als tot gemeldet und nicht geschrieben; einer, dessen Topic sich seit dem Export geändert hat, wird als „seit dem Export geändert“ gemeldet und von Hand geprüft. Bekommt die Frage „Write <Datei>?“ zu einer Settings-Datei keine Eingabe (doch kein Terminal), wird die Datei nicht geschrieben.
