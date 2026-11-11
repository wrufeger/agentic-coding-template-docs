<!-- German catalog for the reference page "configuration". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## _intro
<!-- source: 71b9ad66a5408d27 -->
`init` trägt die folgenden Werte aus dem ein, was es gefragt oder erkannt hat. Sie lassen sich jederzeit ändern — nichts davon erfordert einen Neuaufbau; `.act/hooks/dispatch.py` liest diese Datei beim Sitzungsstart. `/act-config` (oder `python .act/scripts/config.py`) zeigt die Werte an und setzt sie. Diese Datei beschreibt das **Projekt** und ist versioniert. Secrets und Abweichungen pro Rechner oder pro Lauf gehören in die Umgebung, die diese Datei für den jeweiligen Lauf überschreibt, nie umgekehrt; der Sitzungsstart nennt jeden aktiven Override aus der Umgebung (nur die Namen, nie die Werte).

## _note
<!-- source: fa0fcf6cf2bcbd63 -->
Dies ist die Standard-`config.md` des Templates; Platzhalter in spitzen Klammern füllt `init` aus.

## Project
<!-- source: 6a9b167091ef978a -->
| Schlüssel | Wert |
| :--- | :--- |
| `name` | <name> |
| `owner` | <owner> |
| `language-chat` | <language-chat> |
| `language-docs` | <language-docs> |
| `stack` | <stack> |
| `commands` | <lint-command>, <typecheck-command>, <test-command> |
| `tools` | <tool-list> |
| `mode` | <mode> |
| `run` | (not set) |

`language-chat` ist die Sprache, in der der Assistent spricht: `auto` (Standard) folgt den eigenen
Nachrichten des Owners, ein Code wie `de` legt sie fest. `language-docs` ist die Sprache von allem, was der
Assistent unter `docs/` schreibt, und des dortigen Gerüsts; `.act/` bleibt in beiden Fällen Englisch
(`R-work-language`). Eine config.md mit dem älteren einzelnen Schlüssel `language` funktioniert weiterhin — der Wert
gilt für beide.

`commands` ist Lint, Typecheck, Test, in dieser Reihenfolge, optional gefolgt von einem vierten Eintrag für die
vollständige oder E2E-Suite (läuft einmal vor einem Push; ohne ihn nimmt der Test-Befehl diesen Platz ein); `(not set)`
heißt, dass für diesen Platz kein Befehl eingerichtet ist und die zugehörige Prüfung übersprungen wird (`R-code-commit`).

`run` ist der Befehl, der die Anwendung startet; `(not set)` heißt, dass keiner hinterlegt ist, ebenso bei einer config.md ohne die Zeile.

`mode` ist `solo` oder `team` und ändert **eine** Sache: wann ein Eintrag seine kurze ID bekommt. In
`solo` vergibt der Assistent sie sofort und arbeitet weiter. In `team` vergibt sie nur,
wer den Eintrag auf dem Default-Branch ablegt, sodass zwei Personen nie dieselbe Nummer vergeben können; bis dahin
ist der Dateiname das, was man zitiert. Dateiname, Ablageort und Format sind in beiden Fällen gleich, man kann also
jederzeit hin- und herwechseln — bereits vergebene IDs bleiben, nur spätere folgen dem neuen Wert. Bekannte Grenze: In einem reinen Pull-Request-Workflow, in dem der
Default-Branch nie lokal ausgecheckt wird, vergibt niemand IDs, sodass auf Feature-Branches archivierte Einträge
ohne ID bleiben. Die IDs sind
`T<n>` (Aufgabe), `B<n>` (Backlog-Eintrag), `Q<n>` (Frage) und `U<n>` (Todo für dich); eine Meldung oder Notiz hat keine.

## Scope
<!-- source: 8ebf7cd51259c362 -->
| Schlüssel | Wert |
| :--- | :--- |
| `profile` | &lt;profile> |
| `exclude` | none |
| `methods` | &lt;methods> |

`profile`: `minimal` \| `standard` \| `full`. Wie viele der Skills und Rollen des Templates dieses Projekt
lädt; jede Skill-Beschreibung und jede Regeldatei gehört zu jedem Sitzungsstart, weniger davon bedeutet also
einen kleineren Start. `full` behält alles (ein fehlender Schlüssel gilt als `full`; `init` schreibt `full` für ein Web-Projekt, `standard` für jedes andere, `--scope` entscheidet anders, `update` ändert es nie). `standard` lässt die
Web-, Design- und Teaching-Skills weg: `act-a11y`, `act-check-translations`, `act-design-assets`,
`act-design-build`, `act-design-ideas`, `act-seo`, `act-slides`, `act-teach`. `minimal` behält nur den Kern,
die Skills `act`, `act-adopt`, `act-bug`, `act-commit`, `act-compact`, `act-config`, `act-doctor`,
`act-export-settings`, `act-feedback`, `act-handover`, `act-idea`, `act-info`, `act-load-settings`,
`act-prepare`, `act-setup`, `act-update`, `act-version` und die Rollen `builder`, `debugger`, `doc-writer`,
`explorer`, `quick-check`, `reviewer` (mit ihren `-high`-Varianten), und lässt jeden anderen Skill und jede andere
Rolle des Templates weg. Ein Wert, der keiner der drei ist, gilt mit einer Warnung als `full`. Die eigenen Skills
und Rollen des Projekts (unter `docs/ai/local/`) werden nie gekürzt.

`exclude`: `none` oder eine kommagetrennte Liste dessen, was zusätzlich zum Profil wegfällt — der Name eines
Template-Skills (`act-seo`), einer Template-Rolle (`test-writer`), einer Regeldatei (`orchestrator/30-cost.md`)
oder eines Topics (`logging` oder `topics/logging.md`). Regeldateien fallen nur über ihren Namen weg, nie über das Profil. Eine Regeldatei
bleibt unter `.act/`, aber ihre Zeile in `docs/ai/rules.md` verliert das `@`, und Claude Code lädt sie nicht mehr
(die Sub-Agenten ebenso wenig); ein ausgeschlossenes Topic wird beim Sitzungsstart nicht mehr genannt. `shared/10-safety.md`
lässt sich nicht ausschließen (eine Warnung, der Eintrag wird ignoriert), und ein unbekannter Name gibt nur eine Warnung. Die Prüfungen unter
§ Checks bleiben in jedem Fall in Kraft: ihre Sperren hängen nicht vom Regeltext ab.

