---
title: Update
description: Einen neueren Stand des Templates mit act-update in ein Projekt holen.
sidebar:
  order: 3
sourceHash: 624f87a2ccedb5079b62e6c81b6d63fcac8e5ca4692a7fb2a3b8f41284ac1962
---

`act-update` holt einen neueren Stand des Templates in dein Projekt: Du siehst den Diff, du stimmst zu, und
`python .act/scripts/update.py` erledigt den Rest. Es gibt keinen Merge und nichts, was du von Hand auflösen
müsstest. Sag `Prüfe, ob es ein Template-Update gibt` oder führe das Script selbst aus.

## Bevor du anfängst

Committe oder beende offene Arbeit zuerst (`git status` sollte sauber sein). Das Update braucht Git 2.25 oder neuer. Die Adresse des Templates steht in
`.act-lock.json` (`template.source`); mit `--source` und `--ref` wählst du eine andere Quelle oder ein Tag. Die dort
eingetragene Quelle hat Vorrang: ein Git-Remote namens `template` wird nur genommen, wenn die Lock-Datei keine Quelle
nennt, und das Script sagt, welche es genommen hat. Schlägt der Abruf fehl, nennt die Meldung die Quelle, woher sie
stammt, und den Ausweg (`--source`, `--ref`).

```bash
python .act/scripts/update.py --plan      # show the diff and describe the later steps, write nothing
python .act/scripts/update.py             # the real run, asks for consent
```

## Update-Channel

`update-channel` in `docs/ai/config.md` § Update bestimmt, was `act-update` anbietet. `init` fragt danach und schreibt ihn.

- `release` (Standard) ist das neueste stabile Tag `vX.Y.Z` der Quelle. Ein Projekt, das schon darüber liegt, etwa
  weil es `main` gefolgt ist, hört „ahead of the newest release“ und behält seinen Stand.
- `latest` ist die Spitze des Default-Branches der Quelle.
- `--channel release|latest` überschreibt den Schlüssel für einen Lauf; `--ref <Tag-oder-Commit>` geht beiden vor.
- Eine Quelle ohne Release-Tags wird an ihrer Spitze verfolgt, mit einem Hinweis, solange `release` der Standard ist oder
  in `docs/ai/config.md` steht. `--channel release` und ein ungültiger Wert brechen mit dem Hinweis ab, `--ref` oder
  `latest` zu nehmen.
- Auf `release` meldet der Sitzungsstart „template release vX.Y.Z available“, auf `latest` „a template update is
  available“. `.act-lock.json` hält als `template.ref` auf `release` das installierte Tag fest, auf `latest` den Branch.
- Bestehende Projekte behalten ihre `config.md`; ohne den Schlüssel bekommen sie einen einmaligen Hinweis von
  `act-update`. `act-doctor` meldet einen Wert außer `release` oder `latest`.

Wo du stehst, siehst du mit `/act-version` oder `python .act/scripts/update.py --versions`. Es listet die installierte
Version und den Channel, die Releases der Quelle (`--all` für alle statt der fünf neuesten), die Spitze des
Default-Branches und was `act-update` nehmen würde. Es nutzt nur `git ls-remote`, klont nichts und schreibt nichts.

## Die zehn Schritte

1. **Holen** des Templates in einen temporären Checkout. Nichts daraus wird ausgeführt.
2. **Lokale Änderungen.** Prüft, ob du `.act/` seit dem letzten Update bearbeitet hast. `--on-local-changes
   rescue|discard|abort` beantwortet das vorab; `rescue` verschiebt deine Änderungen zuerst nach `docs/ai/local/`.
3. **Diff** von alt nach neu, mit Regel- und Coding-Regel-IDs einzeln.
4. **Zustimmung.** Nichts wird ersetzt, bevor du zustimmst. `--yes` überspringt die Rückfrage, wenn du schon
   zugestimmt hast.
5. **`.act/` ersetzen**, als Ganzes.
6. **Die Kopien auffrischen** außerhalb von `.act/`: unveränderte Skill-Kopien und Rollen-Brücken werden ersetzt,
   von dir bearbeitete Kopien bleiben erhalten und werden gemeldet. Eigene Skills und Rollen unter `docs/ai/local/` bekommen ihre Kopien
   hier ebenfalls. Neue Coding-Sätze und -Gruppen trägt `act-update` in `docs/project/coding_rules.md` ein (ein neuer Satz nicht angekreuzt,
   eine neue Gruppe eines angekreuzten Satzes angekreuzt; siehe [Eigene Skills, Rollen und Regeln](/agentic-coding-template-docs/de/guides/own-skills-and-rules/)).
   Die Rollen des Templates (und ihre `-high`-Varianten) bekommen `omitClaudeMd: true`, Worker laden `CLAUDE.md` also nicht
   mehr; eigene Rollen und ein ausdrückliches `omitClaudeMd: false` bleiben unverändert, eine eigene Rolle ohne das Feld
   lädt weiter `CLAUDE.md`. Claude Code vor 2.1.271 ignoriert das Feld, Worker bekommen die Regeln dort doppelt (kostet
   nur Tokens).
