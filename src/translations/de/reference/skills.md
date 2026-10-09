<!-- German catalog for the reference page "skills". One section per entry: the id is the heading, the
source hash ties the text to its English source. Edit the German text by hand; remove the todo marker when done.
Never translate commands, keys, ids or code. Maintained by scripts/gen-reference.mjs --skeleton and
scripts/check-translations.mjs; see README "Editing the site". -->

## act
<!-- source: 17ed0fcdf8a65861 -->
Verwenden, wenn gefragt wird, welche Skills oder Befehle es gibt, nach einer Skill-Liste oder nach den genauen Anweisungen eines Skills, oder bei einem bloßen /act bzw. /act <name>. Gibt die Skill-Tabelle mit einzeiligen Beschreibungen aus, oder den genannten Skill vollständig. Führt keinen Skill aus.

## act-a11y
<!-- source: 4495e8a6d5f3ec6c -->
Verwenden, wenn gebeten wird, Barrierefreiheit zu prüfen, ob etwas mit Tastatur oder Screenreader nutzbar ist, oder gegen WCAG, für eine Seite oder Komponente. Liefert eine nach Schwere geordnete Befundliste und behebt die freigegebenen Befunde. Nicht für den Abgleich eines Builds mit seinem Design - dafür act-design-build.

## act-adopt
<!-- source: e3e27232fb486f54 -->
Verwenden, wenn ein Projekt schon eigene Doku oder KI-Werkzeuge hat oder wenn gebeten wird, die Doku oder KI-Werkzeuge eines bestehenden Projekts zu übernehmen bzw. zu migrieren (altes Template, fremdes Template, selbstgebaute Struktur). Übernimmt sie in acht Schritten, statt eines einfachen init.py --target. Nicht für einen leeren Ordner - dafür act-setup.

## act-audit-docs
<!-- source: c740e4dfb6130ee0 -->
Verwenden nach einer Feature-Welle, vor einer Übergabe oder wenn docs/project veraltet sein oder dem Code widersprechen könnte (Architektur, Coding-Regeln, Tests, Features, Entscheidungen). Bringt veraltete Einträge mit dem tatsächlichen Code in Einklang. Nicht für Template-Abweichungen - dafür act-doctor.

## act-bug
<!-- source: 4faa2fa89b8b67e1 -->
Verwenden, wenn ein Bug gemeldet wird, etwas kaputt ist oder gebeten wird, ein bestimmtes Verhalten zu debuggen oder zu beheben. Endet mit der Behebung, belegt durch einen Test, der vorher fehlschlägt und nachher besteht. Nicht für Aufräumen oder Refactoring, das nebenbei auffällt.

## act-check-translations
<!-- source: 2c1856fee45705ec -->
Verwenden, wenn gebeten wird, Übersetzungen oder i18n zu prüfen, ob alle Sprachen vollständig sind, oder nach dem Hinzufügen einer Sprache oder neuer UI-Texte. Liefert je Sprache einen Bericht über fehlende, unbenutzte oder nicht passende Schlüssel und behebt die freigegebenen.

## act-commit
<!-- source: 1d95aa1cda43ff10 -->
Verwenden direkt nach der Abnahme einer Aufgabe, wenn ihr Beleg (ein Testlauf, ein externer Aufruf, ein Commit-Hash) vorliegt, oder wenn gebeten wird, abzuschließen und zu committen. Hinterlässt die Aufgabe archiviert und im Journal verbucht, per Pathspec committet. Wird nie von einem Sub-Agent ausgeführt.

## act-deps
<!-- source: 35b59128504491c4 -->
Verwenden, wenn Abhängigkeiten veraltet sind, ein Security Advisory zu prüfen ist oder gebeten wird, Pakete zu aktualisieren oder das Alter der Abhängigkeiten zu prüfen. Aktualisiert in nachvollziehbaren Schritten - Patch und Minor gebündelt, je Major ein Commit - mit grünen Checks nach jedem.

## act-design-assets
<!-- source: 9f679dce8901b05b -->
Verwenden, wenn gebeten wird, ein Logo, Icons, ein Favicon-Set, eine Illustration oder ein Produktbild zu gestalten, das im Projekt bleiben soll. Liefert handgeschriebenes SVG oder Bildmodell-Ausgabe, geprüft und im Repo abgelegt. Nicht für Wegwerf-Entwürfe - dafür act-design-ideas.