`methods`: `none` oder eine kommagetrennte Liste von Arbeitsmethoden aus `.act/methods/` (`test-first`, `spec-first`,
`simple-changes`; was jede verlangt: `.act/methods/README.md`; eigene des Projekts: `docs/ai/local/methods/<name>.md`).
Jede genannte Methode wird als importierter Regelsatz in `docs/project/coding_rules.md` geschrieben (ein mit
`<!-- act:methods -->` markierter Abschnitt), sodass der Orchestrator und jeder Worker sie laden; eine einzelne Gruppe
dort abwählen, um sie auszuschalten. Die Zeile entscheidet: Nach einer Änderung `python .act/scripts/rules.py --sync-methods`
ausführen. `act-doctor` meldet einen unbekannten Namen und einen Abschnitt, der nicht zur Zeile passt. `init` fragt
einmal; der Standard ist `none`.

Der Sitzungsstart wendet eine Änderung an: Er entfernt die Kopien der weggelassenen Skills und Rollen
(`.claude/skills/`, `.agents/skills/`, `.claude/agents/`; eine von dir bearbeitete Kopie bleibt und wird gemeldet), stellt
die Import-Zeilen um und sagt das in einer Zeile. Skills, Rollen und Regeln werden beim Start einer Sitzung geladen, eine Änderung
wirkt also erst ab der **nächsten** Sitzung. `init` und `update` beachten den Scope und schreiben nie eine Kopie, die
wegfällt. Zum Rückgängigmachen `profile` auf `full` und `exclude` auf `none` setzen: Der nächste Sitzungsstart schreibt die
Kopien und Import-Zeilen zurück.

## Status line
<!-- source: e012c1dd0a03740c -->
Die Statuszeile von Claude Code (`statusLine` in `.claude/settings.json`) zeigt, was in `docs/ai/inbox/` auf dich
wartet und wie viele offene Aufgaben es gibt — vom Template gesetzt, sobald noch keine vorhanden ist. Um sie
dauerhaft abzuschalten: einen eigenen `statusLine`-Befehl setzen, und sei er trivial — das
Template ersetzt nur seinen eigenen, zuvor erzeugten Eintrag, nie einen anderen, sodass deiner
bei jedem späteren Update unangetastet bleibt. Den Schlüssel `statusLine` ganz zu entfernen schaltet sie
nur bis zum nächsten `init`/`update`-Lauf ab, der keine findet und den Eintrag des Templates wieder hinzufügt
(es sei denn, bis dahin existiert eine benutzerweite, siehe unten) — kein dauerhafter Weg zum Abschalten. Gibt es
bereits eine benutzerweite `statusLine` (`~/.claude/settings.json`), bleibt das Projekt von Anfang an ohne eigene,
sodass sich beide nie überlagern — ein einzeiliger Hinweis sagt das bei Einrichtung/Update.

## Board
<!-- source: c6529e28a0633f98 -->
| Schlüssel | Wert |
| :--- | :--- |
| `board` | docs |
| `board-others` | |

`board`: `docs` (Standard) \| `shared` \| `local` — wohin das erzeugte Board geschrieben wird. `docs`:
`docs/ai/board.md`, per gitignore ausgeschlossen, eines je Checkout; seine Überschrift nennt den Branch. `shared`: behält die
lokale Ansicht in `docs/ai/board.md` und schreibt beim Commit durch `act-commit` das versionierte Board je Person
`docs/ai/board-<identity>.md` (ohne letzten Commit, ohne Arbeitsverzeichnis, ohne Zeitstempel). `local`: `.act-local/board-<branch>.md`. Die lokale Ansicht wird beim Sitzungsstart
und nach Git-Befehlen in der Sitzung neu erzeugt, die den ausgecheckten Stand ändern (merge, pull,
rebase, switch, checkout …); eine versionierte Datei wird dadurch nie neu geschrieben. `board-others`: `on` \| `off` — ein
Abschnitt für Aufgaben, die anderen zugewiesen sind (`for:` im Aufgabenkopf); mit `shared` listet er auch die
committeten Boards der anderen auf. Leer bedeutet `on` bei `mode: team`, sonst `off`.

## Inbox
<!-- source: 71f2e7b9ceecde58 -->
| Schlüssel | Wert |
| :--- | :--- |
| `inbox-decisions` | immediate |
| `quick-capture` | on |

`immediate` (Standard) \| `at-start`. `immediate`: jede offene Entscheidung und jeder Schritt, den nur eine Person
tun kann und jetzt tun kann, kommt nach `docs/ai/inbox/`, sobald er verbucht wird, sodass die Inbox immer
alles Wartende zeigt. `at-start`: ein Backlog-Eintrag darf seine offenen Entscheidungen behalten — Kopfzeile
`decision: open`, auf dem Board gelistet —, bis die Arbeit daran beginnt (`act-prepare`); bei einer Aufgabe liegen
sie immer in der Inbox (`R-human-ask`).

`quick-capture`: `on` \| `off`. `on` (Standard; ein fehlender Schlüssel gilt als `on`): Eine Chat-Nachricht, die
mit `todo:`, `note:` oder `idea:` beginnt, legt der `UserPromptSubmit`-Hook ohne Modell-Durchlauf ab, und sie erreicht das
Modell nie — `todo:` und `note:` als Inbox-Einträge mit `triage: open` (der Assistent entscheidet, für wen ein Todo
ist, oder beantwortet die Notiz), `idea:` als neuen Abschnitt in deiner `ideas-<identity>.md` (`R-human-capture`).
`off`: Die Präfixe haben keine besondere Bedeutung. War eine Nachricht, die mit einem dieser Wörter beginnt, als
Auftrag gemeint, die vom Hook genannte Datei löschen und die Nachricht ohne Präfix noch einmal senden.

## Output depth
<!-- source: dc45974e3bef2bb0 -->
| Schlüssel | Wert |
| :--- | :--- |
| `output-depth` | normal |

`verbose` \| `normal` \| `sparse`. Steuert, was der Assistent im Chat *schreibt*, nicht, was die
eigene Oberfläche des Werkzeugs anzeigt — die Anzeigeeinstellungen je Werkzeug stehen in `docs/README.md`. Definiert in
`R-human-chat`: `normal` ist kompakt und auf den Punkt (Stichpunkte statt Absätzen); `sparse` gibt nur das
Nötige — keinen Zwischenstand, eine Antwort je Frage; `verbose` schreibt Antworten aus — die Frage, wie sie
verstanden wurde, Gründe, Hinweise zu selbst geschriebenem Code und worauf zu achten ist.

