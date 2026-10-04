<!-- German catalog for the reference page "scripts". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## table:actlib.py
<!-- source: 8911ee0e74f116a2 -->
Gemeinsame Bibliothek für jedes Script unter .act/scripts/ und .act/hooks/ — die einzige Stelle, die weiß, wie Template und Projekt aufgelöst werden…

## table:adopt.py
<!-- source: 76f810bbadf5d455 -->
Mechanischer Ausführer einer freigegebenen Übernahmetabelle (Skill `act-adopt`, Schritte 4 und 7). Läuft aus einem Template-Checkout gegen ein Projekt, das…

## table:adopt_config.py
<!-- source: 04acfad216fda8bc -->
Übernimmt die Einstellungen einer älteren deutschen AI-CONFIG.md (der Steuerdatei des Vorgänger-Templates) in die docs/ai/config.md des Projekts…

## table:adopt_entries.py
<!-- source: 7135d10e3e6d811e -->
Stapel-Schreiber für den Inhaltsschritt einer Übernahme (Skill `act-adopt`). Das Modell liest das alte Material in dem Format, in dem es vorliegt, und schreibt…

## table:adopt_passages.py
<!-- source: 93048cc6a37b6980 -->
Mechanisches Einfügen der eigenen Passagen eines übernommenen Projekts in docs/project/coding_rules.md und docs/README.md (Skill `act-adopt`, Schritt 6…

## table:adopt_scan.py
<!-- source: cc1b929d0ace3c8f -->
Rein lesende Sichtung der Dokumentation und des KI-Werkzeug-Materials eines bestehenden Projekts vor der Übernahme (Skill `act-adopt`). Durchläuft das Ziel…

## table:board.py
<!-- source: 4bb21fb40b4a4068 -->
Erzeugt das Board — einen vollständig abgeleiteten Schnappschuss (aktueller Branch, letzter Commit, Änderungsstand, jüngste Journal-Einträge, eine Liste „Waiting for you“…

## table:doctor.py
<!-- source: 3cf9de477dcfd1f4 -->
Mechanische Hälfte des Abgleich-Skills `act-doctor` — die günstigen Prüfungen, die nach jedem Update und auf Anforderung laufen, ohne ein Modell in der…

## table:entries.py
<!-- source: c2c3cf3e6b9fc8c4 -->
Legt die kurzlebigen Eintragsdateien des Projekts an und verbucht sie — Aufgaben, Backlog-Einträge, Journal-Einträge und Einträge in docs/ai/inbox/ (Fragen…

## table:feedback.py
<!-- source: 2b08639c30cb90f8 -->
Freiwilliges Feedback eines abgeleiteten Projekts an den Template-Autor — damit aus der echten Arbeit in echten Projekten bessere Standardregeln, Scripte werden…

## table:feedback_privacy.py
<!-- source: 30db4e368a39a1b2 -->
Die Datenschutzprüfungen, die entscheiden, ob ein String als Teil einer Feedback-Nutzlast das Projekt verlassen darf (.act/scripts/feedback.py) — Muster…

## table:forge.py
<!-- source: cb93b1ee95211681 -->
Ein kleiner REST-Client für den Git-Host des Projekts (GitHub, GitHub Enterprise, GitLab.com und selbst gehostetes GitLab) — das eine Script, das die Skills…

## table:frontmatter.py
<!-- source: d5e574c6e2ab4c9a -->
Ein gemeinsamer Frontmatter-Parser für jeden „---\n...\n---\n“-Block unter .act/ und docs/ai/local/ -- früher waren es zwei: der von tiers.py…

## table:ideas.py
<!-- source: b2df8059a1b0ea78 -->
Die Ideen-Datei je Person `docs/ai/concept/ideas-<identity>.md` — eine versionierte Datei für jede Person eines Projekts, von dieser Person geschrieben…

## table:init.py
<!-- source: d2e5bd01a6c2fdf3 -->
Macht aus einem Checkout dieses Templates ein Projekt („here, in this clone“) oder dockt an ein bestehendes oder leeres Verzeichnis an („--target“). Zehn Schritte…

## table:integrations.py
<!-- source: e76bd501b0d52097 -->
Ermittelt, welche Wege von diesem Projekt zu seinem Repo-Host und Issue-Tracker führen (REST-Zugriff über forge.py, MCP-Server) und was jeder…

## table:log.py
<!-- source: ce74ae1a64c05aa5 -->
Schreibt eine Zeile in ai.log im Projektwurzelverzeichnis (AGENTS.md § „Logging (optional)“, .act/rules/topics/logging.md) und die kleinen Werkzeuge zum Lesen…

## table:manifest.py
<!-- source: da5917c3a95a3d83 -->
Erzeugt oder prüft .act/MANIFEST.json — einen SHA-256-Hash je Datei unter .act/, um lokale Änderungen am Template vor einem Update zu erkennen…

## table:rules.py
<!-- source: 5c387e9b86e110f4 -->
Liest die *wirksamen* Regeln — die Regelsätze des Templates, nachdem die Kästchen, Ersetzungen und Ergänzungen des Projekts angewendet wurden. Ein…

## table:script_docs.py
<!-- source: 406ed1258f2c9271 -->
Erzeugt .act/scripts/README.md — eine Referenz für jedes Script unter .act/scripts/, gebaut aus der eigenen `--help`-Ausgabe jedes Scripts plus einem…

## table:security_deep.py
<!-- source: 9464a5a890a12325 -->
Sicherheitsprüfung „Art C“: ein tiefer, sprachübergreifender Scan mit Semgrep über die Dateien, die seit einem Ref (Standard: das neueste Tag) geändert wurden, oder das ganze…

## table:security_scan.py
<!-- source: 5bb99ae4ad45d9af -->
Sicherheitsprüfung Art B: eine Live-Abfrage nach Schwachstellen in Bibliotheken anhand der Lock-Dateien, die ein Ökosystem tatsächlich hat, entweder als manueller Befehl…

## table:settings_export.py
<!-- source: 36814737f8168627 -->
`act-export-settings` — schreibt die eigenen Regelabweichungen des Projekts (und, mit einem Schalter, lokale Scripte/Checklisten) in eine portable Einstellungsdatei…

## table:settings_format.py
<!-- source: 14ab4c08ab4bec32 -->
Datenmodell, Parser und Serialisierer für die Einstellungsdatei („settings.md“) — der portable Schnappschuss der eigenen Regelabweichungen eines Projekts (und, in…

## table:settings_load.py
<!-- source: 62e3dfae2ddee264 -->
`act-load-settings` — importiert eine portable Einstellungsdatei (oder mehrere) in dieses Projekt: das Gegenstück zu settings_export.py. Führt dieselben…

## table:skills.py
<!-- source: bcef523f67d68b13 -->
Listet die Skills des Projekts wie eine Man-Page (Name plus einzeilige Beschreibung aus dem Frontmatter jeder `SKILL.md`) oder gibt die `SKILL.md` eines Skills aus…

## table:tiers.py
<!-- source: c7ee14df033437f0 -->
Löst Tier/Reasoning einer Rolle -- nirgends sonst unter .act/ steht ein echter Modellname -- in ein konkretes Paar aus Modell-Alias und Effort für ein…

## table:update.py
<!-- source: e5451d99c921d588 -->
Holt einen neueren Stand des Templates in ein bereits initialisiertes Projekt. Zehn Schritte, immer in derselben Reihenfolge: das Template in ein temporäres Verzeichnis holen…

## table:usage.py
<!-- source: 5f4b17ec0429dca6 -->
Lokaler Nutzungszähler — wie oft jede Rolle startet, mit welchem Tier/Modell; wie oft jeder Skill, Slash-Befehl, jedes Script und jede Checkliste genutzt wird…

## _intro
<!-- source: 374e60a4342af8ad -->
Eine Zeile je Script unter `.act/scripts/`; die Abschnitte je Script weiter unten sind jeweils die eigene `--help`-Ausgabe des Scripts, nicht von Hand abgetippt. Neu erzeugen mit `python .act/scripts/script_docs.py`, nachdem die Argumente eines Scripts geändert wurden — `--check` erkennt Abweichungen, und `doctor.py` meldet sie als Befund.
