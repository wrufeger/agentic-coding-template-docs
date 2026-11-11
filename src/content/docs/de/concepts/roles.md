---
title: Rollen und Worker
description: Der Orchestrator, die Worker-Rollen, Tiers, Caps, Write Scope und was ein Worker nicht darf.
sidebar:
  order: 2
sourceHash: 416e79db940097eadb21344fd5f2ad8299ca99c97634d90a302d6ceed6c5ffcd
---

## Orchestrator und Worker

Die Hauptsitzung ist der **Orchestrator**. Er plant, prüft, committet und ist der Einzige, der nach `docs/ai/`
schreibt. Er startet Worker, also Sub-Agenten mit einem abgegrenzten Auftrag. Du sprichst nie direkt mit einem
Worker. Eine Rolle im Chat zu nennen (`reviewer`, `explorer`) ist die Anweisung an den Orchestrator, sie
einzusetzen. Er gibt Arbeit nur ab, wo es sich lohnt: unabhängige Teile, die parallel laufen, die Prüfung, Ausgabe unbekannter oder großer Länge, die danach nicht mehr gebraucht wird, langes Lesen oder Läufe, die ein günstigeres Tier ebenso gut erledigt. Konkret: Recherche über mehr als drei Dateien oder in Code, dessen Stelle noch nicht bekannt ist, die Auswertung von Transkripten, Logs oder Feedback und Material über etwa 20k Token, das danach nicht mehr gebraucht wird, gehen an `explorer`, der nur Befunde und Zahlen zurückgibt; ein im Auftrag genannter Lauf der Testsuite, eine Probe oder ein Smoketest geht an `quick-check`, der Exit-Code, Fehlschläge und Zahlen zurückgibt. Eine bekannte Datei oder Stelle, wenige Tool-Aufrufe, eine kleine Änderung, einen Eintrag unter `docs/ai/`, einen Commit oder `git status` macht er selbst; ihr Review folgt trotzdem `R-code-commit`. Die Rollen des Templates gehen den eigenen Agenten des Werkzeugs vor (in Claude Code `Explore`, `general-purpose`, `Plan`).

## Die Rollen

| Rolle | Wofür |
| :--- | :--- |
| `builder` | Umsetzung: Code, Migration, Tests, Konfiguration. |
| `explorer` | Lesende Recherche über viele Dateien; Funde als `path:line`. |
| `reviewer` | Kritische Prüfung vor der Abnahme; Befunde nach Schwere, ALLOW, CONDITIONAL oder BLOCK. Er blockiert nur bei einem Fehler auf einem Pfad, den die normale Arbeit erreicht, bei einem fehlenden Teil des Auftrags, einer Sicherheitslücke oder einer abgeschwächten Prüfung; ein nur zum Brechen der Änderung gebauter Fall geht ins Backlog. |
| `doc-writer` | Änderungen an `docs/project/` und seinen Indexzeilen (`R-docs-order`), nie an `docs/ai/`. |
| `test-writer` | Tests für bestehenden Code oder Test-first aus einem Konzept. |
| `quick-check` | Feste, lesende Abfragen ohne Bewertung. |
| `debugger` | Findet die Ursache eines Fehlers per Hypothese, nur lesend. |
| `optimizer` | Poliert neuen Code auf Kürze und Lesbarkeit, optional. |
| `expert-solver` | Eskalation nach zwei gescheiterten Versuchen. |

Modell, Tier, Reasoning und Werkzeuge jeder Rolle: [Rollen-Referenz](/agentic-coding-template-docs/de/reference/roles/).
Eine Rolle läuft nur in Claude Code als Sub-Agent; andere Werkzeuge bekommen die Regeln und Skills als Anweisungen. In Claude Code wissen `builder` und `explorer` außerdem, dass pfadgebundene Regeln unter `.claude/rules/` nur laden, wenn eine passende Datei über ein Datei-Werkzeug gelesen oder geschrieben wird, nicht durch eine Suche oder einen Shell-Befehl; sie lesen die passende Regeldatei zuerst.

## Tiers

Ein Tier sagt, wie viel Modellkapazität ein Auftrag bekommt: `light` für Lesen und Zählen, `standard` für
Umsetzung, `elevated` für Review und Sicherheitsurteile, `high` als `elevated` mit einem weiteren Reasoning-Schritt
und `expert` nur für eine Eskalation. `.act/tiers.json` ist die eine Stelle, die Tiers auf konkrete Modelle
abbildet, heute nur für Claude Code. Um eine einzelne Rolle zu ändern, füllst du eine Zeile in `## Roles` von
`docs/ai/config.md`.

## Caps und Write Scope

