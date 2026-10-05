---
title: "Skills"
description: "Alle Skills des Templates mit ihrer einzeiligen Beschreibung."
sidebar:
  order: 2
---

:::note
Diese Seite wird aus dem Template 2.0.0 (Commit 1829319) erzeugt; die deutschen Texte stammen aus einem Katalog unter `src/translations/de/reference/`. Nicht von Hand ändern, neu erzeugen mit `npm run gen`.
:::

28 Skills. Ein Skill ist eine wiederverwendbare Prozedur, die der Assistent auf Anfrage oder dann ausführt, wenn seine Beschreibung zur Situation passt.

## act

Listet die Skills des Projekts mit einer einzeiligen Beschreibung aus dem Frontmatter jedes Skills, wie eine Man-Page; zu einem Namen zeigt sie diesen Skill vollständig. Verwenden, wenn gefragt wird, welche Skills oder Befehle es gibt, oder nach den genauen Anweisungen eines Skills.

Quelle: `.act/skills/act/SKILL.md`

## act-a11y

Prüft eine Oberfläche auf Barrierefreiheit und arbeitet die Befunde nach Schwere ab - Tastaturbedienung, Fokus, Kontrast, Beschriftungen, Struktur. Verwenden, wenn gebeten wird, Barrierefreiheit zu prüfen, ob etwas mit einem Screenreader nutzbar ist, oder gegen WCAG.

Quelle: `.act/skills/act-a11y/SKILL.md`

## act-adopt

Einmalige Übernahme der Doku und KI-Werkzeuge eines bestehenden Projekts in das Layout dieses Templates - altes Template, fremdes Template oder eine selbstgebaute Struktur, alles über denselben Weg. Statt eines einfachen init.py --target verwenden, sobald das Projekt schon eigene Doku oder KI-Werkzeuge hat, oder wenn gebeten wird, die Doku/KI-Werkzeuge eines bestehenden Projekts zu übernehmen bzw. zu migrieren.

Quelle: `.act/skills/act-adopt/SKILL.md`

## act-audit-docs

Prüft docs/project gegen den tatsächlichen Code und bringt veraltete Einträge auf Stand - Architektur, Coding-Regeln, Tests, Features, Entscheidungen. Verwenden nach einer Feature-Welle, vor einer Übergabe oder wenn docs/project veraltet sein könnte.

Quelle: `.act/skills/act-audit-docs/SKILL.md`

## act-bug

Behebt einen gemeldeten Bug - reproduzieren, Ursache eingrenzen, dann die Behebung mit einem Test belegen, der vor der Änderung rot und danach grün ist. Verwenden, wenn ein Bug gemeldet wird, etwas kaputt ist oder gebeten wird, ein bestimmtes Verhalten zu debuggen.

Quelle: `.act/skills/act-bug/SKILL.md`

## act-check-translations

Prüft die Übersetzungsdateien eines Projekts auf Vollständigkeit und Konsistenz - fehlende, überzählige und leere Schlüssel, nicht passende Platzhalter, im Code verwendete, aber nicht definierte und definierte, aber unbenutzte Schlüssel - und arbeitet die Befunde ab. Verwenden, wenn gebeten wird, Übersetzungen oder i18n zu prüfen, ob alle Sprachen vollständig sind, oder nach dem Hinzufügen einer Sprache oder neuer UI-Texte.

Quelle: `.act/skills/act-check-translations/SKILL.md`

## act-commit

Schließt eine akzeptierte Aufgabe ab - Beleg prüfen, archivieren, Journal aktualisieren, per Pathspec committen. Verwenden direkt nach der Abnahme einer Aufgabe, wenn ihr Beleg (ein Testlauf, ein externer Aufruf, ein Commit) vorliegt.

Quelle: `.act/skills/act-commit/SKILL.md`

## act-deps

Aktualisiert Abhängigkeiten - Alter und bekannte Lücken erfassen, Patch/Minor bündeln, je Major ein Commit nach Lektüre des Changelogs, nach jedem Schritt grüne Checks. Verwenden, wenn Abhängigkeiten veraltet sind, ein Security Advisory zu prüfen ist oder gebeten wird, Pakete zu aktualisieren.

Quelle: `.act/skills/act-deps/SKILL.md`

## act-design-assets

Erstellt Grafiken, die im Projekt bleiben - Logo, Icon-Set, Illustration, Favicons - als handgeschriebenes SVG oder über ein Bildmodell, geprüft und im Repo abgelegt. Verwenden, wenn gebeten wird, ein Logo, Icons, ein Favicon-Set oder ein Produktbild zu gestalten.