## Session length
<!-- source: 7e5c3fac8f383b0d -->
| Schlüssel | Wert |
| :--- | :--- |
| `context-hint` | 180000 |
| `task-wait-hours` | 12 |
| `board-at-start` | on |
| `session-name` | project |
| `artifacts` | off |

`board-at-start`: `on` \| `off`. `on` (Standard; ein fehlender Schlüssel gilt als `on`) hängt dem Sitzungsstart einen
Auszug des Boards an — die Abschnitte „Open tasks“ (mit der letzten Stand-Zeile jeder Aufgabe), „Answered“ und
„Waiting for you“, höchstens etwa 2000 Zeichen; offene Aufgaben und beantwortete Einträge bleiben vollständig, die
wartenden Einträge füllen den Rest und enden in einer Zeile `+N more` — so kann ein bloßes „weiter“ damit arbeiten,
ohne erst das Board zu lesen. Er wird zuerst gekürzt oder weggelassen, wenn die Ausgabe des Sitzungsstarts an ihre
Größengrenze stößt, und nach einer Verdichtung (Compaction) entfällt er (die Compaction-Notiz nennt die Aufgaben schon).

`session-name`: `project` \| `auto` \| beliebiger anderer Text. `project` (Standard; ein fehlender Schlüssel gilt als
`project`) setzt den Titel der Claude-Code-Sitzung auf den `name` aus dieser Datei, oder auf den Namen des
Projektordners, solange `name` leer oder noch der Platzhalter ist, sodass eine Remote-Control-Sitzung auf dem Handy
zeigt, zu welchem Projekt sie gehört. `auto` überlässt die Benennung dem Werkzeug. Jeder andere Text wird selbst als
Titel verwendet (Steuerzeichen entfernt, höchstens 80 Zeichen). Gilt nur für Claude Code; der Titel wird gesetzt,
wenn eine Sitzung startet, fortgesetzt oder gegabelt wird, und überschreibt nie einen, den du mit `/rename` oder
`claude -n` gesetzt hast. Eine benannte Sitzung behält ihren Titel über `/clear` hinweg.

`artifacts`: `on` \| `off`. `off` (Standard; ein fehlender Schlüssel oder jeder andere Wert gilt als `off`) trägt
`"enableArtifact": false` in `.claude/settings.json` ein, sodass Claude Code das Werkzeug `Artifact` nicht mehr lädt —
etwa 13.700 Tokens weniger bei jedem Sitzungsstart. Das wirkt ab der nächsten Sitzung, nicht in der laufenden. `on`
heißt „nicht anfassen“, nicht „einschalten“: Es entfernt nur einen Eintrag, den die Vorlage selbst gesetzt hat, und ein
`false` auf Nutzerebene oder `CLAUDE_CODE_DISABLE_ARTIFACT=1` in der Umgebung lässt das Werkzeug trotzdem aus. Gilt nur
für Claude Code, und nur eine vorhandene `.claude/settings.json` wird angefasst. Einen Wert, den das Projekt selbst
gesetzt hat, überschreibt die Mechanik nie; einer, der `off` widerspricht, wird einmal gemeldet. Der Sitzungsstart wendet
es nach `session-start-refresh` an (`block` schreibt, `warn` nennt es nur, `off` lässt es), `init` und `update` immer.

`context-hint`: eine Token-Anzahl oder `off`. Erreicht der Kontext der Sitzung (die Eingabe ihres letzten
Modellaufrufs, aus dem Transkript gelesen) diesen Wert, und erneut bei jedem weiteren Vielfachen davon, bekommt
der Assistent einen einmaligen Hinweis, an der nächsten Aufgabengrenze `/clear` oder eine neue Sitzung
vorzuschlagen (`R-work-handover`); die Statuszeile zeigt die Größe in jedem Fall als `ctx <n>k`. Jeder Schritt
einer langen Sitzung sendet den ganzen Kontext erneut, eine frische Sitzung nach einer abgeschlossenen Aufgabe
ist daher die größte Ersparnis überhaupt. `task-wait-hours`: Eine begonnene Aufgabe gilt in der Statuszeile und
auf dem Board als *wartend* statt als *laufend*, sobald eine dieser Bedingungen zutrifft: Ihre letzte Stand-Zeile
wurde mit `entries.py state <id> --wait` geschrieben; diese Zeile ist älter als diese Stundenzahl (ohne datierte
Stand-Zeile zählt stattdessen der `started:`-Zeitpunkt der Aufgabe); oder ein offenes Inbox-Todo oder eine offene
Frage nennt ihre ID (Berichte und Notizen zählen nicht). Ein fehlender oder fehlerhafter Wert gilt als der Standard.

## Teaching
<!-- source: 2b9a5ebea81344e3 -->
| Schlüssel | Wert |
| :--- | :--- |
| `teach-lessons` | local |

`teach-lessons`: `local` \| `docs`. Wo `act-teach` seine Lektionen ablegt. `local` (Standard; ein fehlender Schlüssel
gilt als `local`, ein unbekannter Wert als `local` mit Hinweis) schreibt Lektionen, Übungen und das Lernprotokoll
unter `.act-local/learn/<topic>/`, in `language-chat`; nichts wird versioniert. `docs` schreibt Lektionen und Übungen
unter `docs/learn/<topic>/` in `language-docs`, versioniert und von `act-audit-docs` geprüft; das Lernprotokoll bleibt
unter `.act-local/learn/<topic>/`.

## Dependencies
<!-- source: f412620dbdf64968 -->
| Schlüssel | Wert |
| :--- | :--- |
| `dependency-check` | regularly |

`never` \| `once` \| `regularly`. `regularly` (Standard) weist beim Sitzungsstart darauf hin, wenn noch kein
`act-deps`-Lauf verzeichnet ist („no `act-deps` run on record yet“, einmalig), und danach, wenn der letzte Lauf
(ein Journal-Eintrag mit dem Titel `act-deps: ...`) älter als 30 Tage ist; `once` legt stattdessen direkt nach
`init` einen einmaligen Inbox-Eintrag an, der bittet, `act-deps` auszuführen, danach nur noch auf Anforderung;
`never` tut keines von beidem — der Skill selbst läuft in jedem Fall weiterhin auf ausdrückliche Anforderung.

## Docs audit
<!-- source: 6ba9bfc48adc8f43 -->
| Schlüssel | Wert |
| :--- | :--- |
| `docs-audit-due` | 30d/100c |

