<!-- German catalog for the reference page "configuration". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## _intro
<!-- source: 47da14cff5a7a4f8 -->
`init` trägt die folgenden Werte aus dem ein, was es gefragt oder erkannt hat. Sie lassen sich jederzeit ändern — nichts davon erfordert einen Neuaufbau; `.act/hooks/dispatch.py` liest diese Datei beim Sitzungsstart. Diese Datei beschreibt das **Projekt** und ist versioniert. Secrets und Abweichungen pro Rechner oder pro Lauf gehören in die Umgebung, die diese Datei für den jeweiligen Lauf überschreibt, nie umgekehrt; der Sitzungsstart nennt jeden aktiven Override aus der Umgebung (nur die Namen, nie die Werte).

## _note
<!-- source: fa0fcf6cf2bcbd63 -->
Dies ist die Standard-`config.md` des Templates; Platzhalter in spitzen Klammern füllt `init` aus.

## Project
<!-- source: 8bb73a7ccca1dfb7 -->
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

`commands` ist Lint, Typecheck, Test, in dieser Reihenfolge; `(not set)` heißt, dass für diesen Platz kein Befehl
eingerichtet ist und die zugehörige Prüfung übersprungen wird (`R-code-commit`).

`run` ist der Befehl, der die Anwendung startet; `(not set)` heißt, dass keiner hinterlegt ist, ebenso bei einer config.md ohne die Zeile.

`mode` ist `solo` oder `team` und ändert **eine** Sache: wann ein Eintrag seine kurze ID bekommt. In
`solo` vergibt der Assistent sie sofort und arbeitet weiter. In `team` vergibt sie nur,
wer den Eintrag auf dem Default-Branch ablegt, sodass zwei Personen nie dieselbe Nummer vergeben können; bis dahin
ist der Dateiname das, was man zitiert. Dateiname, Ablageort und Format sind in beiden Fällen gleich, man kann also
jederzeit hin- und herwechseln — bereits vergebene IDs bleiben, nur spätere folgen dem neuen Wert. Bekannte Grenze: In einem reinen Pull-Request-Workflow, in dem der
Default-Branch nie lokal ausgecheckt wird, vergibt niemand IDs, sodass auf Feature-Branches archivierte Einträge
ohne ID bleiben. Die IDs sind
`T<n>` (Aufgabe), `B<n>` (Backlog-Eintrag), `Q<n>` (Frage) und `U<n>` (Todo für dich); eine Meldung oder Notiz hat keine.

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
<!-- source: fc852c30405eeb0e -->
| Schlüssel | Wert |
| :--- | :--- |
| `inbox-decisions` | immediate |

`immediate` (Standard) \| `at-start`. `immediate`: jede offene Entscheidung und jeder Schritt, den nur eine Person
tun kann und jetzt tun kann, kommt nach `docs/ai/inbox/`, sobald er verbucht wird, sodass die Inbox immer
alles Wartende zeigt. `at-start`: ein Backlog-Eintrag darf seine offenen Entscheidungen behalten — Kopfzeile
`decision: open`, auf dem Board gelistet —, bis die Arbeit daran beginnt (`act-prepare`); bei einer Aufgabe liegen
sie immer in der Inbox (`R-human-ask`).

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
<!-- source: eb80fadf3c49ae5c -->
| Schlüssel | Wert |
| :--- | :--- |
| `context-hint` | 150000 |
| `task-wait-hours` | 12 |

