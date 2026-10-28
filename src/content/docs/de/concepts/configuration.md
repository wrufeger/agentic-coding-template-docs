---
title: Konfiguration
description: docs/ai/config.md steuert den Arbeitsablauf - seine Gruppen und was block, warn und off für Prüfungen bedeuten.
sidebar:
  order: 4
sourceHash: ae2cecc12ef19c1a61c572903eeb0cab2e1f15f5dce279e53cb01b28d80c238c
---

`docs/ai/config.md` ist die Datei, die steuert, wie am Projekt gearbeitet wird. Sie besteht aus Markdown-Tabellen, ein Abschnitt pro Thema. `init` trägt die Werte ein, die es erfragt oder erkannt hat; du änderst sie jederzeit. Nichts braucht einen Neuaufbau: Der Hook beim Sitzungsstart liest die Datei und meldet, was sich seit dem letzten Abgleich geändert hat. Jeder Schlüssel mit seinen erlaubten Werten steht in der [Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/); diese Seite erklärt, wofür die Gruppen da sind.

## Gruppen

- **Project**: Name, Owner, `language-chat` und `language-docs`, `stack`, die `commands` für Lint/Typecheck/Test, die `tools`, die du nutzt, und der `mode` (`solo` oder `team`, siehe [Inbox, Aufgaben und Journal](/agentic-coding-template-docs/de/concepts/work-entries/)). `language-chat` ist die Sprache, in der der Assistent mit dir spricht (`auto` folgt deinen Nachrichten); `language-docs` ist die Sprache von allem, was er unter `docs/` schreibt. `.act/` bleibt in beiden Fällen Englisch. Ein Befehl mit `(not set)` überspringt die zugehörige Prüfung vor einem Commit. `run` ist der Befehl, der die Anwendung startet; `(not set)` heißt, dass keiner hinterlegt ist.
- **Board**: `board` wählt, wohin das erzeugte Board geht (`docs`, `shared`, `local`); `board-others` schaltet den Abschnitt für Aufgaben um, die anderen Personen zugewiesen sind.
- **Inbox**: `inbox-decisions` bestimmt, wo eine offene Entscheidung wartet. Mit `immediate` landet sie in der Inbox, sobald sie verbucht ist; mit `at-start` darf ein Backlog-Eintrag sie behalten, bis die Arbeit daran beginnt. `quick-capture` (`on` oder `off`, Standard `on`) lässt den Hook `UserPromptSubmit` eine Chat-Nachricht, die mit `todo:`, `note:` oder `idea:` beginnt, ohne Modell-Durchlauf ablegen, siehe [Inbox, Aufgaben und Journal](/agentic-coding-template-docs/de/concepts/work-entries/).
- **Output depth**: `output-depth` (`verbose`, `normal`, `sparse`) steuert, wie viel der Assistent im Chat schreibt, nicht was dein Werkzeug anzeigt.
- **Session length**: `context-hint` (eine Token-Zahl, Standard 180000, oder `off`) ist die Kontextgröße, ab der der Assistent an der nächsten Aufgabengrenze `/clear` oder eine neue Sitzung vorschlägt; `task-wait-hours` (Standard 12) ist die Zeit, die eine begonnene Aufgabe ruhen darf, bevor sie als wartend gilt. `board-at-start` (`on` oder `off`, Standard `on`) gibt dem Sitzungsstart einen Auszug des Boards mit. `artifacts` (`on` oder `off`, Standard `off`) auf `off` hält Claude Code davon ab, das Werkzeug `Artifact` zu laden, etwa 13.700 Token weniger bei jedem Sitzungsstart.
- **Teaching**: `teach-lessons` (`local`, `docs`) legt fest, wo `act-teach` seine Lektionen ablegt: `local` unter `.act-local/learn/` nur für dich, `docs` versioniert unter `docs/learn/` für das Team. Der Lernstand bleibt in beiden Fällen lokal.
- **Dependencies** und **Docs audit**: `dependency-check` und `docs-audit-due` steuern die Erinnerungen, `act-deps` und `act-audit-docs` auszuführen. Neue Projekte bekommen `dependency-check: regularly`: Der Sitzungsstart weist einmal darauf hin, dass noch kein `act-deps`-Lauf verbucht ist, danach wieder, sobald der letzte älter als 30 Tage ist. `once` legt stattdessen nach `init` einmalig einen Inbox-Eintrag an; bereits gesetzte Werte bleiben.
- **Update**: `update-channel` (`release` oder `latest`, Standard `release`) wählt, was `act-update` bringt: `release` nur das neueste stabile Release-Tag der Template-Quelle, `latest` die Spitze ihres Default-Branches. Der Sitzungsstart meldet ein neues Release (auf `latest`: eine neuere Spitze), und `/act-version` (es führt `update.py --versions` aus) listet die installierte Fassung, die Releases und was ein Update nähme. Die Meldung ist nicht einmalig: Die tägliche Prüfung hält sie fest, der Sitzungsstart wiederholt sie bei jedem Start, das Board führt sie unter Status, und die Statuszeile von Claude Code zeigt `update: 2.4.0` (auf `latest`: `update: <Datum>`), bis das Update eingespielt ist. `--versions`, `--plan` und ein Update-Lauf frischen den Hinweis auf oder löschen ihn, wenn das Projekt aktuell ist. `update-check` schaltet den Hinweis ab. `init` fragt nach dem Wert; `act-doctor` meldet einen ungültigen. Eine Quelle ohne Release-Tags wird an ihrer Spitze verfolgt, mit Hinweis. Siehe [Update-Channel](/agentic-coding-template-docs/de/getting-started/update/#update-channel).
- **Archive**: `archive-compact` (`<n>d <n>` oder `off`, Standard `30d 300`) bestimmt, wann der Sitzungsstart meldet, dass `act-compact` fällig ist: Der älteste Eintrag im Archiv- oder Journal-Ordner ist älter als so viele Tage, oder der Ordner enthält mehr als so viele Dateien. `act-compact` führt nur wortgetreu zusammen; der frühere Schlüssel `archive-shorten` ist entfallen, ein im Projekt verbliebener Wert wird übergangen. Siehe [Inbox, Aufgaben und Journal](/agentic-coding-template-docs/de/concepts/work-entries/).
- **Git hosting**: `target-branch`, `forge` und `forge-host` sagen dem Pull-Request-Skill, wohin er gehen soll. github.com und gitlab.com bekommen den Token, ohne genannt zu werden; ein selbst gehosteter Host erst, nachdem du ihn genannt hast.
- **Checks**: mechanische Wächter, die vor einer Aktion laufen (siehe unten).
- **Logging**: `logging` und `log-level` schreiben jede Agenten-Aktion nach `ai.log` im Projektwurzelverzeichnis, nicht versioniert, praktisch zum Mitverfolgen in einem zweiten Terminal.
- **Feedback**: freiwilliges Feedback an den Autor des Templates; neue Projekte starten mit `feedback: confirm`, es wird also nichts ohne dein Ja gesendet. Siehe [Feedback](/agentic-coding-template-docs/de/guides/feedback/).
- **Tips**: `tips` (`never`, `occasionally`, `regularly`) steuert, wie oft der Sitzungsstart einen Tipp zeigt. Deine eigenen Erinnerungen in `docs/ai/local/reminders.md` bleiben davon unberührt.
- **Roles**: Overrides von Tier und Reasoning pro Rolle (und pro Skill), siehe [Tiers und Reasoning](/agentic-coding-template-docs/de/concepts/reasoning/).

## Prüfungen: block, warn, off

Jede Zeile der Prüfungstabelle benennt einen Wächter, der vor der Aktion läuft, die er beschreibt, zum Beispiel einem Commit, einem Schreibzugriff unter `.act/` oder einem Worker, der seinen Write Scope verlässt.

| Wert | Wirkung |
| :--- | :--- |
| `block` | die Aktion wird verweigert |
| `warn` | die Aktion läuft mit einem Hinweis weiter |
| `off` | die Prüfung wird ganz übersprungen |

Eine Prüfung, die in der Tabelle als „never refuses" markiert ist, behandelt `block` wie `warn`. Eine Prüfung ist anders: `security-check` nimmt `off`, `local`, `deps` oder `full`, siehe [Sicherheitsprüfung](/agentic-coding-template-docs/de/guides/security-check/).

Eine Prüfung herunterzustufen ist deine Entscheidung. Prüfungen wie `secret-scan` oder `git-reset-hard` schützen vor Dingen, die sich nicht rückgängig machen lassen; senke sie nur mit Grund.

`secret-scan` hält einen Commit an, dessen gestagter Diff ein Schlüssel- oder Token-Muster enthält. Eine Zeile mit einem `act:allow-secret`-Kommentar ist ausgenommen. Für eine Datei ohne Kommentare (JSON) steht die Zeile in `docs/ai/local/secret-accepted.md` als `- <path> <hash>: <reason>`; die Sperrmeldung druckt die fertige Zeile (Pfad und Zeilen-Hash, nie den Wert). Eine geänderte Zeile, dieselbe Zeile in einer anderen Datei oder eine fehlende oder unlesbare Liste sperrt wieder. Die Override-Hashes, die `doctor --accept` in `.act-lock.json` im Projektwurzelverzeichnis schreibt (eine Regel-ID als Schlüssel, genau 64 kleine Hex-Ziffern als Wert, sonst nichts auf der Zeile), hält `secret-scan` nicht an. Was jede Prüfung erkennt und wo ihre Grenzen liegen, steht auf der [Seite zu den Prüfungen](/agentic-coding-template-docs/de/reference/topics/#checks).

`outside-root` hält Lesen und Schreiben im Projektordner und seinen erlaubten Orten, für den Assistenten und seine Worker. In neuen Projekten steht es auf `block`; ein Projekt ohne die Zeile führt es als `warn` aus. Ausnahmen kommen in `outside-root-allow`; beide Zeilen stehen in der [Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/), die Regel in [`R-safe-outside-root`](/agentic-coding-template-docs/de/reference/rules/#r-safe-outside-root).

`act-local-tidy` hält `.act-local/` klein. Beim Sitzungsstart entfernt es, höchstens einmal am Tag und in einem Hintergrundprozess, `tmp/`-Einträge und unbekannte Einträge direkt unter `.act-local/` (keine, die ein Skript der Vorlage anlegt), die älter als 7 Tage sind und deren Name nicht mit der Id einer offenen Aufgabe beginnt, und alle bis auf die neuesten 5 Backups von `update`. Der nächste Sitzungsstart meldet Anzahl, Größe und Namen. Der erste Lauf in einem Projekt meldet nur, was er entfernen würde; entfernt wird an einem späteren Tag, nachdem ein Sitzungsstart diese Meldung gezeigt hat. `warn` meldet nur, `off` überspringt die Prüfung. `act-local-keep` listet Muster relativ zu `.act-local/` (zum Beispiel `exports, tmp/long-*`), die nie entfernt werden, oder `none`. `python .act/scripts/act_local_tidy.py` zeigt den Plan, ohne etwas zu entfernen. Die Regel dahinter ist [`R-work-throwaway`](/agentic-coding-template-docs/de/reference/rules/#r-work-throwaway).

## Datei und Umgebung

`config.md` beschreibt das **Projekt** und ist versioniert. Secrets und Abweichungen pro Rechner oder pro Lauf gehören in die Umgebung (zum Beispiel `AGENTIC_FEEDBACK_URL` oder `ACT_FORGE_API_URL`); sie überschreibt die Datei für diesen Lauf, nie umgekehrt. Der Sitzungsstart nennt jeden aktiven Override aus der Umgebung, nur die Namen, nie die Werte.

## Die Datei ändern

Ändere die Werte in den Tabellen, nicht die Schlüsselnamen oder die Marken (`<!-- act:... -->`): Die liest die Mechanik. Ein Update behält deine Werte. Ändert sich das Projekt auf eine Weise, die `config.md` beschreibt, aktualisiert der Assistent sie im selben Schritt.