`<n>d/<n>c` \| `off`. Beim Sitzungsstart ein Hinweis (höchstens einmal am Tag), wenn der letzte vollständige
`act-audit-docs`-Durchlauf (ein Journal-Eintrag mit dem Titel `act-audit-docs: ...`) älter als so viele Tage
*oder* so viele Commits ist, oder nur einmalig, wenn es noch keinen gibt — nie eine Sperre, und nur, solange
`docs/project/` existiert. Ein fehlender oder fehlerhafter Wert zählt als `30d/100c`.

## Git hosting
<!-- source: 0464af45ac916d67 -->
| Schlüssel | Wert |
| :--- | :--- |
| `target-branch` | auto |
| `forge` | auto |
| `forge-host` | auto |

`target-branch` ist der Branch, in den ein Pull/Merge Request geht. `auto` nimmt den Default-Branch des Remotes,
sonst den ersten vorhandenen aus `development`, `develop`, `main`; ein Branch-Name legt ihn fest (der
Skill `act-pr` trägt den Wert ein, den du bestätigst). `forge` ist die Host-Software des Remotes `origin`:
`auto` unterscheidet GitHub von GitLab am Host-Namen (`github.com`, `gitlab.com`), sonst durch eine rein lesende
Abfrage des Hosts; `github` oder `gitlab` legt es für eine selbst gehostete Instanz fest. Leer, `(not set)` und ein
fehlender Schlüssel zählen alle als `auto`, ein Projekt aus der Zeit vor diesem Abschnitt braucht also keine Änderung.
`forge-host` nennt eine selbst gehostete Instanz (ein Host-Name oder eine Komma-Liste), die das Token erhalten darf;
`auto` oder leer heißt keine. `forge.py` sendet ein Token nur an `github.com` (`api.github.com`),
`gitlab.com`, einen hier genannten Host oder den Host von `ACT_FORGE_API_URL` (ein ausdrücklicher Override, für Tests und
Proxys) und nie über `http://`, außer an Loopback. Einen Host erst eintragen, nachdem der Mensch ihn bestätigt hat —
so gelangt ein globales Token nicht an einen fremden Host. Ohne Eintrag laufen Lesezugriffe ohne Token; `whoami`,
`issues --mine` und jeder Schreibzugriff brechen vor jeder Anfrage mit einem Hinweis ab. Ein bestätigter Host, der über
`http://` erreicht wird, wird genauso behandelt, bis seine Adresse `https://` ist.

## Formats
<!-- source: c5e46fe3d3644a4e -->
| Schlüssel | Wert |
| :--- | :--- |
| `commit-format` | auto |
| `changelog` | file |
| `changelog-format` | keep-a-changelog |
| `release-notes-format` | standard |
| `readme-format` | standard |

Wie der Assistent Commit-Nachrichten, das Changelog, Release Notes und die README schreibt. Jede `*-format`-Zeile wählt
ein Preset aus der Standarddatei des Templates in `.act/formats/` (`commit.md`, `changelog.md`, `release-notes.md`,
`project-readme.md`; ein leerer Wert, `auto` und ein unbekannter Name bedeuten den Standard dieser Datei). Eine Datei
desselben Namens unter `docs/project/formats/` ersetzt die Template-Datei vollständig und geht der Zeile vor. Werte:
`commit-format`: `auto` (der eigene Stil des Repos) \| `conventional` \| `plain`. `changelog`: `file` (eine `CHANGELOG.md`
im Projektstamm, von `init` angelegt, älteren Projekten von `act-update` angeboten) \| `release-notes-only` (keine
Datei; `act-release` hält die Notizen im Tag und im Release-Eintrag) \| `off`. `changelog-format`:
`keep-a-changelog` (Einträge kommen beim Committen unter `[Unreleased]`) \| `at-release` (nur von
`act-release` geschrieben). `release-notes-format`: `standard` \| `changelog-copy`. `readme-format`: `standard` \|
`with-toc` \| `minimal` (von `init` gelesen, wenn es die README schreibt, und von `act-audit-docs`).

## Checks
<!-- source: 0267edcf0589e4f3 -->
Jede der folgenden Prüfungen läuft vor der Aktion, die sie nennt; `block` verweigert die Aktion, `warn` erlaubt sie
mit einem Hinweis, `off` überspringt die Prüfung ganz. Eine Prüfung, die nur hinweist (markiert mit „never
refuses“), behandelt `block` wie `warn`.