Quelle: `.act/skills/act-design-assets/SKILL.md`

## act-design-build

Setzt eine Komponente oder Seite nach einer Vorlage um und prüft das Ergebnis selbst im Browser - in Runden, bis es passt. Verwenden, wenn gebeten wird, eine Komponente nach einem Screenshot zu bauen, eine gewählte Variante umzusetzen oder einen Seitenentwurf in Code zu überführen.

Quelle: `.act/skills/act-design-build/SKILL.md`

## act-design-ideas

Erzeugt drei bis vier Design-Varianten als Vorschaubilder, aus einer Beschreibung, Screenshots oder Weblinks - zur Diskussion, bevor Code existiert. Verwenden, wenn gebeten wird um Design-Ideen, Varianten für eine Komponente oder Seite, oder wie etwas aussehen könnte.

Quelle: `.act/skills/act-design-ideas/SKILL.md`

## act-doctor

Gleicht Projekt- und Template-Stand ab - mechanische Prüfungen nach jedem Update (veraltete Overrides, tote IDs, verwaiste Bridges), inhaltliche Prüfungen nur auf Wunsch oder für Regeln, die ein Update gerade geändert hat. Verwenden, um Abweichungen vom Template zu prüfen, nach einem Update oder wenn gefragt wird, ob lokale Overrides noch sinnvoll sind.

Quelle: `.act/skills/act-doctor/SKILL.md`

## act-export-settings

Schreibt die eigenen Regelabweichungen dieses Projekts, optional auch eigene Scripts/Checklisten/Agents/Skills/Topics, in eine portable Settings-Datei für ein anderes Projekt oder zur Durchsicht vor dem Teilen. Verwenden, um das Setup dieses Projekts an ein neues Projekt zu übergeben oder um zu prüfen, was ein Settings-Export preisgeben würde, bevor er irgendwohin geht.

Quelle: `.act/skills/act-export-settings/SKILL.md`

## act-feedback

Sendet Feedback an den Template-Autor zur Arbeitsmethode selbst - eine Regel, ein Workflow, ein Script oder ein Skill, der geholfen hat oder fehlte - nie Projektspezifisches. Verwenden, wenn gebeten wird, Feedback zu senden, etwas ans Template zurückzumelden oder einen Bug im Template zu notieren.

Quelle: `.act/skills/act-feedback/SKILL.md`

## act-idea

Nimmt eine Idee, ein Feature oder einen Änderungswunsch auf - prüfen, was existiert, Optionen mit Empfehlung darlegen, eine Entscheidung einholen, dann Aufwand und fehlende Werkzeuge schätzen und als Backlog-Eintrag und Aufgabe ablegen. Verwenden, wenn ein Feature oder eine Änderung vorgeschlagen wird oder bei "can we add X", "it would be good if", "change request".

Quelle: `.act/skills/act-idea/SKILL.md`

## act-integrations

Prüft, welche Wege von diesem Projekt zu seinem Repo-Host und Issue-Tracker führen (REST-Token, MCP-Server), was jeder kann, und hält es in docs/project/integrations.md fest. Lesende Proben, nie ein Schreibzugriff. Schlägt auf Wunsch auch MCP-Server aus dem Katalog (.act/mcp-catalog.md) vor, z. B. bei "which MCP servers fit?", und richtet einen erst nach einem Ja ein. Verwenden, wenn gefragt wird, welcher GitHub/GitLab-Zugriff besteht, vor act-pr oder act-issue, wenn die Datei fehlt oder älter als 30 Tage ist, nachdem sich ein Token oder MCP-Server geändert hat, oder wenn der Mensch fragt, welche MCP-Server oder Tools zum Projekt passen.

Quelle: `.act/skills/act-integrations/SKILL.md`

## act-issue

Liest, erstellt, kommentiert und schließt Issues und Stories von GitHub oder GitLab und startet die Arbeit daran. Verwenden bei "show issues", "show my open stories", "show issue 42", zum Erstellen, Kommentieren oder Schließen eines Issues oder bei "start work on issue 42".

Quelle: `.act/skills/act-issue/SKILL.md`

## act-load-settings

Importiert eine Settings-Datei (Ausgabe von act-export-settings) in dieses Projekt - mechanische Prüfungen entscheiden selbst über neu/identisch/tot, inhaltliche Überschneidungen gehen zur Beurteilung an ein Modell, alles Ungeklärte landet in der Inbox, statt stillschweigend angewendet zu werden. Verwenden, wenn eine settings.md- oder settings.zip-Datei zum Einspielen in dieses Projekt übergeben wird.

