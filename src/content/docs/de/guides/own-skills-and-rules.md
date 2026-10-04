---
title: Eigene Regeln, Skills und Rollen
description: Regeln der Vorlage abschalten, eigene ergänzen, Dateien der Vorlage unter docs/ai/local/ überschreiben, Skills und Rollen hinzufügen und in ein anderes Projekt mitnehmen.
sidebar:
  order: 3
sourceHash: 4ec4892247da01b88a9dde46de89cebeacda8abd06c2aa284e0eb77c7593849a
---

Das Projekt überschreibt immer die Vorlage. Du bearbeitest nie etwas unter `.act/`; ein Wächter (`template-write-guard`) verweigert dort Schreibzugriffe. Alles, was dir gehört, kommt nach `docs/ai/` und `docs/project/` und übersteht jedes Update.

## Regeln in docs/ai/rules.md

`docs/ai/rules.md` listet die Regeldateien auf, die der Assistent lädt, jeder Import gefolgt von seinen Regeln als Kontrollkästchen:

```markdown
@../../.act/rules/shared/20-code.md
  - [x] `R-code-language`
  - [ ] `R-code-encoding`
```

- **Eine Regel abschalten**: Entferne ihr Kreuz. Die Datei wird weiterhin ganz geladen, aber eine nicht angekreuzte Regel gilt als aus.
- **Einen ganzen Bereich abschalten**: Lösche seine `@`-Importzeile.
- **Den Wortlaut einer Regel ersetzen**: Füge unter `## Overrides` einen Listenpunkt der Form ``- replaces `R-...`: <your version>`` hinzu, der die Regel und deine Fassung nennt (Zeilen, die mit `<!--` beginnen, werden übersprungen). Eine `replaces`-Zeile gewinnt gegenüber dem Text der Vorlage, egal ob die Regel angekreuzt ist oder nicht.
- **Eigene Regeln hinzufügen**: Lege unter `## Own rules` einen Punkt pro Regel an, die in der Vorlage keine Entsprechung hat.

Lass die Marken (`<!-- act:overrides -->`, `<!-- act:own-rules -->`) stehen, wo sie sind; die Mechanik findet die Abschnitte über sie. `python .act/scripts/rules.py --imports` zeigt, was tatsächlich geladen wird. Coding-Regelsätze funktionieren genauso in `docs/project/coding_rules.md`. Die Regel-IDs stehen in der [Regelreferenz](/agentic-coding-template-docs/de/reference/rules/) und der [Coding-Regelreferenz](/agentic-coding-template-docs/de/reference/coding-rules/).

## Eine Datei überschreiben: docs/ai/local/

`docs/ai/local/` spiegelt `.act/`: Eine Datei mit demselben relativen Pfad gewinnt gegenüber der Fassung der Vorlage. `docs/ai/local/<path>` wird vor `.act/<path>` gesucht. Um eine Skill-Datei der Vorlage zu ändern, kopiere sie nach `docs/ai/local/skills/<name>/<file>` und bearbeite die Kopie; die Projektkopie wird dann aus deiner Überschreibung erzeugt. Der Ordner gehört dir, und der Assistent schreibt dort nur, wenn du es ihm sagst.

Der Ordner enthält auch optionale eigene Dateien, zum Beispiel `reminders.md` (eine Zeile „erinnere mich" pro Zeile, mit optionalem Takt) und `security-accepted.md` (siehe [Die Sicherheitsprüfung](/agentic-coding-template-docs/de/guides/security-check/)).

## Eigene Skills

Ein Skill ist ein Verzeichnis mit einer `SKILL.md`, die mit YAML-Frontmatter (`name`, `description`) beginnt und werkzeugneutrale Anweisungen enthält. Lege deinen eigenen unter `docs/ai/local/skills/<name>/SKILL.md` ab; ein von Hand platzierter Skill bekommt nicht automatisch Werkzeugkopien: Kopien (`.claude/skills/<name>/`, und `.agents/skills/<name>/` nur, wenn codex, copilot, gemini oder cursor eingerichtet ist) entstehen über `act-load-settings` oder die Übernahme. Der Skill ist in der Zwischenzeit über `/act <name>` erreichbar. Ein Skill-Name, den die Vorlage schon mitliefert, ist eine Überschreibung dieses Skills, kein neuer. Die mitgelieferten Skills stehen in der [Skill-Referenz](/agentic-coding-template-docs/de/reference/skills/).

## Eigene Rollen

Eine eigene Rolle ist eine Datei `docs/ai/local/agents/<name>.md` mit ihren Regeln. Eine neue Rolle ist ihre eigene Brückenquelle und braucht Frontmatter (`name`, `description`, Tier/Reasoning, `tools`); nur eine Überschreibung einer Rolle der Vorlage ist reiner Text ohne Frontmatter. Tier und Reasoning lassen sich auch in der Tabelle Roles von `docs/ai/config.md` setzen (siehe [Tiers und Reasoning](/agentic-coding-template-docs/de/concepts/reasoning/)); die werkzeugspezifische Datei unter `.claude/agents/` wird von init und update erzeugt, nicht bei jedem Sitzungsstart. Sobald eine solche Datei existiert, gehört ihr Text dir: Updates frischen nur ihre Zeilen `model` und `effort` auf. Die eingebauten Rollen sind unter [Rollen](/agentic-coding-template-docs/de/concepts/roles/) beschrieben.

## In ein anderes Projekt mitnehmen

Zwei Skills tragen deine Abweichungen von der Vorlage in ein anderes Projekt.

**`act-export-settings`** schreibt, was du gegenüber der Vorlage geändert hast, in eine `settings.md`: deine eigenen Regeln, abgeschaltete Regeln und Gruppen, `replaces`-Überschreibungen. Nichts über das Projekt selbst (Name, Arbeitsstand) kommt hinein. Optionen:

- `--all` listet auch die unveränderten Regeln auf.
- `--with-scripts`, `--with-checklists`, `--with-agents`, `--with-skills` fügen die Dateien aus `docs/ai/local/` hinzu; jede davon erzeugt statt einer `.md` eine `.zip`.
- `--strict` bricht ab, statt einen Platzhalter einzusetzen; nutze es, wenn die Datei deine Hände verlässt.
- `--out PATH` wählt den Ort; Standard ist `.act-local/export/`. `--profile` schreibt stattdessen in dein persönliches Profil.

Das Script durchsucht jeden Wert nach Zugangsdaten, Mailadressen, IP-Adressen, lokalen Pfaden und internen Hosts und ersetzt einen Treffer durch einen sichtbaren Platzhalter `<setup:KIND>`. Es meldet die Zahl der Funde; überfliege die Datei, bevor du sie irgendwohin schickst.

**`act-load-settings`** importiert eine solche Datei. `python .act/scripts/settings_load.py plan` zeigt, was passieren würde, und schreibt nichts; ohne genannte Datei nimmt es alles in `.act-local/import/`. `apply` schreibt dann, was eindeutig ist. Überschneidungen mit deinen eigenen Regeln werden beurteilt, nicht stillschweigend angewendet, und alles Ungeklärte landet in einem Inbox-Eintrag. Mitgelieferte Scripts, Skills und Rollen werden dir gezeigt, bevor sie geschrieben werden, und ein Skill oder eine Rolle, die denselben Namen wie einer der Vorlage trägt oder riskantes Frontmatter verlangt (Hooks, MCP-Server, Berechtigungsmodi), wird gemeldet und nie geschrieben.
