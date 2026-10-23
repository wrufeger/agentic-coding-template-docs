---
title: Rollen und Worker
description: Der Orchestrator, die Worker-Rollen, Tiers, Caps, Write Scope und was ein Worker nicht darf.
sidebar:
  order: 2
sourceHash: ff574d6a4028cfa25e3168293c23e6327c3ac554eb5d6df3fe3b446b201b692d
---

## Orchestrator und Worker

Die Hauptsitzung ist der **Orchestrator**. Er plant, prüft, committet und ist der Einzige, der nach `docs/ai/`
schreibt. Er startet Worker, also Sub-Agenten mit einem abgegrenzten Auftrag. Du sprichst nie direkt mit einem
Worker. Eine Rolle im Chat zu nennen (`reviewer`, `explorer`) ist die Anweisung an den Orchestrator, sie
einzusetzen.

## Die Rollen

| Rolle | Wofür |
| :--- | :--- |
| `builder` | Umsetzung: Code, Migration, Tests, Konfiguration. |
| `explorer` | Lesende Recherche über viele Dateien; Funde als `path:line`. |
| `reviewer` | Kritische Prüfung vor der Abnahme; ALLOW, CONDITIONAL oder BLOCK. |
| `doc-writer` | Änderungen an `docs/project/`, nie an `docs/ai/`. |
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
Standardwert des Tiers: `light` 10, `standard` 40, `elevated` 60, `high` und `expert` 80. Der Worker bekommt am
Cap einen Hinweis und wird ab dem 1,5-Fachen des Caps abgewiesen. Außerdem nennt der Auftrag seinen Write Scope als `Write scope:`
aus Pfaden relativ zum Projekt; `Write scope: none` heißt nur lesend im Projekt. In das temporäre Verzeichnis des Systems darf jeder Worker, gleich welcher Scope, trotzdem schreiben, wenn der Pfad ausgeschrieben ist (`/tmp/...` in Bash oder sein absoluter Pfad), es sei denn, das Projekt selbst liegt dort. Ein Bereich `dir/**` deckt auch das Anlegen von `dir` selbst ab. Eckige Klammern in einem Muster werden wörtlich gelesen, `server/api/[id]/**` meint also den Ordner namens `[id]`, und ein Shell-Befehl, dessen Platzhalter über den Bereich hinausreicht, wird abgelehnt. Beides prüfen Hooks mechanisch (`worker-cap`,
`worker-write-scope` in `docs/ai/config.md` § Checks, jeweils `block`, `warn` oder `off`). Die genaue Syntax von `Cap:` und `Write scope:` und die Grenzen der Prüfungen stehen auf der [Seite zu den Prüfungen](/agentic-coding-template-docs/de/reference/topics/#checks); auch die Sperrmeldungen nennen die Syntax. Gleichzeitig laufende Worker brauchen getrennte Write Scopes: `worker-scope-overlap` lehnt einen Start ab, dessen Bereich sich mit dem eines noch laufenden Workers überschneidet. Ein Auftrag, der das Ergebnis eines anderen Workers liest, nennt diesen als `Depends on:` und startet erst, wenn jener Worker fertig ist.

## Wie ein Worker seine Regeln bekommt

Ein Worker lädt `CLAUDE.md` nicht: Die Rollen der Vorlage tragen `omitClaudeMd: true`, denn `CLAUDE.md` würde die Orchestrator-Regeln in jeden Worker-Start laden, obwohl nur die Hauptsitzung sie braucht. Stattdessen gibt ein `SubagentStart`-Hook dem Worker den Rest dessen, was `CLAUDE.md` lädt: die geteilten Regeln, die Coding-Regeln, deine eigenen Regeln aus `docs/ai/rules.md`, `CLAUDE.local.md` und das `~/.claude/CLAUDE.md` der Benutzerebene, aber nichts aus `.act/rules/orchestrator/`. Der Text kommt in Teilen unter 10.000 Zeichen und spart rund 24.000 Zeichen je Worker-Start. `python .act/scripts/rules.py --worker` zeigt die Teile. Ein Update ergänzt das Feld und die Hook-Einträge in bestehenden Rollen der Vorlage; eine eigene Rolle ohne das Feld lädt `CLAUDE.md` wie bisher. Claude Code vor 2.1.271 ignoriert das Feld, seine Worker bekommen die Regeln dann doppelt, was nur Tokens kostet. Details: [Topics](/agentic-coding-template-docs/de/reference/topics/#worker-rules).

## Was ein Worker nicht darf

- Nie committen und nie nach `docs/ai/` schreiben.
- Dich nie direkt fragen: offene Fragen gehen mit dem Ergebnis an den Orchestrator zurück.
- Git ist nur lesend (`status`, `diff`, `log`, `show`).
- Nie einen weiteren Worker starten. Sollte eine Aufgabe geteilt werden, sagt er das, und der Orchestrator entscheidet.
- Ein Ergebnis samt Beleg in höchstens 40 Zeilen liefern, keine Rohdaten.
- Jede Annahme als Annahme kennzeichnen; der Orchestrator bestätigt sie, fragt dich oder hält sie fest, nie nur im Bericht.
- Eine fehlschlagende Prüfung im Code beheben, nie durch Löschen, Überspringen oder Lockern der Prüfung; der `reviewer` sperrt das, wenn kein Grund genannt ist.

## Scheitern und Kosten

Ein Worker, der dieselbe Aufgabe zweimal nicht schafft, bekommt keinen dritten identischen Versuch: Der
Orchestrator schärft den Auftrag einmal nach oder übergibt ihn mit dem vollständigen Fehlerkontext an
`expert-solver`. Nach dem Annehmen, Nacharbeiten oder Eskalieren eines Ergebnisses hält er den Ausgang mit
`usage.py --outcome` fest; ab genug Nacharbeiten darunter schlägt `doctor.py` ein höheres Tier vor (und legt denselben Vorschlag erst nach 8 weiteren Ergebnissen erneut an), und du
entscheidest. Wenn ein Worker endet, liest der Nutzungszähler außerdem sein Transkript und hält Dauer, Schritte und Token (`fresh` und `cache`) je Rolle und Tier in `.act-local/usage.json` fest, jeweils die letzten 50 Läufe; Pausen von mehr als 30 Minuten zwischen zwei Einträgen zählen als Leerlauf und bleiben aus den Minuten heraus. `usage.py --estimates` zeigt Median und 80. Perzentil je Rolle und Tier; `usage.py --backfill` liest die vorhandenen Transkripte eines Projekts einmal ein. Die Zahlen bleiben lokal und gehen nie mit dem Feedback hinaus; nur Claude Code. Der Orchestrator fragt außerdem einen laufenden Worker nicht wiederholt ab. Eine Ergänzung von dir, die zu einem laufenden Auftrag passt, geht sofort an diesen Worker, oder der Worker wird gestoppt und neu beauftragt, wenn ein neuer Lauf günstiger ist als zwei. Ein größerer Write Scope oder ein höherer Cap heißt immer neu beauftragen, weil beide nur einmal beim Start des Workers gelesen werden.