Quelle: `.act/skills/act-load-settings/SKILL.md`

## act-perf

Verbessert die Performance eines benannten, konkreten Teils des Systems - erst messen, Hypothese bilden, eine Sache ändern, erneut messen, vergleichen. Verwenden, wenn etwas als langsam gemeldet wird oder gebeten wird, eine Seite, Query oder einen Endpoint zu beschleunigen.

Quelle: `.act/skills/act-perf/SKILL.md`

## act-pr

Bereitet einen Pull Request (GitHub) oder Merge Request (GitLab) aus dem Diff gegen den Zielbranch vor und legt ihn erst nach dem ausdrücklichen Ja des Menschen an. Verwenden, wenn gebeten wird, einen Pull Request zu öffnen, einen Merge Request anzulegen, eine PR-Beschreibung zu schreiben oder bei "send this branch for review".

Quelle: `.act/skills/act-pr/SKILL.md`

## act-prepare

Bereitet einen größeren Block so vor, dass er ohne Unterbrechung läuft - recherchieren, was existiert, in Aufgaben schneiden, Bereitschaft prüfen, dann alles Offene in einem Bündel fragen. Verwenden beim Planen eines Features, bei "plan this out", vor einem Block, der unbeaufsichtigt laufen soll, oder wenn der Mensch sagt, dass er nicht da ist.

Quelle: `.act/skills/act-prepare/SKILL.md`

## act-refactor

Strukturiert bestehenden Code um, ohne sein Verhalten zu ändern - Ziel und Umfang festhalten, das Testnetz prüfen, in kleinen Schritten umbauen, nach jedem mit Tests verifizieren. Verwenden, wenn gebeten wird, Code zu refactoren, aufzuräumen oder umzustrukturieren, ohne zu ändern, was er tut.

Quelle: `.act/skills/act-refactor/SKILL.md`

## act-release

Bereitet ein neues Release vor - Voraussetzungen prüfen, eine Semantic Version wählen, aus den Commits einen lesbaren Changelog erzeugen, taggen. Verwenden, wenn gebeten wird, ein Release vorzubereiten, eine neue Version zu veröffentlichen oder einen Changelog zu erzeugen.

Quelle: `.act/skills/act-release/SKILL.md`

## act-seo

Prüft die Seiten eines Projekts im Code auf grundlegende Suchmaschinenoptimierung - Title und Description, Überschriften, lang, Canonical, Open Graph, Alt-Texte von Bildern, interne Links, robots.txt und Sitemap - und arbeitet die Befunde ab. Verwenden, wenn gebeten wird, SEO zu prüfen, warum Seiten schlecht gefunden werden, oder vor dem Start einer Website.

Quelle: `.act/skills/act-seo/SKILL.md`

## act-setup

Richtet diesen Checkout als Projekt ein oder dockt ihn an ein bereits bestehendes an - das Erste, was in einem frischen Template-Klon läuft, und immer, wenn der Besitzer bittet, ein Projekt einzurichten, zu initialisieren oder zu installieren. Auslöser sind unter anderem "setup", "initialize", "install", "richte ... ein", "neues Projekt".

Quelle: `.act/skills/act-setup/SKILL.md`

## act-slides

Erstellt oder aktualisiert eine Präsentation über das Projekt - Folien als Markdown im Repo, Inhalt aus der vorhandenen Doku, exportiert nach HTML/PDF. Verwenden, wenn eine Präsentation, Folien zum Projekt oder ein Schulungs-Deck gewünscht werden.

Quelle: `.act/skills/act-slides/SKILL.md`

## act-test-gap

Findet ungetestete Bereiche in einem Scope, priorisiert nach Risiko und schließt die Lücken nach Freigabe - messen, was abgedeckt ist, eine priorisierte Liste vorschlagen, gezielte Tests schreiben, statt Coverage-Prozenten hinterherzujagen. Verwenden, wenn gebeten wird, Testlücken zu finden, die Testabdeckung eines Bereichs zu prüfen oder Tests für bestehenden Code nachzuholen.

Quelle: `.act/skills/act-test-gap/SKILL.md`

## act-update

Holt einen neueren Template-Stand ins Projekt - Diff prüfen, Zustimmung einholen, dann update.py .act/ ersetzen, Kopien auffrischen und Migrationen laufen lassen und an den Doctor übergeben lassen. Verwenden, um auf ein Template-Update zu prüfen oder es einzuspielen.

Quelle: `.act/skills/act-update/SKILL.md`