| Prüfung | Wert | Schützt |
| :--- | :--- | :--- |
| `template-write-guard` | block | Schreibzugriffe unter `.act/` — stattdessen eine Projektfassung in `docs/ai/local/<same path>` ablegen |
| `session-start-refresh` | block | baut die erzeugten Brücken und das Board beim Sitzungsstart neu; `warn` meldet nur, was es erneuern würde (einmal je Änderung, nicht bei jedem Start), und schreibt nichts (eine Ausnahme: eine fehlende `.act-local/identity.json` wird trotzdem aus `git config user.name` angelegt), hier wie im Brücken-Schritt von `update.py`; `off` überspringt es, und `update.py` meldet dann ebenfalls nur |
| `orchestrator-rules` | block | nur als Rückfall: solange `docs/ai/rules.md` die Orchestrator-Regeln nicht importiert (eine ältere, lokal geänderte Kopie), nennt sie der Sitzungsstart in Kürze; `off` überspringt es |
| `worker-nesting-guard` | block | ein Sub-Agent, der `Agent`/`Task` aufruft (keine Sub-Sub-Agenten, `R-role-worker`) — `warn` meldet ohne zu sperren, `off` überspringt es |
| `worker-write-scope` | block | ein Worker, der außerhalb der `Write scope:`-Zeile seines Auftrags schreibt (`R-cost-delegate`) — `warn` meldet ohne zu sperren, `off` überspringt es |
| `worker-scope-overlap` | block | ein Worker-Start, dessen `Write scope:` sich mit dem eines noch laufenden Workers überschneidet — `none` überschneidet sich mit nichts, eine fehlende Zeile zählt als alles (`R-cost-delegate`); eine `Tests:`-Zeile (der Baum, in dem ein Auftrag Tests ausführt) wird mit dem `Write scope:` der laufenden Worker verglichen und der `Write scope:` mit deren `Tests:`-Zeilen; ein beendeter Worker oder ein fehlgeschlagener Start gibt seinen Scope frei, ein abgestürzter Worker nach drei Stunden oder wenn seine Datei unter `.act-local/worker-scopes/` gelöscht wird; von zwei Starts, die in einer Nachricht um die Wette laufen, wird der spätere verweigert; ein eigener Schreibzugriff des Orchestrators unter dem `Tests:` eines laufenden Workers oder ein Testlauf neben einem schreibenden Worker bekommt nur einen Hinweis; Grenze: ein per `SendMessage` fortgesetzter Worker ist nach seinem Ende unsichtbar; `warn` meldet ohne zu sperren, `off` überspringt es |
| `commit-pathspec` | block | `git add -A`, `git add .`, `git add --all`, `git commit -a` — stattdessen per Pathspec stagen (`R-code-commit`) |
| `git-reset-hard` | block | `git reset --hard` (Bash/PowerShell, auch `git -C <dir> ...`), solange der betroffene Arbeitsbaum nicht committete Änderungen hat (untracked Dateien zählen ebenfalls als Änderungen) oder sein eigener Arbeitsbaum nicht ermittelt werden kann — zuerst `git stash`/`git reset --soft` (`R-safe-git-reset`) |
| `git-discard` | block | `git clean -f`, das etwas löschen würde, `git checkout`/`git restore` eines Ordners (oder `checkout -f`, `switch -f`) bei nicht committeten Änderungen an getrackten Dateien im Ziel, `git stash drop`/`clear`, ein erzwungener Push auf den Default-Branch (`origin/HEAD`, sonst `init.defaultBranch`, sonst `main`/`master`), `git branch -D` eines nicht gemergten Branches (Bash/PowerShell, auch `git -C <dir> ...`); das Löschen des Default-Branches auf dem Remote und `branch -M`/`-C` über einem nicht gemergten Branch zählen ebenfalls; ein Ziel, das sich nicht ermitteln lässt (ein reines `git branch` zum Auflisten ausgenommen), oder ein Aufruf, der sich nicht rechtzeitig prüfen lässt, wird verweigert (`R-safe-git-discard`); dasselbe Modul wie `git-reset-hard`, jede Zeile behält ihren eigenen Modus |
| `git-metadata-guard` | block | Schreibzugriffe auf `.git/hooks/**`, `.git/config` (auch das Git-Verzeichnis einer `.git`-Datei) und `git config`/`git -c`-Schlüssel, die Code ausführen (`core.hooksPath`, `core.fsmonitor`, `core.sshCommand`, `!`-Aliase …) für alle; für Worker zusätzlich `.claude/settings*.json`, `.claude/agents/**`, `.claude/skills/**`, `.claude/commands/**` (Projekt und `~/.claude`) sowie `.vscode/tasks.json`, `.devcontainer/**`, `.devcontainer.json`, `.envrc`, `.mcp.json` und Tasks, die bei `folderOpen` laufen — den Menschen fragen (`R-safe-git-metadata`) |
| `protected-watch` | block | nach jedem Tool-Aufruf (Orchestrator und Worker) ein Vergleich mit einem Schnappschuss der Dateien, die `R-safe-git-metadata` schützt — `.git/hooks/**`, `.git/config` (nur die Schlüssel, die Code starten), `.claude/settings*.json`, `.claude/agents/**`, `.claude/skills/**`, `.claude/commands/**`, `.mcp.json`, `.envrc`, `.devcontainer/**`, `.vscode/tasks.json`; eine Änderung im Aufruf eines Workers wird sofort aus dem Schnappschuss vor dem Aufruf zurückgesetzt und unter `.act-local/protected-watch/kept/` aufbewahrt, eine Änderung des Orchestrators wird nur gemeldet, mit dem Befehl, der sie zurücksetzt; `warn` meldet jede Änderung und setzt nichts zurück, `off` legt keinen Schnappschuss an; meldet nach dem Aufruf, verhindert nichts; `ACT_PROTECTED_WATCH` in der Umgebung überschreibt den Wert für einen Lauf (`R-safe-git-metadata`, Details in `topics/checks.md`) |
| `recursive-delete` | block | rekursives Löschen aus der Shell (`rm -r`, `rmdir /s`, `Remove-Item -Recurse`, `find -delete`) — mit den eigenen Mitteln der Sprache oder Datei für Datei löschen (`R-safe-no-shell-delete`) |
| `secret-scan` | block | `git commit`, solange der gestagte Diff ein Schlüssel-/Token-Muster, einen privaten Schlüssel, eine `.env`-Datei oder eine Zuweisung mit hoher Entropie enthält; eine Zeile mit `act:allow-secret` ist ausgenommen, und für eine Datei ohne Kommentare (JSON) auch eine Zeile, die in `docs/ai/local/secret-accepted.md` als `- <path> <hash>: <reason>` steht — die Sperrmeldung druckt den fertigen Eintrag (Pfad und Zeilen-Hash, nie den Wert); eine geänderte Zeile, dieselbe Zeile in einer anderen Datei oder eine nicht lesbare Liste sperrt wieder (`R-safe-no-secret-diff`) |
| `secret-read` | block | Read, Grep (`path`, `glob`) und lesende Bash/PowerShell-Befehle (`cat`, `grep`, `Get-Content`, `< file` an beliebiger Stelle, `git show HEAD:<file>`, ...), die eine Secret-Datei nennen — `.env` und ihre Varianten (nicht ein Name, der auf `.example`/`.sample`/`.template` endet, nicht ein öffentlicher Schlüssel `*.pub`), private Schlüssel und Keystores, `~/.ssh`, `~/.aws`, `~/.config/gcloud` und weitere Zugangsdaten-Pfade; gilt auch für Worker; `warn` meldet ohne zu sperren; `ACT_SECRET_READ` in der Umgebung überschreibt den Wert für einen Lauf (`R-safe-no-secret-read`) |
| `outside-root` | block | Read, Write, Edit, Grep, Glob und Bash/PowerShell, die einen Pfad außerhalb des Projektstamms und seiner erlaubten Orte nennen (`permissions.additionalDirectories`, das temporäre Systemverzeichnis, der eigene Ordner von Claude Code für dieses Projekt, die Einträge von `outside-root-allow`); gilt auch für Worker; `warn` meldet ohne zu sperren; `ACT_OUTSIDE_ROOT` in der Umgebung überschreibt den Wert für einen Lauf; ein Projekt ohne diese Zeile führt die Prüfung als `warn` aus (`R-safe-outside-root`) |
| `outside-root-allow` | none | Ausnahmen zu `outside-root`: `none` oder eine kommagetrennte Liste von Pfaden, jeder relativ zum Projektstamm, mit `~` beginnend oder absolut, jeder optional gefolgt von ` (read)` für nur lesend, z. B. `../other-repo (read), ~/shared/specs, D:/Program Files/Browser` — ein absoluter Pfad (ein Laufwerkspfad in beiden Schreibweisen oder ein POSIX-Pfad wie `/opt/browser`) außerhalb des Projekts und des Home-Verzeichnisses ist der Eintrag für einen Programmordner wie den eines Browsers: er ist nur lesend, wie ein Eintrag mit ` (read)`, gedacht zum Lesen und zum Starten eines Programms darunter; die Schreibzugriffe, die die Prüfung erkennt, werden dort verweigert, sie ist aber keine Sandbox (ein Schreibzugriff, den die Prüfung nicht sieht, etwa über `xargs`, `chmod` oder den eigenen Code eines Programms, wird nicht gestoppt); ein Eintrag, der eine Laufwerkswurzel, `/` oder ein Ordner oberhalb des Projekts oder des Home-Verzeichnisses ist, öffnet das Lesen von allem darunter; ein Eintrag braucht das Wort des Besitzers für diesen Ordner; ein Pipe-Zeichen im Wert bekommt einen Backslash davor (`R-safe-outside-root`) |
| `act-local-tidy` | block | Sitzungsstart, einmal am Tag im Hintergrund: entfernt aus `.act-local/` die `tmp/`-Einträge, die älter als 7 Tage sind und zu keiner offenen Aufgabe gehören, alle `backup/`-Ordner bis auf die neuesten 5, `pyc/`-Cache-Ordner, deren Quellordner nicht mehr existiert und die nichts enthalten, was neuer als 7 Tage ist, und alte Einträge, die kein Template-Script anlegt (Alter = jüngste Änderung darin); `warn` meldet nur, was entfernt würde, `off` überspringt es; der erste Lauf in einem Projekt meldet nur, und das Entfernen beginnt am nächsten Kalendertag; ein Projekt ohne diese Zeile führt es als `block` aus (`R-work-throwaway`) |
| `act-local-keep` | none | Ausnahmen zu `act-local-tidy`: `none` oder eine kommagetrennte Liste von Mustern relativ zu `.act-local/`, z. B. `exports, tmp/long-*` — passende Einträge werden nie entfernt; ein Pipe-Zeichen im Wert bekommt einen Backslash davor (`R-work-throwaway`) |
| `security-check` | local | `off` \| `local` \| `deps` \| `full`, nicht das übliche block/warn/off. `off` führt hier nichts aus; `local`/`deps`/`full` führen alle den Scan nach gefährlichen Mustern aus (Art A: `eval`/`exec`, `shell=True`, `pickle.loads`, `yaml.load` ohne SafeLoader, `v-html`, `innerHTML =`, per String-Verkettung gebautes SQL, ... — nur für einen Coding-Regelsatz, den das Projekt in `docs/project/coding_rules.md` angekreuzt hat) bei `git commit`, stoppen beim ersten Treffer je Datei und Muster einmal mit seiner Fundstelle; die Wiederholung geht durch, und eine Zeile mit `act:allow-danger` ist ausgenommen. Eine Doku-Datei (`.md`, `.txt`, `.rst`) und alles unter `.act/` wird nie gescannt (Prosa und die eigenen Dateien des Templates, kein Projektcode). `deps`/`full` ergänzen Art B (`.act/scripts/security_scan.py`, `.act/hooks/checks/deps_scan.py`): eine Live-Abfrage nach Schwachstellen in Abhängigkeiten — `osv-scanner`, falls installiert, sonst `npm audit`/`composer audit`/`pip-audit` je Ökosystem — bei `git commit` genau für die Lock-Dateien, die dieser Commit berührt (`package-lock.json`, `composer.lock`, `requirements.txt`, `go.mod`, `Cargo.lock`, ...; ein Befund in einer Lock-Datei, die der Commit unberührt lässt, hält ihn nie auf), und einmal am Tag beim Sitzungsstart über jede Lock-Datei im Projekt (dort als eine Zeile gemeldet, ohne den Start selbst je zu verzögern). Der Scan läuft nie innerhalb des Hook-Aufrufs des Commits selbst: er läuft als abgekoppelter Hintergrundprozess, der Hook wartet kurz auf sein Ergebnis und verweigert sonst einmal („dependency scan running — commit again in a moment“); der erneute Versuch liest das fertige Ergebnis, für den Tag je Lock-Datei-Inhalt zwischengespeichert (nur festgehalten, wenn sich die Dateien während des Tool-Laufs nicht geändert haben), sodass ein wiederholter Commit nicht erneut abfragt; ein Hintergrundlauf, der die eigenen Timeouts der Werkzeuge überdauert, lässt den Commit ungeprüft mit einem Hinweis durch, statt ewig zu warten. Ein nicht akzeptierter Befund mit Schweregrad high/critical hält den Commit auf (Paket, Version, Advisory-ID, Schweregrad, behobene Version); ein niedrigerer oder unbekannter Schweregrad weist nur hin — die eigene Ausgabe von pip-audit enthält gar kein Schweregrad-Feld, ein pip-audit-Befund ist also immer „unknown“ und kann nur hinweisen, nie von sich aus den Commit aufhalten. Einen Befund bewusst akzeptieren mit einer Zeile in `docs/ai/local/security-accepted.md`: `- <advisory-id>: <reason>` (eine je Zeile; `#`-Kommentare und Leerzeilen werden ignoriert). Ein fehlendes Werkzeug weist einmal je Rechner mit dem Installationsbefehl hin und sperrt nie; ein Werkzeug- oder Netzwerkfehler weist jedes Mal hin, sperrt nie und wird höchstens eine Minute lang wiederverwendet, bevor der nächste Commit neu scannt (fail-open — Art B hat nie eine vom Template mitgelieferte Ausweichliste: Eine mit einem Update ausgelieferte Liste ist bei Ankunft veraltet, die Werkzeuge holen ihre Daten live). `full` führt zusätzlich Art C aus (Semgrep mit offenen Regelsätzen, dazu ein Sicherheitsdurchgang des `reviewer`) über `.act/scripts/security_deep.py`, aber nur auf Anforderung und vor einem Release (`act-release`) — nie bei jedem Commit, wie auch Art A/B nie einen schweren statischen Analyselauf ausführen |
| `worker-docs-ai` | block | ein Worker, der unter `docs/ai/` schreibt — dort schreibt nur der Orchestrator (`R-role-worker`) |
| `worker-git-write` | block | ein Worker, der einen Git-Befehl ausführt, der Baum oder Verlauf ändert (`commit`, `add`, `stash`, `checkout`, `reset`, `restore`, `merge`, `rebase`, `clean`, `push`) (`R-role-worker`) |
| `ide-mcp` | block | die eigenen Tools eines verbundenen IDE-MCP-Servers (`execute_terminal_command`, `apply_patch`, `execute_run_configuration`, ...), eingestuft als Shell/Schreiben/Ausführen ohne Ziel und genauso geprüft wie das passende Standard-Tool — ein Ziel, das sich nicht auswerten lässt, wird verweigert statt ungeprüft durchgelassen; `warn` meldet ohne zu sperren, `off` überspringt es (`topics/ide.md`) |
| `worker-cap` | block | Tool-Aufrufe eines Workers über seine `Cap: <n>`-Zeile hinaus (ohne sie: aus einer `Tier:`-Zeile, sonst aus der Rolle — `quick-check` 10, `reviewer` 60, `expert-solver` 80, andere 40) — ein Hinweis beim Cap, Verweigerung ab dem 1,5-Fachen des Caps (`R-cost-delegate`); bekannte Grenze: Ein Aufruf, den diese Prüfungen erlauben, die Berechtigungsabfrage von Claude Code selbst dann aber ablehnt, zählt trotzdem mit, da der Hook vor dem Aufruf diese Ablehnung nie sieht |
| `status-poll` | block | wiederholte Statusabfragen an einen laufenden Worker ohne echte Arbeit dazwischen — ab der zweiten in Folge verweigert (`R-cost-wait`) |
| `encoding-hint` | block | Schreiben in eine Datei, die nicht UTF-8 ist — der erste Schreibzugriff je Sitzung und Datei wird einmal mit einem Hinweis gestoppt, die Wiederholung geht durch; `warn` weist erst nach dem Schreiben hin (`R-code-encoding`) |
| `model-switch` | warn | bei `SubagentStop` und `Stop`: Ein Worker oder die Sitzung, die auf einem anderen Modell weiterläuft (ein `stop_reason: refusal`, ein geändertes Modell im Transkript), wird dem Orchestrator mit seinem nächsten Tool-Aufruf mitgeteilt, mit Rolle und Modellen, und der Orchestrator sagt es dem Menschen im Chat; der Hook selbst zeigt dem Menschen nichts (Claude Code hält ein `systemMessage` dieser Ereignisse fest, zeigt es aber nie an); verweigert nie, `block` zählt als `warn`, `off` überspringt es (`R-safe-block`, Details in `topics/safeguards.md`) |
| `throwaway-place` | warn | nur die Hauptsitzung: ein Befehl oder Dateischreibzugriff, der Wegwerf-Ausgabe ins temporäre Systemverzeichnis oder direkt unter `.act-local/` legt, bekommt einen Hinweis, der `.act-local/tmp/<task-id>-<slug>/` oder `.act-local/tmp/<YYYYMMDD>-<slug>/` nennt; verweigert nie, `off` schaltet ihn ab (`R-work-throwaway`) |
| `commit-hashes` | warn | nur `git commit`, verweigert nie: ein Commit-Hash in Backticks (7 bis 40 Hex-Zeichen, mit einer Ziffer und einem Buchstaben) in der Commit-Nachricht oder in einer Zeile, die zu einer gestagten Journal-Datei (`docs/ai/work/ledger/`) hinzukommt und den kein Repository kennt (`git cat-file -e <hash>^{commit}`), wird in einem Hinweis genannt; `block` zählt als `warn`, `off` überspringt es (`R-work-evidence`, Einzelheiten in `topics/checks.md`) |
| `commit-hashes-repos` | none | weitere Repositories, in denen `commit-hashes` nachsieht: `none` oder eine kommagetrennte Liste von Pfaden, jeder relativ zum Projektstamm oder absolut, z. B. `../agentic-coding-template`; ein Journal kann Commits eines anderen Repositories nennen; ein Pipe-Zeichen im Wert bekommt einen Backslash davor |
| `cd-git` | block | ein Bash-Aufruf mit `cd`/`pushd` und `git` in einer Kette wird verweigert und `git -C <folder> <command>` in einem eigenen Aufruf genannt, weil Claude Code bei dieser Kombination jedes Mal den Eigentümer um Freigabe bittet; läuft nur, wenn `tools` `claude-code` enthält; ein `cd` in den Ordner, in dem der Aufruf ohnehin läuft, zählt nicht; `warn` nennt den Weg und lässt den Aufruf durch, `off` überspringt es (Einzelheiten in `topics/checks.md`) |
| `update-branch-hint` | warn | Update oder Einstellungsimport auf einem anderen Branch als dem Default-Branch: ein Hinweis, dass die anderen es erst mit dem Merge bekommen — verweigert nie, `block` zählt als `warn`, `off` lässt den Hinweis weg |
| `update-check` | block | beim Sitzungsstart: ein Hinweis, wenn `.act/` ohne `update.py` hereingeholt wurde, und — höchstens einmal am Tag geprüft — ein Hinweis, dass das Template weitergezogen ist, bei jedem Start wiederholt und auf dem Board und in der Statuszeile gezeigt, bis das Update eingespielt ist; verweigert nie, `off` überspringt beides |
| `docs-order` | warn | nur `act-doctor`, verweigert nie: ein Ordner unter `docs/project/` mit fünf oder mehr Einträgen und ohne `README.md`, eine Datei, die seine `README.md` nicht nennt, eine Indexzeile ohne Datei, ein toter relativer Link, ein Konzept, dessen Fragen alle beantwortet sind; `block` zählt als `warn`, `off` überspringt es (`R-docs-order`) |
| `changelog-length` | warn | nur `act-doctor`, verweigert nie: ein Eintrag unter `[Unreleased]` in `CHANGELOG.md`, der länger als 250 Zeichen ist (seine Zeilen aneinandergehängt), genannt mit seinen ersten Wörtern; `block` zählt als `warn`, `off` überspringt es |
| `own-rules-budget` | 6000 | nur `act-doctor`, verweigert nie: die Zeichen, die die Abschnitte „Own rules“ von `docs/ai/rules.md` und `docs/project/coding_rules.md` zusammen haben dürfen, bevor eine Warnung die Größe und bis zu fünf Zeilen nennt, die wie Verlauf klingen (ein Datum, eine Eintrags-ID, „früher … seit …“); `off` oder `0` überspringt es |