`context-hint`: eine Token-Anzahl oder `off`. Erreicht der Kontext der Sitzung (die Eingabe ihres letzten
Modellaufrufs, aus dem Transkript gelesen) diesen Wert, und erneut bei jedem weiteren Vielfachen davon, bekommt
der Assistent einen einmaligen Hinweis, an der nächsten Aufgabengrenze `/clear` oder eine neue Sitzung
vorzuschlagen (`R-work-handover`); die Statuszeile zeigt die Größe in jedem Fall als `ctx <n>k`. Jeder Schritt
einer langen Sitzung sendet den ganzen Kontext erneut, eine frische Sitzung nach einer abgeschlossenen Aufgabe
ist daher die größte Ersparnis überhaupt. `task-wait-hours`: Eine begonnene Aufgabe gilt in der Statuszeile und
auf dem Board als *wartend* statt als *laufend*, sobald ihre letzte Stand-Zeile älter als diese Stundenzahl ist,
außerdem, solange ein offenes Inbox-Todo oder eine offene Frage ihre ID nennt (Berichte und Notizen zählen nicht), oder
wenn ihre letzte Stand-Zeile mit `entries.py state <id> --wait` geschrieben wurde. Ohne datierte Stand-Zeile
zählt stattdessen der `started:`-Zeitpunkt der Aufgabe. Ein fehlender oder fehlerhafter Wert gilt als der
Standard.

## Dependencies
<!-- source: e93a0ba1929e8873 -->
| Schlüssel | Wert |
| :--- | :--- |
| `dependency-check` | once |

`never` \| `once` \| `regularly`. `once` (Standard) legt direkt nach `init` einen einmaligen Inbox-Eintrag an,
der bittet, `act-deps` auszuführen, danach nur noch auf Anforderung; `regularly` weist stattdessen beim Sitzungsstart
darauf hin, wenn der letzte `act-deps`-Lauf (ein Journal-Eintrag mit dem Titel `act-deps: ...`) älter als 30 Tage ist;
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

## Checks
<!-- source: 75013ba9d0cb8c68 -->
Jede der folgenden Prüfungen läuft vor der Aktion, die sie nennt; `block` verweigert die Aktion, `warn` erlaubt sie
mit einem Hinweis, `off` überspringt die Prüfung ganz. Eine Prüfung, die nur hinweist (markiert mit „never
refuses“), behandelt `block` wie `warn`.