Jeder Auftrag nennt sein Tier, eine Schätzung und ein Cap als `Cap: <n>` Tool-Aufrufe. Ohne Angabe gilt der
Standardwert des Tiers: `light` 10, `standard` 40, `elevated` 60, `high` und `expert` 80; das Tier ist das, das eine Zeile `Tier:` nennt, sonst das der Rolle, und ein in `docs/ai/config.md` § Roles für die Rolle gesetztes Tier ersetzt das der Rolle. Der Worker bekommt am
Cap einen Hinweis und wird ab dem 1,5-Fachen des Caps abgewiesen. Außerdem nennt der Auftrag seinen Write Scope als `Write scope:`
aus Pfaden relativ zum Projekt; `Write scope: none` erlaubt keine Schreibzugriffe außer unter `.act-local/tmp/`. Ein Auftrag, der Tests oder Proben ausführt, fügt eine Zeile `Tests:` mit dem Verzeichnis hinzu, in dem sie laufen (`Tests: <glob>[, <glob> ...]`); Worker führen Tests nur damit aus, und nur die, die die Änderung betreffen, während die Prüfungen des Commits (Lint, Typecheck, der Testbefehl) einmal auf dem abgenommenen Stand vor dem Commit laufen, durch den Orchestrator; ein roter Test wird allein wiederholt, nie die ganze Suite. Mit einer `Write scope:`-Zeile wird ein Ziel im temporären Verzeichnis des Systems oder im Scratchpad des Workers wie jedes andere Ziel außerhalb des Bereichs abgelehnt. Wegwerfmaterial gehört nach `.act-local/tmp/<task-id>-<slug>/` (`.act-local/tmp/<YYYYMMDD>-<slug>/` für Arbeit ohne Aufgabe), und `.act-local/tmp/` des Projekts steht jedem Worker offen, gleich welchen Bereich er hat; der Auftrag braucht dafür keinen Eintrag im Bereich (`R-work-throwaway`). Ein Worker, dessen Auftrag keine `Write scope:`-Zeile hat, wird von dieser Prüfung nicht eingeschränkt. Ein Bereich `dir/**` deckt auch das Anlegen von `dir` selbst ab. Eckige Klammern in einem Muster werden wörtlich gelesen, `server/api/[id]/**` meint also den Ordner namens `[id]`, und ein Shell-Befehl, dessen Platzhalter über den Bereich hinausreicht, wird abgelehnt. Beides prüfen Hooks mechanisch (`worker-cap`,
`worker-write-scope` in `docs/ai/config.md` § Checks, jeweils `block`, `warn` oder `off`). Die genaue Syntax von `Cap:` und `Write scope:` und die Grenzen der Prüfungen stehen auf der [Seite zu den Prüfungen](/agentic-coding-template-docs/de/reference/topics/#checks); auch die Sperrmeldungen nennen die Syntax. `worker-write-scope` liest außerdem Inline-Code von Interpretern (`python`, `python3`, `py` oder `node` mit `-c`/`-e` oder Code aus Heredoc, Here-String oder Pipe, in Bash oder PowerShell): Er lehnt ab, wenn der Code einen Schreibaufruf und einen ausgeschriebenen Pfad außerhalb des Bereichs enthält. Das ist Best Effort; Script-Dateien, zur Laufzeit gebildete Pfade und `subprocess` bleiben unsichtbar. Gleichzeitig laufende Worker brauchen getrennte Write Scopes: `worker-scope-overlap` lehnt einen Start ab, dessen Bereich sich mit dem eines noch laufenden Workers überschneidet, ebenso einen, dessen `Tests:`-Verzeichnis den Write Scope eines laufenden Workers trifft oder umgekehrt (ein halb geschriebener Baum ließe den Lauf scheitern); die Hauptsitzung bekommt nur einen Hinweis, nie eine Ablehnung; die Ablehnung nennt drei Auswege: getrennte Bereiche, einen gemeinsamen Auftrag für Aufgaben an denselben Dateien (nach `R-cost-delegate`: ein Bereich, ein höheres Cap, ein Review) oder Warten; ein Worker, der nicht mehr gebraucht wird, wird mit `TaskStop` angehalten, das gibt seinen Bereich sofort frei, und ein Worker, der mit einer Nachricht fortgesetzt wird, behält den Bereich seines Auftrags. Arbeit, die voraussichtlich länger als etwa fünf Minuten läuft, wird zuerst auf unabhängige Teile geprüft, die parallel laufen können, etwa Test- und Probenläufe, Fallkataloge, Aufträge über getrennte Dateien oder ein Review je geprüfter Stelle (`R-cost-delegate`). Ein Auftrag, der das Ergebnis eines anderen Workers liest, nennt diesen als `Depends on:` und startet erst, wenn jener Worker fertig ist.

## Wie ein Worker seine Regeln bekommt

Ein Worker lädt `CLAUDE.md` nicht: Die Rollen der Vorlage tragen `omitClaudeMd: true`, denn `CLAUDE.md` würde die Orchestrator-Regeln in jeden Worker-Start laden, obwohl nur die Hauptsitzung sie braucht. Stattdessen gibt ein `SubagentStart`-Hook dem Worker den Rest dessen, was `CLAUDE.md` lädt: die geteilten Regeln, die Coding-Regeln, deine eigenen Regeln aus `docs/ai/rules.md`, `CLAUDE.local.md` und das `~/.claude/CLAUDE.md` der Benutzerebene, aber nichts aus `.act/rules/orchestrator/`. Der Text kommt in Teilen unter 10.000 Zeichen über bis zu 12 `SubagentStart`-Einträge und spart rund 20.000 Zeichen je Worker-Start. Reichen 12 nicht, nennt der letzte Eintrag die Dateien, die der Worker selbst liest, und `rules.py --worker` und `act-doctor` warnen, welche Regeldateien zu kürzen sind. `python .act/scripts/rules.py --worker` zeigt die Teile. Ein Update ergänzt das Feld und die Hook-Einträge in bestehenden Rollen der Vorlage; eine eigene Rolle ohne das Feld lädt `CLAUDE.md` wie bisher. Claude Code vor 2.1.271 ignoriert das Feld, seine Worker bekommen die Regeln dann doppelt, was nur Tokens kostet. Details: [`rules.py`](/agentic-coding-template-docs/de/reference/scripts/#rulespy).

## Was ein Worker nicht darf

- Nie committen und nie nach `docs/ai/` schreiben.
- Dich nie direkt fragen: offene Fragen gehen mit dem Ergebnis an den Orchestrator zurück.
- Einen Schreibzugriff, den eine Prüfung abgelehnt hat, nie auf anderem Weg machen (Interpreter, Script, anderes Werkzeug); die Ablehnung mit dem Ergebnis melden.
- Nie die Dateien ändern, die `R-safe-git-metadata` schützt (Git-Hooks, Claude-Einstellungen, Agents und Skills, `.mcp.json`, `.envrc`, Editor-Tasks). Neben `git-metadata-guard` vergleicht die Prüfung `protected-watch` sie nach jedem Tool-Aufruf mit einem Snapshot: Eine Änderung in einem Aufruf des Workers wird sofort zurückgesetzt, die geänderte Fassung bleibt unter `.act-local/protected-watch/kept/`, und du und der Orchestrator werden benachrichtigt. Siehe die [Seite zu den Prüfungen](/agentic-coding-template-docs/de/reference/topics/#checks).
- Git ist nur lesend (`status`, `diff`, `log`, `show` sowie `stash list` und `stash show`).
- Nie einen weiteren Worker starten. Sollte eine Aufgabe geteilt werden, sagt er das, und der Orchestrator entscheidet.
- Ein Ergebnis samt Beleg in höchstens 40 Zeilen liefern, keine Rohdaten.
- Jede Annahme als Annahme kennzeichnen; der Orchestrator bestätigt sie, fragt dich oder hält sie fest, nie nur im Bericht.
- Eine fehlschlagende Prüfung im Code beheben, nie durch Löschen, Überspringen oder Lockern der Prüfung; der `reviewer` sperrt das, wenn kein Grund genannt ist.

## Scheitern und Kosten

Ein Worker, der dieselbe Aufgabe zweimal nicht schafft, bekommt keinen dritten identischen Versuch: Der
Orchestrator schärft den Auftrag einmal nach oder übergibt ihn mit dem vollständigen Fehlerkontext an
`expert-solver`; der wird nur nach diesen zwei Fehlschlägen gerufen (`R-role-escalate`). Nach dem Annehmen, Nacharbeiten oder Eskalieren eines Ergebnisses hält er den Ausgang mit
`usage.py --outcome` fest; `doctor.py --inbox` betrachtet die letzten 30 Ergebnisse einer Rolle bei einem Tier und legt, sobald 30 vorliegen und mindestens 60 % nachgearbeitet oder eskaliert wurden, einen Vorschlag für ein höheres Tier als kurze Inbox-Frage an (die Empfehlung steht vorn: erst die Fälle ansehen), die Zahlen in einem eigenen Inbox-Report; ein angelegter Vorschlag kommt auch am selben Tag nicht wieder, bis 30 weitere Ergebnisse vorliegen, und du
entscheidest (Einzelheiten: [Tiers und Reasoning](/agentic-coding-template-docs/de/concepts/reasoning/#caps)). Wenn ein Worker endet, liest der Nutzungszähler außerdem sein Transkript und hält Dauer, Schritte und Token (`fresh` und `cache`) je Rolle und Tier in `.act-local/usage.json` fest, jeweils die letzten 50 Läufe; Pausen von mehr als 30 Minuten zwischen zwei Einträgen zählen als Leerlauf und bleiben aus den Minuten heraus. `usage.py --estimates` zeigt Median und 80. Perzentil je Rolle und Tier; `usage.py --backfill` liest die vorhandenen Transkripte eines Projekts einmal ein. Die Zahlen bleiben lokal und gehen nie mit dem Feedback hinaus; nur Claude Code. Der Orchestrator fragt außerdem einen laufenden Worker nicht wiederholt ab. Eine Ergänzung von dir, die zu einem laufenden Auftrag passt, geht sofort an diesen Worker, oder der Worker wird gestoppt und neu beauftragt, wenn ein neuer Lauf günstiger ist als zwei. Ein größerer Write Scope oder ein höherer Cap heißt immer neu beauftragen, weil beide nur einmal beim Start des Workers gelesen werden.