## Logging
<!-- source: 9fb49fc66248da1d -->
| Schlüssel | Wert |
| :--- | :--- |
| `logging` | off |
| `log-level` | INFO |

`logging`: `on` \| `off`. Mit `on` landet jede Aktion des Agenten als eine Zeile in `ai.log` im
Projektwurzelverzeichnis (nicht versioniert) — um live mitzuverfolgen, z. B. in einem zweiten Terminal während eines Vortrags.
`log-level`: `DEBUG` \| `INFO` \| `WARN` \| `ERROR`. Details: `.act/rules/topics/logging.md`.

## Feedback
<!-- source: 79d146a9ec3d52f7 -->
| Schlüssel | Wert |
| :--- | :--- |
| `feedback` | <feedback-mode> |
| `feedback-cadence` | weekly |
| `feedback-scope` | a,b,c |

Freiwilliges Feedback an den Template-Autor über die Arbeitsweise, nie über das Projekt.
`feedback`: `off` \| `confirm` \| `automatic` \| `manual` \| `local` (dieses Projekt sendet nie etwas an den
Template-Autor; Befunde werden stattdessen hier zu Backlog-Einträgen). `feedback-cadence` ist eine Obergrenze:
`manual` \| `immediate` \| `hourly` \| `daily` \| `weekly` \| `adaptive`. `feedback-scope`: `a`
Metriken, `b` Regel- und Strukturänderungen, `c` Tool-Nutzung (Zähler der seit dem letzten Senden genutzten Template-Skills/-Scripte; deine eigenen nur als ein `own`-Zähler). Die vollständige Kopie jeder gesendeten Nutzlast bleibt
lokal (`.act-local/feedback/sent/`, per gitignore ausgeschlossen) — das Journal bekommt zudem einen Eintrag pro Tag mit einer Zeile je Senden
(Uhrzeit, Art, Anzahl der Einträge, Art und Titel jedes Eintrags, nie dessen Text). Eine Nachricht, die du selbst schreibst
(`feedback: <text>`), geht immer raus, auch bei `off` (aber nie bei `local`), zusammen mit dem Template-Commit und der
zufälligen Projekt-Kennung (eine Antwortadresse nur, wenn du eine nennst). Details: `.act/rules/topics/feedback.md`.