## act-design-build
<!-- source: 956f973d5376f3b0 -->
Verwenden, wenn gebeten wird, eine Komponente nach einem Screenshot zu bauen, eine über act-design-ideas gewählte Variante umzusetzen oder einen Seitenentwurf in Code zu überführen. Setzt sie im Projektcode um und prüft sie in bis zu drei Runden im Browser. Nicht zum Erkunden von Optionen - dafür act-design-ideas.

## act-design-ideas
<!-- source: e11513eed6696cff -->
Verwenden, wenn gebeten wird um Design-Ideen, Varianten für eine Komponente oder Seite, oder wie etwas aussehen könnte, bevor es Code gibt. Erzeugt drei bis vier Vorschaubilder aus einer Beschreibung, Screenshots oder Links. Nicht zum Bauen der gewählten Variante - dafür act-design-build.

## act-doctor
<!-- source: 6146bd82e668f597 -->
Verwenden, um Abweichungen vom Template zu prüfen, nach einem Update oder wenn gefragt wird, ob lokale Overrides noch sinnvoll sind. Führt die günstigen mechanischen Prüfungen aus (veraltete Overrides, tote IDs, verwaiste Bridges); inhaltliche Prüfungen nur auf Wunsch. Nicht zum Durchführen eines Updates - dafür act-update.

## act-export-settings
<!-- source: cbffea4fd2906cd3 -->
Verwenden, um das Setup dieses Projekts an ein neues Projekt zu übergeben oder um zu prüfen, was ein Settings-Export preisgeben würde, bevor er irgendwohin geht. Schreibt die eigenen Regelabweichungen des Projekts, optional auch Scripts, Checklisten, Agents, Skills und Topics, in eine portable Settings-Datei.

## act-feedback
<!-- source: f3d982d523e5df56 -->
Verwenden, wenn gebeten wird, Feedback zu senden, „ans Template zurückzumelden“ oder bei „feedback: <Text>“, oder wenn eine Regel, ein Workflow, ein Script oder ein Skill des Templates selbst geholfen hat, versagt hat oder fehlte, auch bei einem Bug im Template. Sendet ein Muster zur Arbeitsmethode an den Template-Autor, nie Projektspezifisches.

## act-handover
<!-- source: 333f10aac50592dc -->
Verwenden, wenn der Mensch die Sitzung übergeben oder verlassen will - „übergib“, „kann ich die Sitzung schließen“, „ist /clear sicher“, „neue Sitzung“. Prüft, dass nichts verloren geht, behebt, was sich beheben lässt, und endet mit dem Satz, der in die neue Sitzung einzugeben ist. Löscht nie von sich aus.

## act-idea
<!-- source: 3fdcc62d4bca529d -->
Verwenden, wenn ein Feature, eine Idee oder ein Änderungswunsch vorgeschlagen wird: „können wir X ergänzen“, „es wäre gut, wenn“, „Änderungswunsch“. Prüft, was existiert, legt Optionen mit Empfehlung dar und legt nach der Entscheidung eine Aufwandsschätzung als Backlog-Eintrag und Aufgabe ab. Nicht zum Planen eines entschiedenen Blocks - dafür act-prepare.

## act-integrations
<!-- source: 88dd3fba699d56ce -->
Verwenden, wenn gefragt wird, welcher GitHub- oder GitLab-Zugriff besteht, vor act-pr oder act-issue, wenn docs/project/integrations.md fehlt oder älter als 30 Tage ist, nachdem sich ein Token oder MCP-Server geändert hat, oder wenn gefragt wird, welche MCP-Server oder Tools zum Projekt passen. Hält den Zugriff lesend fest; richtet einen Katalog-Server erst nach einem Ja ein.

## act-issue
<!-- source: 98efc928d0d9c547 -->
Verwenden bei „zeig die Issues“, „zeig meine offenen Stories“, „zeig Issue 42“, zum Erstellen, Kommentieren oder Schließen eines GitHub- oder GitLab-Issues oder bei „fang mit Issue 42 an“. Deckt Issues und Stories auf dem Repo-Host ab. Nicht für Pull oder Merge Requests - dafür act-pr.

## act-load-settings
<!-- source: 32cb41348ed2cc47 -->
Verwenden, wenn eine settings.md- oder settings.zip-Datei (Ausgabe von act-export-settings) zum Einspielen in dieses Projekt übergeben wird. Mechanische Prüfungen sortieren neue, identische und tote Einträge, inhaltliche Überschneidungen gehen zur Beurteilung an ein Modell, Ungeklärtes landet in der Inbox. Nicht für einen Konflikt bei einem Template-Update - dafür act-update.

