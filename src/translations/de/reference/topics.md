<!-- German catalog for the reference page "topics". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## feedback
<!-- source: 8e66813319a3b7e4 -->
Feedback an den Template-Autor

Detailseite zu einer Regel, die sie als `topics/feedback.md` referenziert. Lies sie, wenn in
`docs/ai/config.md` § Feedback der Schalter `feedback` auf etwas anderes als `off` steht, oder wenn ein
Template-Bug gemeldet werden muss, unabhängig von diesem Schalter (siehe „Immediate trigger“ unten).
Mechanik: `.act/scripts/feedback.py` (Datenschutzprüfungen in `feedback_privacy.py`), Skill
`act-feedback`.

## ide
<!-- source: ab54a19c2036e1f1 -->
IDE-MCP-Server

Detailseite zu einer Regel, die sie als `topics/ide.md` referenziert. Wird nur geladen, wenn der Sitzungsstart
einen verbundenen IDE-MCP-Server erkennt (JetBrains `idea` und ähnliche Namen in `.mcp.json`, den
Claude-Einstellungen oder `~/.claude.json`, oder Claude Codes eigenen `ide`-Server — siehe
`_ide_mcp_connected` in `checks/session.py`). Sonst wird sie nicht geladen; für ein Projekt ohne einen solchen
Server gilt nichts davon. Der `ide`-Server von Claude Code bietet `getDiagnostics` (lesend, für alle in
Ordnung) und `executeCode` (nur Orchestrator, wie jedes Tool, das Code ausführt).

## ideas
<!-- source: 6cdeac7b19e8f2ba -->
Ideen

Detailseite, angekündigt von der Topic-Zeile des Sitzungsstarts. „ideas“ ist aktiv, wenn die eigene Ideendatei
des Sitzungsinhabers — `docs/ai/concept/ideas-<identity>.md`, Regeln für den Menschen in der `README.md` dieses
Ordners — Einträge hat, die neu oder seit der letzten Verarbeitung geändert sind; der Sitzungsstart nennt sie
in einem Hinweis `[act] ideas:`. Mechanik: `.act/scripts/ideas.py`, aufgerufen aus
`.act/hooks/checks/session.py`.

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