## Update
<!-- source: 2438a24ce0992602 -->
| Schlüssel | Wert |
| :--- | :--- |
| `update-channel` | <update-channel> |
| `advisory-check` | on |

`update-channel`: `release` \| `latest`. Mit `release` (dem Standard) bietet `act-update` nur das neueste stabile
Release-Tag der Template-Quelle an, und der Sitzungsstart meldet nur dieses; mit `latest` folgt es der Spitze des
Default-Branches der Quelle. `--channel` bei `update.py` überschreibt den Wert für einen Lauf. Details:
`.act/skills/act-update/SKILL.md`.

`advisory-check`: `on` \| `off`. `on` (Standard; ein fehlender Schlüssel gilt als `on`): Die tägliche Hintergrundprüfung
fragt bei der Template-Quelle auch nach Warnungen zu Template-Versionen mit einem bekannten ernsten Problem und zeigt die,
die auf deine installierte Version zutreffen (Sitzungsstart, Statuszeile, Board, Inbox), bis du aktualisierst oder sie
quittierst; `off` fragt und zeigt nichts. Die Abfrage läuft mit dem Hintergrundlauf von `update-check`, `update-check: off`
stoppt sie also ebenfalls. Details: `python .act/scripts/advisory.py --help`.

## Archive
<!-- source: b60acf3a738d011a -->
| Schlüssel | Wert |
| :--- | :--- |
| `archive-compact` | 30d 300 |