| Prüfung | Wert | Schützt |
| :--- | :--- | :--- |
| `template-write-guard` | block | Schreibzugriffe unter `.act/` — stattdessen eine Projektfassung in `docs/ai/local/<same path>` ablegen |
| `session-start-refresh` | block | baut die erzeugten Brücken und das Board beim Sitzungsstart neu; `warn` meldet nur, was es erneuern würde (einmal je Änderung, nicht bei jedem Start), und schreibt nichts, hier wie im Brücken-Schritt von `update.py`; `off` überspringt es, und `update.py` meldet dann ebenfalls nur |
| `orchestrator-rules` | block | nur als Rückfall: solange `docs/ai/rules.md` die Orchestrator-Regeln nicht importiert (eine ältere, lokal geänderte Kopie), nennt sie der Sitzungsstart in Kürze; `off` überspringt es |
| `worker-nesting-guard` | block | ein Sub-Agent, der `Agent`/`Task` aufruft (keine Sub-Sub-Agenten, `R-role-worker`) — `warn` meldet ohne zu sperren, `off` überspringt es |
| `worker-write-scope` | block | ein Worker, der außerhalb der `Write scope:`-Zeile seines Auftrags schreibt (`R-cost-delegate`) — `warn` meldet ohne zu sperren, `off` überspringt es |
| `commit-pathspec` | block | `git add -A`, `git add .`, `git add --all`, `git commit -a` — stattdessen per Pathspec stagen (`R-code-commit`) |
| `git-reset-hard` | block | `git reset --hard` (Bash/PowerShell, auch `git -C <dir> ...`), solange der betroffene Arbeitsbaum nicht committete Änderungen hat (untracked Dateien zählen ebenfalls als Änderungen) oder sein eigener Arbeitsbaum nicht ermittelt werden kann — zuerst `git stash`/`git reset --soft` (`R-safe-git-reset`) |
| `recursive-delete` | block | rekursives Löschen aus der Shell (`rm -r`, `rmdir /s`, `Remove-Item -Recurse`, `find -delete`) — mit den eigenen Mitteln der Sprache oder Datei für Datei löschen (`R-safe-no-shell-delete`) |
| `secret-scan` | block | `git commit`, solange der gestagte Diff ein Schlüssel-/Token-Muster, einen privaten Schlüssel, eine `.env`-Datei oder eine Zuweisung mit hoher Entropie enthält; eine Zeile mit `act:allow-secret` ist ausgenommen (`R-safe-no-secret-diff`) |
| `security-check` | local | `off` \| `local` \| `deps` \| `full`, nicht das übliche block/warn/off. `off` führt hier nichts aus; `local`/`deps`/`full` führen alle den Scan nach gefährlichen Mustern aus (Art A: `eval`/`exec`, `shell=True`, `pickle.loads`, `yaml.load` ohne SafeLoader, `v-html`, `innerHTML =`, per String-Verkettung gebautes SQL, ... — nur für einen Coding-Regelsatz, den das Projekt in `docs/project/coding_rules.md` angekreuzt hat) bei `git commit`, stoppen beim ersten Treffer je Datei und Muster einmal mit seiner Fundstelle; die Wiederholung geht durch, und eine Zeile mit `act:allow-danger` ist ausgenommen. Eine Doku-Datei (`.md`, `.txt`, `.rst`) und alles unter `.act/` wird nie gescannt (Prosa und die eigenen Dateien des Templates, kein Projektcode). `deps`/`full` ergänzen Art B (`.act/scripts/security_scan.py`, `.act/hooks/checks/deps_scan.py`): eine Live-Abfrage nach Schwachstellen in Abhängigkeiten — `osv-scanner`, falls installiert, sonst `npm audit`/`composer audit`/`pip-audit` je Ökosystem — bei `git commit` genau für die Lock-Dateien, die dieser Commit berührt (`package-lock.json`, `composer.lock`, `requirements.txt`, `go.mod`, `Cargo.lock`, ...; ein Befund in einer Lock-Datei, die der Commit unberührt lässt, hält ihn nie auf), und einmal am Tag beim Sitzungsstart über jede Lock-Datei im Projekt (dort als eine Zeile gemeldet, ohne den Start selbst je zu verzögern). Der Scan läuft nie innerhalb des Hook-Aufrufs des Commits selbst: er läuft als abgekoppelter Hintergrundprozess, der Hook wartet kurz auf sein Ergebnis und verweigert sonst einmal („dependency scan running — commit again in a moment“); der erneute Versuch liest das fertige Ergebnis, für den Tag je Lock-Datei-Inhalt zwischengespeichert (nur festgehalten, wenn sich die Dateien während des Tool-Laufs nicht geändert haben), sodass ein wiederholter Commit nicht erneut abfragt; ein Hintergrundlauf, der die eigenen Timeouts der Werkzeuge überdauert, lässt den Commit ungeprüft mit einem Hinweis durch, statt ewig zu warten. Ein nicht akzeptierter Befund mit Schweregrad high/critical hält den Commit auf (Paket, Version, Advisory-ID, Schweregrad, behobene Version); ein niedrigerer oder unbekannter Schweregrad weist nur hin — die eigene Ausgabe von pip-audit enthält gar kein Schweregrad-Feld, ein pip-audit-Befund ist also immer „unknown“ und kann nur hinweisen, nie von sich aus den Commit aufhalten. Einen Befund bewusst akzeptieren mit einer Zeile in `docs/ai/local/security-accepted.md`: `- <advisory-id>: <reason>` (eine je Zeile; `#`-Kommentare und Leerzeilen werden ignoriert). Ein fehlendes Werkzeug weist einmal je Rechner mit dem Installationsbefehl hin und sperrt nie; ein Werkzeug- oder Netzwerkfehler weist jedes Mal hin, sperrt nie und wird höchstens eine Minute lang wiederverwendet, bevor der nächste Commit neu scannt (fail-open — Art B hat nie eine vom Template mitgelieferte Ausweichliste, siehe das Konzept). `full` führt zusätzlich Art C aus (Semgrep mit offenen Regelsätzen, dazu ein Sicherheitsdurchgang des `reviewer`) über `.act/scripts/security_deep.py`, aber nur auf Anforderung und vor einem Release (`act-release`) — nie bei jedem Commit, wie auch Art A/B nie einen schweren statischen Analyselauf ausführen |
| `worker-docs-ai` | block | ein Worker, der unter `docs/ai/` schreibt — dort schreibt nur der Orchestrator (`R-role-worker`) |
| `worker-git-write` | block | ein Worker, der einen Git-Befehl ausführt, der Baum oder Verlauf ändert (`commit`, `add`, `stash`, `checkout`, `reset`, `restore`, `merge`, `rebase`, `clean`, `push`) (`R-role-worker`) |
| `ide-mcp` | block | die eigenen Tools eines verbundenen IDE-MCP-Servers (`execute_terminal_command`, `apply_patch`, `execute_run_configuration`, ...), eingestuft als Shell/Schreiben/Ausführen ohne Ziel und genauso geprüft wie das passende Standard-Tool — ein Ziel, das sich nicht auswerten lässt, wird verweigert statt ungeprüft durchgelassen; `warn` meldet ohne zu sperren, `off` überspringt es (`topics/ide.md`) |
| `worker-cap` | block | Tool-Aufrufe eines Workers über seine `Cap: <n>`-Zeile hinaus (ohne sie: `light` 10, `standard` 40, `elevated` 60, `high`/`expert` 80) — ein Hinweis beim Cap, Verweigerung ab dem 1,5-Fachen des Caps (`R-cost-delegate`); bekannte Grenze: Ein Aufruf, den diese Prüfungen erlauben, die Berechtigungsabfrage von Claude Code selbst dann aber ablehnt, zählt trotzdem mit, da der Hook vor dem Aufruf diese Ablehnung nie sieht |
| `status-poll` | block | wiederholte Statusabfragen an einen laufenden Worker ohne echte Arbeit dazwischen — ab der zweiten in Folge verweigert (`R-cost-wait`) |
| `encoding-hint` | block | Schreiben in eine Datei, die nicht UTF-8 ist — der erste Schreibzugriff je Sitzung und Datei wird einmal mit einem Hinweis gestoppt, die Wiederholung geht durch; `warn` weist erst nach dem Schreiben hin (`R-code-encoding`) |
| `update-branch-hint` | warn | Update oder Einstellungsimport auf einem anderen Branch als dem Default-Branch: ein Hinweis, dass die anderen es erst mit dem Merge bekommen — verweigert nie, `block` zählt als `warn`, `off` lässt den Hinweis weg |
| `update-check` | block | beim Sitzungsstart: ein Hinweis, wenn `.act/` ohne `update.py` hereingeholt wurde, und — höchstens einmal am Tag — ein Hinweis, wenn das Template weitergezogen ist; verweigert nie, `off` überspringt beides |

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
<!-- source: 45264bf2783aa47d -->
| Schlüssel | Wert |
| :--- | :--- |
| `feedback` | <feedback-mode> |
| `feedback-cadence` | weekly |
| `feedback-scope` | a,b,c |

Freiwilliges Feedback an den Template-Autor über die Arbeitsweise, nie über das Projekt.
`feedback`: `off` \| `confirm` \| `automatic` \| `manual`. `feedback-cadence` ist eine Obergrenze:
`manual` \| `immediate` \| `hourly` \| `daily` \| `weekly` \| `adaptive`. `feedback-scope`: `a`
Metriken, `b` Regel- und Strukturänderungen, `c` Tool-Nutzung (Zähler der seit dem letzten Senden genutzten Template-Skills/-Scripte; deine eigenen nur als ein `own`-Zähler). Die vollständige Kopie jeder gesendeten Nutzlast bleibt
lokal (`.act-local/feedback/sent/`, per gitignore ausgeschlossen) — jedes Senden bekommt zudem eine Zeile im Journal
(Datum, Art, Anzahl der Einträge, Schema-Version, nie Inhalt). Eine Nachricht, die du selbst schreibst
(`feedback: <text>`), geht immer raus, auch bei `off`. Details: `.act/rules/topics/feedback.md`.

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
