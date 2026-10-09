---
title: Update
description: Einen neueren Stand des Templates mit act-update in ein Projekt holen.
sidebar:
  order: 3
sourceHash: 8e03b25624590962369be00f4b09733fbaa1d245412e16cc7a6dd18318563da7
---

`act-update` holt einen neueren Stand des Templates in dein Projekt: Du siehst den Diff, du stimmst zu, und
`python .act/scripts/update.py` erledigt den Rest. Es gibt keinen Merge und nichts, was du von Hand auflösen
müsstest. Sag `Prüfe, ob es ein Template-Update gibt` oder führe das Script selbst aus.

## Bevor du anfängst

Committe oder beende offene Arbeit zuerst (`git status` sollte sauber sein). Die Adresse des Templates steht in
`.act-lock.json` (`template.source`); mit `--source` und `--ref` wählst du eine andere Quelle oder ein Tag. Die dort
eingetragene Quelle hat Vorrang: ein Git-Remote namens `template` wird nur genommen, wenn die Lock-Datei keine Quelle
nennt, und das Script sagt, welche es genommen hat. Schlägt der Abruf fehl, nennt die Meldung die Quelle, woher sie
stammt, und den Ausweg (`--source`, `--ref`).

```bash
python .act/scripts/update.py --plan      # show the diff and describe the later steps, write nothing
python .act/scripts/update.py             # the real run, asks for consent
```

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
   hier ebenfalls.
7. **Hooks und Git-Dateien.** Gleicht die Hook-Einträge in `.claude/settings.json` und die Blöcke des Templates in
   `.gitattributes` und `.gitignore` ab.
8. **Migrationen.** Führt alle fälligen aus.
9. **Brücken und Doctor.** Zuerst werden unbearbeitete erzeugte Brücken (`CLAUDE.md`, `AGENTS.md`,
   `docs/ai/rules.md`) aufgefrischt; steht `session-start-refresh` in `docs/ai/config.md` § Checks auf `warn` oder
   `off`, werden sie nur gemeldet („would refresh … not written“). Danach prüft `doctor.py` auf Abweichungen; Befunde landen in `docs/ai/inbox/`, nie als stille Korrektur.
10. **Lock und Commit.** `.act-lock.json` wird neu geschrieben und ein Commit angelegt, außer du gibst
    `--no-commit` an.

Danach ergänzt der Assistent eine Journalzeile mit der Änderung des Basis-Commits und der Zahl der Befunde.

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