Eine erledigte Aufgabe, ein Backlog-Eintrag oder ein Inbox-Eintrag wird von `entries.py archive` nach `docs/ai/work/archive/`
verschoben; dort wird nichts gelöscht. Dasselbe gilt für eine Konzeptdatei (`docs/ai/concept/*.md`,
`docs/project/concepts/**/*.md`), die entschieden oder gebaut ist: `entries.py archive <path>` verschiebt auch sie (Links auf
sie folgen). `act-compact` faltet die Einzeldateien später in ihre Monatsdatei (`Q-`, `T-`, `B-`, `U-<YYYY-MM>.md`, Konzepte in
`other-<YYYY-MM>.md`) mit einer Übersicht `<YYYY-MM>.md`; erst dann ist die Einzeldatei weg, und Git hält ihren vollen Text
weiterhin. Eine Zeile `done-entries`, die eine ältere Template-Version geschrieben hat, wird ignoriert; das Update entfernt sie.

`archive-compact`: `<n>d <n>` \| `off`. `entries.py compact` ist für das Archiv oder den Journal-Ordner fällig, sobald
sein ältester einzelner Eintrag älter als diese Anzahl Tage ist oder der Ordner mehr als diese Anzahl Einzeldateien
enthält; der Sitzungsstart sagt das einmal am Tag, mit der Zahl der Einträge (`act-compact`). Zusammengeführt werden nur Einträge, die vor mehr als 7 Tagen archiviert
wurden, wörtlich und mit einer Monatsübersicht `archive/YYYY-MM.md` aus einer Zeile je Eintrag; kein Worker wirkt mit.
Ein fehlender oder fehlerhafter Wert zählt als `30d 300`; im Team-Modus erscheint der Hinweis nur auf dem Default-Branch.

## Tips
<!-- source: 1a90246f22239098 -->
| Schlüssel | Wert |
| :--- | :--- |
| `tips` | occasionally |

`never` \| `occasionally` (höchstens einmal pro Sitzung und einmal am Tag) \| `regularly` (einmal pro
Sitzung). Tipps stammen aus `.act/tips.md` und verschwinden, sobald du die Funktion nutzt. Deine eigenen Erinnerungen
in `docs/ai/local/reminders.md` sind von diesem Schlüssel nicht betroffen.

## Roles
<!-- source: b47e2c80c025928b -->
| Rolle | Tier | Reasoning | Modell |
| :--- | :--- | :--- | :--- |

Standardmäßig leer: jede Rolle läuft mit dem Tier/Reasoning, das das Template mitliefert. Eine Zeile füllen, um
Tier und/oder Reasoning einer Rolle zu überschreiben, oder `Model` direkt setzen — ein gefülltes `Model` hat Vorrang vor `Tier`.
Der Name eines Skills in der Spalte `Role` (z. B. `act-prepare`) überschreibt das eigene `reasoning` dieses Skills für dieses Projekt; dort zählt nur `Reasoning`.
