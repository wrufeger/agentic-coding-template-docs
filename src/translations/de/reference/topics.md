<!-- German catalog for the reference page "topics". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## checks
<!-- source: cd4920c9b4ae9703 -->
Mechanisch geprüfte Regeln — Details

Detailseite zu den Regeln, die `topics/checks.md` nennen. Eine Regel in `.act/rules/` sagt, was verboten oder verlangt
ist; diese Seite ergänzt je Prüfung, was sie sperrt, wie sie geschaltet wird und welche Grenzen ein Besitzer kennen muss.
Wie eine Prüfung einen Befehl liest (Erlaubnislisten des Parsers, Zeitbudgets, Fehlerbehandlung), steht bei ihrem Code in
`.act/hooks/checks/` (Kopfkommentar des Moduls); die Sperrmeldungen nennen die Syntax und verweisen hierher. Die
Prüfungen werden in `docs/ai/config.md` § Checks geschaltet (`block`, `warn` oder `off`).

## docs-order
<!-- source: 8eee00eea2bb607b -->
Projektdoku-Ordnung — Details

summary: was `R-docs-order` verlangt, was `act-doctor` meldet, wie sich die Prüfung schalten lässt, wie ein Dokument verschoben wird

## feedback
<!-- source: b41a7d72dc2ef07f -->
Feedback an den Template-Autor

Detailseite zu einer Regel, die sie als `topics/feedback.md` referenziert. Lies sie, wenn in
`docs/ai/config.md` § Feedback der Schalter `feedback` auf etwas anderes als `off` steht, oder wenn ein
Template-Bug gemeldet werden muss, unabhängig von diesem Schalter (siehe „Immediate trigger“ unten; bei `local`
siehe „`feedback: local`“).
Mechanik: `.act/scripts/feedback.py` (Datenschutzprüfungen in `feedback_privacy.py`), Skill
`act-feedback`.

## id-links
<!-- source: 4363a9e55850d0bc -->
Anklickbare Eintrags-IDs

Detailseite zur optionalen Editor-Unterstützung, die Eintrags-IDs in Markdown-Dateien in Links verwandelt. Wird
vom Sitzungsstart nicht geladen und hängt an keiner Regel: lesen, wenn jemand IDs wie `T12` in seinem
Editor anklickbar haben will. Für ein Projekt, dessen Leute sie nicht installieren, gilt nichts davon.

## ide
<!-- source: 1102f8c529c9f71f -->
IDE-MCP-Server

Detailseite zu einer Regel, die sie als `topics/ide.md` referenziert. Wird nur geladen, wenn der Sitzungsstart
einen verbundenen IDE-MCP-Server erkennt (JetBrains `idea` und ähnliche Namen in `.mcp.json`, den
Claude-Einstellungen oder `~/.claude.json`, oder Claude Codes eigenen `ide`-Server — siehe
`_ide_mcp_connected` in `checks/session_context.py`). Sonst wird sie nicht geladen; für ein Projekt ohne einen solchen
Server gilt nichts davon. Der `ide`-Server von Claude Code bietet `getDiagnostics` (lesend, für alle in
Ordnung) und `executeCode` (nur Orchestrator, wie jedes Tool, das Code ausführt).

## ideas
<!-- source: e7ded355c2af8dc8 -->
Ideen

Detailseite, angekündigt von der Topic-Zeile des Sitzungsstarts. „ideas“ ist aktiv, wenn die eigene Ideendatei
des Sitzungsinhabers — `docs/ai/concept/ideas-<identity>.md`, Regeln für den Menschen in der `README.md` dieses
Ordners — Einträge hat, die neu oder seit der letzten Verarbeitung geändert sind; der Sitzungsstart nennt sie
in einem Hinweis `[act] ideas:`. Mechanik: `.act/scripts/ideas.py`, aufgerufen aus
`.act/hooks/checks/session_context.py`.

## live-systems
<!-- source: a1d03acb0e39d7c5 -->
Zugriff auf Live-Systeme

Detailseite zu `R-safe-approval` (`.act/rules/shared/10-safety.md`). Lies sie immer, wenn eine Aufgabe über das
Repo hinaus in ein erreichbares System greift: ein Server per SSH, eine Datenbank, die API eines Dienstes, ein
Container-Host, ein Router, eine Smart-Home- oder Monitoring-Instanz.

## logging
<!-- source: c8d4ca2c4fd335b0 -->
Logging

Detailseite, angekündigt von der Topic-Zeile des Sitzungsstarts. Lies sie, wenn in
`docs/ai/config.md` § Logging der Schalter `logging` auf `on` steht — die Statuszeile des Sitzungsstarts nennt
jedes Topic, dessen Schalter an ist, auch dieses, siehe `refresh_session()` in `.act/hooks/checks/session.py`.
Mechanik: `.act/scripts/log.py`, Beobachter `.act/hooks/checks/event_log.py`.

## safeguards
<!-- source: 96b06e61daf30d89 -->
Safeguard-Blocks

Detailseite zu `R-safe-block` (`.act/rules/shared/10-safety.md`). Lies sie immer, wenn ein Tool eine Anfrage
oder Aktion als riskant markiert — eine Schutzvorkehrung, ein Inhaltsfilter, eine Rechteausweitung.

## _intro
<!-- source: 8c88cf2e463d41fe -->
Eine Regel verweist auf ein Topic, wenn das Detail nur in manchen Situationen gebraucht wird.
