---
title: Update
description: Einen neueren Stand des Templates mit act-update in ein Projekt holen.
sidebar:
  order: 3
sourceHash: add56e49e9f3f99aac431dc624a77429348f422a7607ff18fad87f09ee14c2f7
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
Ein Projekt auf einer Template-Version älter als v2.2.0 wird nicht mehr aktualisiert: `update.py` bricht ab, bevor es
etwas ändert, und nennt [`act-adopt`](/agentic-coding-template-docs/de/getting-started/existing-project/) (aus einem
aktuellen Template-Checkout oder Projekt gestartet, mit diesem Ordner als `<dir>`), das die Doku und eigenen Regeln des
Projekts übernimmt.

```bash
python .act/scripts/update.py --plan      # show the diff and describe the later steps, write nothing but the update note
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
- Ein ausstehendes Update bleibt sichtbar, bis es installiert ist: Der Sitzungsstart nennt es in der Zeile, die du
  siehst (`update 2.4.0 available`), und wiederholt es bei jedem Start gegenüber dem Assistenten, das Board führt es
  unter Status, und die Statuszeile von Claude Code zeigt `update: 2.4.0` auf `release` oder `update: <Datum>` auf
  `latest` (das Datum des neueren Commits, als `DD.MM.YYYY`, wenn `language-docs` `de` ist, sonst `YYYY-MM-DD`; dessen
  kurzer Hash, wo sich das Datum nicht ohne Netz lesen lässt). Ist die Sperrdatei seit der Prüfung weitergezogen (ein Update aus einem anderen Checkout),
  fällt der alte Befund weg, und die nächste Prüfung läuft sofort.
- Bestehende Projekte behalten ihre `config.md`; ohne den Schlüssel bekommen sie einen einmaligen Hinweis von
  `act-update`. `act-doctor` meldet einen Wert außer `release` oder `latest`.

Wo du stehst, siehst du mit `/act-version`: Ein Hook beantwortet es, bevor das Modell es sieht, in drei Zeilen
(die installierte Version und wann sie kam, der neueste Stand der Quelle im Channel mit Datum, und ob ein Update
bereitsteht). `/act-version --all` gibt die lange Liste, die auch `python .act/scripts/update.py --versions` ausgibt
(`--versions --short` ist die Dreizeilenform): die installierte Version und den Channel, die Releases der Quelle
(`--all` für alle statt der fünf neuesten), die Spitze des Default-Branches und was `act-update` nehmen würde. Die lange
Liste nutzt nur `git ls-remote`; die Dreizeilenform holt unter Umständen zusätzlich das einzelne Commit-Objekt, um sein
Datum zu lesen (ohne Bäume, nichts ausgecheckt); keine von beiden klont. Geschrieben wird
nur die lokale Update-Notiz unter `.act-local/` (Statuszeile, Board), beurteilt für den eigenen Channel und die eigene
Quelle des Projekts. Auch `--plan` und ein Update-Lauf frischen diese Notiz auf (oder löschen sie, wenn das Projekt auf
dem neuesten Stand ist); `--channel`, `--source` und `--ref` richten einen einzelnen Lauf woandershin und lassen sie
unberührt. `act-update` beantwortet die Frage nach der installierten oder neuesten Version mit `update.py --versions --short`.

## Advisories

Der Autor des Templates kann Projekte warnen, die eine betroffene Template-Version nutzen. Die tägliche
Update-Prüfung im Hintergrund schaut auch auf den Branch `advisories` der Template-Quelle und holt, wenn er sich
geändert hat, nur diesen Branch nach `.act-local/advisories.git` (nie ins `.git` des Projekts). Verwendet wird nur
geprüftes JSON; ein Link wird angezeigt, nie geöffnet. Ein `critical`-Advisory, das zur installierten Version passt,
erscheint bei jedem Sitzungsstart, als `⚠ A<n>` in der Statuszeile, unter dem Board-Titel und einmal als Inbox-Todo;
ein `warning` nur beim Sitzungsstart, einmal oder bei jedem Start, wie das Advisory es festlegt.

Ein Advisory endet, wenn `act-update` eine Version außerhalb seines Bereichs bringt, wenn du „Warnung quittiert“
sagst (oder `python .act/scripts/advisory.py --ack A<n>` ausführst) oder wenn die genannten Dateien den fehlerhaften
Ausschnitt nicht mehr enthalten. Ein kritisches Advisory, dessen Inbox-Todo erledigt und gelöscht wurde (eine ältere Template-Version löschte erledigte Einträge), wird auf einem anderen Arbeitsplatz nicht erneut angelegt: `advisory.py` durchsucht auch die Git-Historie, nur lesend und zeitbegrenzt (die neuesten 2000 Commits, die Inbox oder Archiv berührten, höchstens 3 Kandidatendateien, etwa 4 Sekunden), nach einem gelöschten Todo mit derselben Überschrift. `advisory-check: off` in `docs/ai/config.md` schaltet es aus; `advisory.py --status`
zeigt den Stand, `--refresh` prüft sofort. Das `git ls-remote` der Prüfung erlaubt nur die Protokolle `file`, `git`,
`http`, `https` und `ssh`: Eine Quelle hinter einem anderen Remote-Helper bekommt beim Sitzungsstart keine
Update-Notiz, `act-update` selbst bleibt unverändert.

## Die zehn Schritte

1. **Holen** des Templates in einen temporären Checkout. Nichts daraus wird ausgeführt.
2. **Lokale Änderungen.** Prüft, ob du `.act/` seit dem letzten Update bearbeitet hast. `--on-local-changes
   rescue|discard|abort` beantwortet das vorab; `rescue` verschiebt deine Änderungen zuerst nach `docs/ai/local/`.
3. **Diff** von alt nach neu, mit Regel- und Coding-Regel-IDs einzeln.
4. **Zustimmung.** Nichts wird ersetzt, bevor du zustimmst. `--yes` überspringt die Rückfrage, wenn du schon
   zugestimmt hast.
5. **`.act/` ersetzen**, als Ganzes.
6. **Die Kopien auffrischen** außerhalb von `.act/`: unveränderte Skill-Kopien und Rollen-Brücken werden ersetzt,
   von dir bearbeitete Kopien bleiben erhalten und werden gemeldet. Kopien, die `profile` oder `exclude` ([Scope](/agentic-coding-template-docs/de/reference/configuration/#scope)) auslassen, werden nicht geschrieben; eine schon vorhandene unbearbeitete Kopie wird entfernt, eine bearbeitete bleibt, beides wird gemeldet. Eigene Skills und Rollen unter `docs/ai/local/` bekommen ihre Kopien
   hier ebenfalls. Neue Coding-Sätze und -Gruppen trägt `act-update` in `docs/project/coding_rules.md` ein (ein neuer Satz nicht angekreuzt,
   eine neue Gruppe eines angekreuzten Satzes angekreuzt; siehe [Eigene Skills, Rollen und Regeln](/agentic-coding-template-docs/de/guides/own-skills-and-rules/)).
   Solange `docs/project/coding_rules.md` Änderungen hat, die nicht committet sind, wird nichts eingetragen (der
   Update-Commit würde sie mitnehmen): `update.py` sagt das in diesem Schritt und in den Schlussnotizen und nennt den
   Befehl für nach dem Commit, `python .act/scripts/rules.py --add-new-coding`. `--plan` zeigt vorab, welche Sätze und
   Gruppen ein Update eintragen würde. Eine geänderte Zeile `methods` in `docs/ai/config.md` wird hier ebenfalls
   angewendet (`python .act/scripts/rules.py --sync-methods` tut dasselbe allein).
   Hast du `docs/ai/rules.md` bearbeitet, nimmt eine Regel, die in eine andere Regeldatei gewandert ist, ihre
   Kästchenzeile mit (Kreuz und Begründung unverändert, eine abgeschaltete Regel bleibt also aus); importierst du die
   neue Datei nicht, wird sie nur gemeldet, ebenso eine Regel, die in eine Datei gewandert ist, die das Projekt mit einer
   eigenen Kopie unter `docs/ai/local/rules/` überschattet, in der die Regel fehlt (sie wird nicht geladen). Eine unbearbeitete `docs/ai/rules.md` wird wie bisher neu abgeleitet. In einer bearbeiteten trägt das Update ein, was das Template an Regeln oder Regeldateien ergänzt hat: eine Kästchenzeile je neue Regel, eine neue Regeldatei als Import-Block am Ende ihres Abschnitts. Dein eigener Text, abgewählte Kästen und entfernte Imports bleiben unangetastet; `.act-lock.json` hält fest, was angeboten wurde (`rules_offered`), eine entfernte Zeile kehrt also nicht zurück, und ihre Regel gilt weiter als eingeschaltet (ausgeschaltet wird sie über das Kreuz). Was sich nicht sicher eintragen lässt, nennt `python .act/scripts/rules.py --add-missing`; der Sitzungsstart trägt neue Regeln ebenso ein. Nur
   `builder` und `reviewer` behalten eine `-high`-Variante: erzeugte Varianten der übrigen Rollen des Templates werden
   entfernt, jede in Vorschau und Zusammenfassung genannt.
   Die Rollen des Templates (und ihre `-high`-Varianten) bekommen `omitClaudeMd: true`, Worker laden `CLAUDE.md` also nicht
   mehr; eigene Rollen und ein ausdrückliches `omitClaudeMd: false` bleiben unverändert, eine eigene Rolle ohne das Feld
   lädt weiter `CLAUDE.md`. Claude Code vor 2.1.271 ignoriert das Feld, Worker bekommen die Regeln dort doppelt (kostet
   nur Tokens).
7. **Hooks und Git-Dateien.** Gleicht die Hook-Einträge in `.claude/settings.json` und die Blöcke des Templates in
   `.gitattributes` und `.gitignore` ab, setzt dort `PYTHON_BASIC_REPL=1` unter `env` (unter Windows hängt ein leeres Heredoc in einem Bash-Aufruf unter Python 3.13 und neuer nicht mehr; ein selbst gesetzter Wert bleibt, der Bericht nennt die ergänzten env-Schlüssel) und `"enableArtifact": false`, außer `docs/ai/config.md` hat
   `artifacts: on`. Ein bestehendes Projekt startet nach dem Update deshalb ohne das Werkzeug `Artifact`. Außerdem ergänzt dieser Schritt den `Stop`-Eintrag der Prüfung `model-switch` (sie meldet zusammen mit `SubagentStop`, wenn ein Worker oder die Sitzung auf einem anderen Modell weiterlief) und die 12 `SubagentStart`-Einträge, die Workern ihre Regeln ohne die Orchestrator-Regeln geben (siehe Schritt 6); ein älterer Satz von sechs wird ersetzt, eigene Hooks bleiben. `python .act/scripts/rules.py --worker` zeigt, was ein Worker bekommt. Außerdem hält er `.act-local/` aus den Indizes der IDEs heraus: ein `excludeFolder` in jeder JetBrains-`.idea/*.iml` und `files.watcherExclude` in `.vscode/settings.json`, wo `.vscode/` existiert.
8. **Migrationen.** Führt alle fälligen aus. Jede schreibt eine betroffene Datei einmal um und lässt sie danach in Ruhe. Drei legen einem bestehenden Projekt einmal eine fehlende Datei an: `docs/ai/local/resources.md` (die Leseliste), `docs/project/README.md` (der Index der Projektdoku) und über `007-changelog-file` die `CHANGELOG.md` im Projektstamm. Eine vorhandene Datei bleibt unberührt, eine gelöschte kommt nicht zurück. `007-changelog-file` überschreibt oder legt eine `CHANGELOG.md` nie neu an; keine bekommt ein Projekt, das seinen Changelog unter anderem Namen führt (`changelog.md`, `CHANGES.md`, `HISTORY.md`, `NEWS.md`) oder unter § Formats `changelog: release-notes-only` oder `off` hat. `008-done-entries-keep` entfernt die abgeschaffte Zeile `done-entries` samt Erklärung aus `docs/ai/config.md` (siehe [Erledigte Einträge](#erledigte-einträge)); der Plan nennt, was es herausschneiden würde.
9. **Brücken und Doctor.** Zuerst werden unbearbeitete erzeugte Brücken (`CLAUDE.md`, `AGENTS.md`,
   `docs/ai/rules.md`) aufgefrischt; steht `session-start-refresh` in `docs/ai/config.md` § Checks auf `warn` oder
   `off`, werden sie nur gemeldet („would refresh … not written“). Danach prüft `doctor.py` auf Abweichungen; Befunde landen in `docs/ai/inbox/`, nie als stille Korrektur. Darunter: ein Override unter `docs/ai/local/`, dessen Gegenstück unter `.act/` fehlt (das Template hat es umbenannt oder entfernt, der Override wirkt also nicht), mit dem ähnlichsten Namen unter `.act/`; Regel-Overrides, Rollen und eigene Skills bleiben außen vor, ebenso ein eigenes Script oder ein eigener Coding-Satz, es sei denn, ein Name ist der Anfang des anderen oder unterscheidet sich nur in der Endung. Ein neuer Tier-Vorschlag wird dort als eigene Frage angelegt, und erst, wenn eine Rolle auf einem Tier 30 erfasste Ergebnisse hat und mindestens 60 % der letzten 30 nachgearbeitet oder eskaliert wurden. Die Frage ist kurz und empfiehlt Option a), zuerst die Fälle anzusehen; ihre Zahlen stehen in einem eigenen Inbox-Bericht, `report-<Datum>-<Uhrzeit>-tier-numbers-<Rolle>-<Tier>.md`. Der Commit nimmt den Bericht und die Fragen mit, und die Zusammenfassung nennt beide.
10. **Lock und Commit.** `.act-lock.json` wird neu geschrieben und ein Commit angelegt, außer du gibst
    `--no-commit` an.

Die Zusammenfassung sagt auch, wie viel der nächste Sitzungsstart aus `.act-local/` entfernen wird (die Prüfung
`act-local-tidy`, siehe unten).

Hat das Template keinen neueren Stand, melden `--plan` und der echte Lauf „nothing to update“. Eine Brückendatei, deren
Inhalt gleich bliebe, wird nicht neu geschrieben. Ein großes Update scheitert unter Windows nicht mehr mit `WinError 206`.

## Wenn eine Frage keine Eingabe bekommt

Fragt `update.py` und kommt keine Eingabe an, obwohl stdin wie ein Terminal aussieht (unter Windows zählt
`< /dev/null` dazu), nimmt es den sicheren Standardwert statt mit einem Traceback abzubrechen: keine Zustimmung zum
Update und `abort` bei lokalen Änderungen in `.act/`.

## `.act-local/` aufräumen

Die Prüfung `act-local-tidy` läuft beim Sitzungsstart einmal am Tag im Hintergrund. Sie entfernt Einträge unter `tmp/`
und unbekannte Einträge direkt unter `.act-local/`, die älter als 7 Tage sind (außer ihr Name beginnt mit der Id einer
offenen Aufgabe oder `act-local-keep` in `docs/ai/config.md` § Checks nennt sie), alle bis auf die neuesten 5
Backups von `update` und kompilierte Moduldateien (`.pyc`) unter `.act-local/pyc/`, die zu einer anderen Python-Version als der laufenden gehören und älter als 7 Tage sind (Links werden nicht verfolgt, Dateien der laufenden Version nie angetastet). Der erste Lauf meldet nur, was er entfernen würde; entfernt wird ab dem Tag nach einem
Sitzungsstart, der diese Meldung gezeigt hat. `act-local-tidy: warn` meldet nur, `off` überspringt sie.
`python .act/scripts/act_local_tidy.py` listet, was gehen würde.

Danach ergänzt der Assistent eine Journalzeile mit der Änderung des Basis-Commits und der Zahl der Befunde.

## Upgrade über 2.5.0 hinaus (noch nicht veröffentlicht)

Für Projekte mit `update-channel: latest`; nach v2.5.0 gibt es noch kein Release. `act-update` wie gewohnt ausführen,
danach eine neue Sitzung starten.

- **Älter als v2.2.0:** Ein solches Projekt wird nicht mehr aktualisiert; `update.py` bricht ab und nennt `act-adopt`
  (siehe [Bevor du anfängst](#bevor-du-anfängst)).
- **Migration `008-done-entries-keep`** läuft einmal: Sie entfernt die Zeile `done-entries` und ihren Erklärungsabsatz
  aus `docs/ai/config.md`. Ein Projekt, das `delete` hatte (der Standard unter Git), archiviert erledigte Einträge von
  nun an; siehe [Erledigte Einträge](#erledigte-einträge).
- **Aufträge, die Tests ausführen,** brauchen eine Zeile `Tests:` neben `Write scope:`; Worker führen Tests nur damit
  aus (siehe [Rollen](/agentic-coding-template-docs/de/concepts/roles/)).
- **`outside-root-allow`:** Ein absoluter Eintrag außerhalb von Projekt und Home-Ordner ist jetzt nur lesend, Schreiben
  dort wird verweigert. Ein `file:`-Eintrag wird ignoriert; stattdessen den Pfad schreiben.
- **Lock-Dateien:** Ein Commit, der eine Lock-Datei berührt, wird gehalten, solange der Scan-Cache-Ordner ein Link oder
  eine Junction ist; die Meldung nennt ihn. Ihn zu einem echten Ordner machen oder `security-check: off` setzen.
- **Neue Coding-Regelsätze** werden übersprungen, solange `docs/project/coding_rules.md` nicht committete Änderungen
  hat (Schritt 6). Committen, dann `python .act/scripts/rules.py --add-new-coding` ausführen.
- **Befunde von `act-doctor` und `rules.py`:** Dateien unter `docs/ai/local/`, deren Template-Datei weg ist, und Regeldateien,
  die eine eigene Kopie unter `docs/ai/local/rules/` überschattet. Genanntes beheben.
- **`CHANGELOG.md`:** `act-doctor` warnt, blockiert nie, vor `[Unreleased]`-Einträgen über 250 Zeichen. Sie kürzen oder
  `changelog-length: off` in `docs/ai/config.md`
  § [Checks](/agentic-coding-template-docs/de/reference/configuration/#checks) setzen.
- Optional: Um die Standardbehandlung des Changelogs zu ändern, die Zeile `changelog` unter § Formats ergänzen
  ([Formats](/agentic-coding-template-docs/de/reference/configuration/#formats)); `config.py` kann eine fehlende Zeile
  nicht setzen, `.act/skeleton/config.md` zeigt ihre Form.

## Upgrade auf 2.5.0

Von v2.4.0 aus wird `act-update` wie gewohnt ausgeführt, danach eine neue Sitzung gestartet.

- **Zwei Migrationen** laufen einmal: `005-resources-file` legt `docs/ai/local/resources.md` an und
  `006-docs-project-readme` `docs/project/README.md`; keine überschreibt eine vorhandene Datei oder bringt eine
  gelöschte zurück. Eine bearbeitete `docs/ai/rules.md` bekommt die neue Regel `R-docs-order` als Kästchenzeile; der
  eigene Text bleibt.
- **Config-Zeilen werden nicht ergänzt.** Das Update fügt einer bestehenden `docs/ai/config.md` keine Zeilen hinzu.
  Die neuen Schlüssel `done-entries`, `profile`, `exclude`, `docs-order` und `own-rules-budget` gelten mit ihrem
  Standardwert, bis die Zeile unter ihrem Abschnitt ergänzt wird, kopiert aus `.act/skeleton/config.md`; `/act-config`
  ändert nur vorhandene Zeilen. `feedback: local` ist ein neuer Wert der vorhandenen Zeile `feedback`
  (`/act-config feedback local`).
- **Erledigte Einträge werden unter Git gelöscht** (`done-entries` steht dort standardmäßig auf `delete`; siehe
  [Erledigte Einträge](#erledigte-einträge)). Das vorhandene Archiv bleibt, und der erste Sitzungsstart nennt die Zahl
  seiner Dateien; `python .act/scripts/entries.py purge --all --plan` listet es, `purge --all` löscht es, wenn
  gewünscht. Das alte Verhalten behält, wer `done-entries: keep` unter § Archiv ergänzt.
- Ohne `profile` und `exclude` bleiben alle Skills, Rollen und Regeldateien wie bisher (`full`).
- **`docs-order`:** `act-doctor` prüft die Ordnung von `docs/project/` (§ Checks, Standard `warn`, nie blockierend).
  Gleich nach dem Update nennt er jede Datei und jeden Ordner, für die das neue `docs/project/README.md` keine Zeile
  hat, und jeden Ordner mit fünf oder mehr Einträgen ohne eigene `README.md`. Die Zeilen ergänzen
  (`.act/scripts/move_doc.py` und der Schritt „Structure“ von `act-audit-docs` helfen) oder `docs-order: off`
  eintragen.
- Eine vorhandene `docs/ai/inbox/README.md` wird nicht ersetzt; die Regel `R-human-ask` trägt die neue Form einer
  Frage ohnehin, und `.act/skeleton/inbox/README.md` hat den neuen Text, falls gewünscht.
- **`own-rules-budget`:** `act-doctor` warnt (blockiert nie), wenn die Abschnitte „Own rules“ von `docs/ai/rules.md`
  und `docs/project/coding_rules.md` zusammen 6000 Zeichen überschreiten; der Schlüssel in § Checks hebt die Grenze an
  oder schaltet die Prüfung aus. Er prüft außerdem jede Einstellung mit fester Liste oder festem Format und kann einen
  Wert melden, den er früher übergangen hat. Ein Wert, der mit einem Backslash direkt vor dem nächsten `|` endet,
  braucht ein Leerzeichen vor dem `|`.
- **`workflow.js.txt`:** Überschreibt das Projekt das Script von `act-audit-docs` unter
  `docs/ai/local/skills/act-audit-docs/workflow.js`, ist diese Datei in `workflow.js.txt` umzubenennen.
- Optional: klickbare Entry-Ids werden einmal je Rechner mit `python .act/scripts/id_links_install.py` eingerichtet,
  und nach jedem `act-update` erneut.

## Upgrade auf 2.4.0

Von v2.3.0 aus führst du `act-update` wie gewohnt aus und startest danach eine neue Sitzung, damit die neuen Hooks
greifen. Eine neue Migration gibt es nicht.

- **Einstellungen, Rollen und Regelzeilen** (Schritte 6 und 7): Das Update setzt `PYTHON_BASIC_REPL=1` unter `env` in
  `.claude/settings.json`, entfernt die `-high`-Varianten von sechs Rollen (ein Auftrag, der eine davon nannte, nennt
  die Rolle selbst oder `builder-high`/`reviewer-high`) und verschiebt in einer bearbeiteten `docs/ai/rules.md` die
  Zeilen von `R-safe-no-secret-diff`, `R-safe-git-reset` und `R-safe-git-discard` in den Block von
  `orchestrator/30-cost.md`, Kreuze unverändert.
- **Der Sitzungstitel** folgt dem Namen des Projekts (`session-name`, Standard `project`). `session-name: auto`
  überlässt die Benennung Claude Code; einen mit `/rename` oder `claude -n` gesetzten Titel überschreibt sie nie.
- **Worker mit einer Zeile `Write scope:`** können nicht mehr ins Temp-Verzeichnis des Systems oder in ihr Scratchpad
  schreiben. Ein Auftrag, der Wegwerfmaterial braucht, nennt `.act-local/tmp/<task-id>-<slug>/**` in seinem Scope.
- **Advisories** sind an (siehe [Advisories](#advisories)); `advisory-check: off` in `docs/ai/config.md` schaltet sie aus.
- **`act-local-tidy`** meldet beim ersten Lauf in einem Projekt nur (siehe oben); `act-local-keep` schützt deine
  eigenen Einträge unter `.act-local/`.
- **`act-version`, `act-export-settings` und `act-load-settings`** starten nur noch, wenn du sie als Slash-Befehl tippst.
- **`archive-shorten`** wird nicht mehr gelesen und kann aus `docs/ai/config.md` raus. Sobald jedes Projekt auf dem
  Rechner aktualisiert ist, kann ein alter Ordner `act-pycache` im Temp-Verzeichnis des Systems gelöscht werden.

## Upgrade auf 2.3.0

Von v2.2.0 aus führst du `act-update` wie gewohnt aus und startest danach eine neue Sitzung, damit die neuen Hooks und
Rollenfelder greifen. Eine neue Migration gibt es nicht.

- **Der Update-Channel** entscheidet, was das nächste `act-update` bringt (siehe [Update-Channel](#update-channel)). Ein
  Projekt ohne `update-channel` in `docs/ai/config.md` folgt `release` und bekommt einmal einen Hinweis; mit
  `update-channel: latest` folgt es weiter dem Standard-Branch.
- **Die Prüfung `outside-root`** läuft als `warn` in einem Projekt ohne ihre Zeile in `docs/ai/config.md` § Checks.
  Ein einmaliger Hinweis beim Sitzungsstart sagt, wie du sie auf `block` stellst; weitere erlaubte Orte kommen in
  `outside-root-allow`.
- **Worker laden die Orchestrator-Regeln nicht mehr**: Die Rollen der Vorlage bekommen `omitClaudeMd: true` und
  `.claude/settings.json` die Einträge für `SubagentStart` (Schritt 7). Claude Code vor 2.1.271 ignoriert das Feld,
  Worker bekommen die Regeln dort doppelt, bis Claude Code aktualisiert ist.

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

## Erledigte Einträge

Der Config-Schlüssel `done-entries` ist abgeschafft. Eine erledigte Aufgabe, ein erledigter Backlog-Punkt oder Inbox-Eintrag wird immer von `entries.py archive` nach `docs/ai/work/archive/` verschoben, wie es `done-entries: keep` tat; nichts wird dort gelöscht, und dasselbe gilt für eine Konzeptdatei, die entschieden oder gebaut ist (`entries.py archive <path>`). Nichts verlässt `docs/`, bevor es in seiner Monatsdatei steht: `act-compact` faltet die Einzeldateien später in `Q-`, `T-`, `B-`, `U-<YYYY-MM>.md` (Konzepte in `other-<YYYY-MM>.md`) mit einer Übersicht `<YYYY-MM>.md`, und Git hält weiter den vollen Text (siehe [Archiv](/agentic-coding-template-docs/de/reference/configuration/#archive)).

Ein Projekt, das `delete` hatte (der Standard unter Git), archiviert von nun an; Migration `008-done-entries-keep` entfernt die Zeile `done-entries`, und eine zurückgebliebene Zeile wird ignoriert. Was eine ältere Version gelöscht hat, bleibt in der Git-Historie und wird nicht wiederhergestellt. `entries.py purge` gibt nur noch einen Hinweis aus (`purge is retired`) und endet mit 0, damit ein alter Aufruf nicht scheitert; die Optionen `--plan` und `--all` werden ignoriert, und ein übrig gebliebenes `purge: after-commit` in einer archivierten Datei bleibt, wie es ist.

## Schutz vor Downgrade

Ist der geholte Stand älter als der installierte, oder kennt die Quelle den installierten Commit nicht (zum Beispiel
ein lokaler Checkout mit ungepushten Commits), warnt `--plan`, und ein echter Lauf bricht ab, außer du gibst
`--allow-downgrade` an. Der übliche Ausweg ist `--source <lokaler Template-Checkout>`.

## Deine eigenen Änderungen

`.act/` wird ersetzt, bearbeite es also nie. Lege eine Projektfassung einer Regel, eines Skills oder einer Rolle
in `docs/ai/local/<gleicher Pfad>` ab; überschreibst du das Script `workflow.js` von `act-audit-docs`, benenne deine Datei in `workflow.js.txt` um (so heißt das Script des Templates jetzt, das Update entfernt das alte). Ein Update überschreibt diesen Ordner nie, ebenso wenig deine eigenen
Inhalte in `docs/ai/` und `docs/project/`. Es frischt nur unbearbeitete erzeugte Dateien auf (etwa eine
unbearbeitete `docs/ai/rules.md`; eine vorhandene `docs/ai/inbox/README.md` wird nicht ersetzt, die Regel `R-human-ask` trägt die Form einer Frage), legt Befunde in der Inbox ab und führt Migrationen aus. Siehe
[Schichten und Overrides](/agentic-coding-template-docs/de/concepts/layers/).

## Wenn `.act/` auf anderem Weg ersetzt wurde

Nach einem einfachen `git pull` des Templates oder einer manuellen Kopie bemerkt ein normaler Lauf das und setzt
fort, statt „nothing to update“ zu melden. `--catch-up` beendet die späteren Schritte anhand des `.act/` auf der
Platte ohne Abruf; es lehnt ab, wenn `.act/` nicht mehr zu seiner eigenen `MANIFEST.json` passt.
