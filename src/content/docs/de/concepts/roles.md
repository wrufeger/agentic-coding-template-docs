---
title: Rollen und Worker
description: Der Orchestrator, die Worker-Rollen, Tiers, Caps, Write Scope und was ein Worker nicht darf.
sidebar:
  order: 2
sourceHash: 8d88dae39fd71f46110a96b9548d400b64f0841c1bb77adf77716613401208cd
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
| `reviewer` | Kritische Prüfung vor der Abnahme; ALLOW oder BLOCK. |
| `doc-writer` | Änderungen an `docs/project/`, nie an `docs/ai/`. |
| `test-writer` | Tests für bestehenden Code oder Test-first aus einem Konzept. |
| `quick-check` | Feste, lesende Abfragen ohne Bewertung. |
| `debugger` | Findet die Ursache eines Fehlers per Hypothese, nur lesend. |
| `optimizer` | Poliert neuen Code auf Kürze und Lesbarkeit, optional. |
| `expert-solver` | Eskalation nach zwei gescheiterten Versuchen. |

Modell, Tier, Reasoning und Werkzeuge jeder Rolle: [Rollen-Referenz](/agentic-coding-template-docs/de/reference/roles/).
Eine Rolle läuft nur in Claude Code als Sub-Agent; andere Werkzeuge bekommen die Regeln und Skills als Anweisungen.

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
aus Pfaden relativ zum Projekt; `Write scope: none` heißt nur lesend; ein Bereich `dir/**` deckt auch das Anlegen von `dir` selbst ab. Eckige Klammern in einem Muster werden wörtlich gelesen, `server/api/[id]/**` meint also den Ordner namens `[id]`, und ein Shell-Befehl, dessen Platzhalter über den Bereich hinausreicht, wird abgelehnt. Beides prüfen Hooks mechanisch (`worker-cap`,
`worker-write-scope` in `docs/ai/config.md` § Checks, jeweils `block`, `warn` oder `off`).

## Was ein Worker nicht darf

- Nie committen und nie nach `docs/ai/` schreiben.
- Dich nie direkt fragen: offene Fragen gehen mit dem Ergebnis an den Orchestrator zurück.
- Git ist nur lesend (`status`, `diff`, `log`, `show`).
- Nie einen weiteren Worker starten. Sollte eine Aufgabe geteilt werden, sagt er das, und der Orchestrator entscheidet.
- Ein Ergebnis samt Beleg in höchstens 40 Zeilen liefern, keine Rohdaten.

## Scheitern und Kosten

Ein Worker, der dieselbe Aufgabe zweimal nicht schafft, bekommt keinen dritten identischen Versuch: Der
Orchestrator schärft den Auftrag einmal nach oder übergibt ihn mit dem vollständigen Fehlerkontext an
`expert-solver`. Nach dem Annehmen, Nacharbeiten oder Eskalieren eines Ergebnisses hält er den Ausgang mit
`usage.py --outcome` fest; ab genug solchen Einträgen schlägt `doctor.py` ein anderes Tier vor, und du
entscheidest. Der Orchestrator fragt außerdem einen laufenden Worker nicht wiederholt ab. Eine Ergänzung von dir, die zu einem laufenden Auftrag passt, geht sofort an diesen Worker, oder der Worker wird gestoppt und neu beauftragt, wenn ein neuer Lauf günstiger ist als zwei. Ein größerer Write Scope oder ein höherer Cap heißt immer neu beauftragen, weil beide nur einmal beim Start des Workers gelesen werden.