## act-perf
<!-- source: 041643742259824b -->
Verwenden, wenn etwas als langsam gemeldet wird oder gebeten wird, eine benannte Seite, Query oder einen Endpoint zu beschleunigen. Endet damit, dass genau dieser Teil messbar schneller ist, belegt durch Zahlen vor und nach einer einzelnen Änderung. Nicht für verhaltenserhaltendes Umstrukturieren - dafür act-refactor.

## act-pr
<!-- source: 1d7938ea4e7eaec4 -->
Verwenden, wenn gebeten wird, einen Pull Request zu öffnen, einen Merge Request anzulegen, eine PR-Beschreibung zu schreiben oder bei „schick diesen Branch ins Review“, auf GitHub oder GitLab. Entwirft Titel und Beschreibung aus dem Branch-Diff und legt ihn erst nach einem Ja an. Nicht für Issues - dafür act-issue; nicht für lokale Commits - dafür act-commit.

## act-prepare
<!-- source: b4296d82413eb065 -->
Verwenden beim Planen eines größeren Features oder Blocks, bei „plane das durch“, vor Arbeit, die unbeaufsichtigt laufen soll, oder wenn der Mensch sagt, dass er nicht da ist. Endet mit bereiten, bemessenen Aufgaben und allem Offenen, in einem Bündel gefragt. Nicht für eine erste Idee, der noch eine Entscheidung fehlt - dafür act-idea.

## act-refactor
<!-- source: 3a21799ad7c89044 -->
Verwenden, wenn gebeten wird, bestehenden Code zu refactoren, aufzuräumen oder umzustrukturieren, ohne zu ändern, was er tut. Arbeitet in kleinen Schritten mit Tests nach jedem, nachdem Ziel und Umfang festgehalten und das Testnetz geprüft sind. Nicht, um Code schneller zu machen - dafür act-perf.

## act-release
<!-- source: 7ff8aee054f32dc7 -->
Verwenden, wenn gebeten wird, ein Release vorzubereiten, eine neue Version zu veröffentlichen, eine Version zu taggen oder einen Changelog zu erzeugen. Ergebnis ist eine getaggte Semantic Version mit lesbarem Changelog aus den Commits. Nicht für gewöhnliche Commits - dafür act-commit.

## act-seo
<!-- source: 74e78fe24bf98aaa -->
Verwenden, wenn gebeten wird, SEO zu prüfen, warum Seiten in der Suche schlecht gefunden werden, oder vor dem Start einer Website. Liefert eine Befundliste im Seitencode (Metadaten, Überschriften, Links, robots.txt, Sitemap) und behebt die freigegebenen. Nur Code, kein Abruf der Live-Seite.

## act-setup
<!-- source: b4e6df57eca48795 -->
Verwenden, um in einem frischen Template-Klon ein Projekt einzurichten, oder wenn der Besitzer bittet, eines einzurichten, zu initialisieren oder zu installieren (Auslöser „Setup“, „initialisieren“, „installieren“, „richte … ein“, „neues Projekt“). Dockt diesen Checkout an ein Projekt an. Nicht, um bestehende Doku zu übernehmen - dafür act-adopt.

## act-slides
<!-- source: 15036eac26e40702 -->
Verwenden, wenn eine Präsentation, Folien zum Projekt, ein Vortrag oder ein Schulungs-Deck gewünscht werden. Erzeugt die Folien als versioniertes Markdown aus der vorhandenen Doku und exportiert sie nach HTML oder PDF.

## act-test-gap
<!-- source: 7afe0e3b15df3a11 -->
Verwenden, wenn gebeten wird, Testlücken zu finden, die Testabdeckung eines Bereichs zu prüfen oder Tests für bestehenden Code nachzuholen. Endet mit einer nach Risiko geordneten Liste der echten Lücken und, nach Freigabe, gezielten Tests statt Coverage-Prozenten.

## act-update
<!-- source: 951bb75daad27a96 -->
Verwenden, um auf eine neuere Template-Version in diesem Projekt zu prüfen oder sie einzuspielen („aktualisiere das Template“, „act-update“). Holt die neue Version erst herein, wenn der Diff gezeigt und ihm zugestimmt wurde. Nicht, um lokale Abweichungen zu prüfen - dafür act-doctor.

## _intro
<!-- source: 46565377cf8cbe79 -->
Ein Skill ist eine wiederverwendbare Prozedur, die der Assistent auf Anfrage oder dann ausführt, wenn seine Beschreibung zur Situation passt.