7. **Hooks und Git-Dateien.** Gleicht die Hook-Einträge in `.claude/settings.json` und die Blöcke des Templates in
   `.gitattributes` und `.gitignore` ab und setzt dort `"enableArtifact": false`, außer `docs/ai/config.md` hat
   `artifacts: on`. Ein bestehendes Projekt startet nach dem Update deshalb ohne das Werkzeug `Artifact`. Außerdem ergänzt dieser Schritt die sechs `SubagentStart`-Einträge, die Workern ihre Regeln ohne die Orchestrator-Regeln geben (siehe Schritt 6). `python .act/scripts/rules.py --worker` zeigt, was ein Worker bekommt.
8. **Migrationen.** Führt alle fälligen aus. Jede schreibt eine betroffene Datei einmal um und lässt sie danach in Ruhe.
9. **Brücken und Doctor.** Zuerst werden unbearbeitete erzeugte Brücken (`CLAUDE.md`, `AGENTS.md`,
   `docs/ai/rules.md`) aufgefrischt; steht `session-start-refresh` in `docs/ai/config.md` § Checks auf `warn` oder
   `off`, werden sie nur gemeldet („would refresh … not written“). Danach prüft `doctor.py` auf Abweichungen; Befunde landen in `docs/ai/inbox/`, nie als stille Korrektur.
10. **Lock und Commit.** `.act-lock.json` wird neu geschrieben und ein Commit angelegt, außer du gibst
    `--no-commit` an.

Hat das Template keinen neueren Stand, melden `--plan` und der echte Lauf „nothing to update“. Eine Brückendatei, deren
Inhalt gleich bliebe, wird nicht neu geschrieben. Ein großes Update scheitert unter Windows nicht mehr mit `WinError 206`.

Danach ergänzt der Assistent eine Journalzeile mit der Änderung des Basis-Commits und der Zahl der Befunde.

## Upgrade auf 2.2.0

Von v2.1.0 aus führst du `act-update` wie gewohnt aus; mehr ist nicht nötig. `--plan` zeigt vorab, was geschieht.

- **Migrationen `003` und `004`** verschieben den Kopf jedes Inbox-Eintrags (`003`) sowie jeder Aufgabe, jedes
  Backlog-Eintrags, Journal-Eintrags und archivierten Eintrags unter `docs/ai/work/` (`004`) in ein YAML-Frontmatter
  zwischen zwei `---`-Zeilen. `docs/ai/work/archive/legacy/` und jede `README.md` bleiben unverändert. Von Hand
  geschriebene Einträge in der alten Form funktionieren weiter.
- **Git 2.25 oder neuer** ist für das Update nötig.
- **Das Werkzeug `Artifact` ist aus** nach dem Update. `artifacts: on` in `docs/ai/config.md` behält es.
- **Quick capture** ist an: Eine Chat-Nachricht, die mit `todo:`, `note:` oder `idea:` beginnt, legt ein Hook ohne
  Modell-Durchlauf ab. `quick-capture: off` in `docs/ai/config.md` schaltet es aus.

## Schutz vor Downgrade

Ist der geholte Stand älter als der installierte, oder kennt die Quelle den installierten Commit nicht (zum Beispiel
ein lokaler Checkout mit ungepushten Commits), warnt `--plan`, und ein echter Lauf bricht ab, außer du gibst
`--allow-downgrade` an. Der übliche Ausweg ist `--source <lokaler Template-Checkout>`.

## Deine eigenen Änderungen

`.act/` wird ersetzt, bearbeite es also nie. Lege eine Projektfassung einer Regel, eines Skills oder einer Rolle
in `docs/ai/local/<gleicher Pfad>` ab; ein Update überschreibt diesen Ordner nie, ebenso wenig deine eigenen
Inhalte in `docs/ai/` und `docs/project/`. Es frischt nur unbearbeitete erzeugte Dateien auf (etwa eine
unbearbeitete `docs/ai/rules.md`), legt Befunde in der Inbox ab und führt Migrationen aus. Siehe
[Schichten und Overrides](/agentic-coding-template-docs/de/concepts/layers/).

## Wenn `.act/` auf anderem Weg ersetzt wurde

Nach einem einfachen `git pull` des Templates oder einer manuellen Kopie bemerkt ein normaler Lauf das und setzt
fort, statt „nothing to update“ zu melden. `--catch-up` beendet die späteren Schritte anhand des `.act/` auf der
Platte ohne Abruf; es lehnt ab, wenn `.act/` nicht mehr zu seiner eigenen `MANIFEST.json` passt.
