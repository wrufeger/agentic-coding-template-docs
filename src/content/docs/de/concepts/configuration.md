---
title: Konfiguration
description: docs/ai/config.md steuert den Arbeitsablauf - seine Gruppen und was block, warn und off für Prüfungen bedeuten.
sidebar:
  order: 4
sourceHash: d8f6bac0ab2d54c6d14428ceca751bf059d6104bdbf8e1c3ad6ddfd02a362e43
---

`docs/ai/config.md` ist die Datei, die steuert, wie am Projekt gearbeitet wird. Sie besteht aus Markdown-Tabellen, ein Abschnitt pro Thema. `init` trägt die Werte ein, die es erfragt oder erkannt hat; du änderst sie jederzeit. Nichts braucht einen Neuaufbau: Der Hook beim Sitzungsstart liest die Datei und meldet, was sich seit dem letzten Abgleich geändert hat. Jeder Schlüssel mit seinen erlaubten Werten steht in der [Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/); diese Seite erklärt, wofür die Gruppen da sind.

## Gruppen

- **Project**: Name, Owner, `language-chat` und `language-docs`, `stack`, die `commands` für Lint/Typecheck/Test, die `tools`, die du nutzt, und der `mode` (`solo` oder `team`, siehe [Inbox, Aufgaben und Journal](/agentic-coding-template-docs/de/concepts/work-entries/)). `language-chat` ist die Sprache, in der der Assistent mit dir spricht (`auto` folgt deinen Nachrichten); `language-docs` ist die Sprache von allem, was er unter `docs/` schreibt. `.act/` bleibt in beiden Fällen Englisch. Ein Befehl mit `(not set)` überspringt die zugehörige Prüfung vor einem Commit. `run` ist der Befehl, der die Anwendung startet; `(not set)` heißt, dass keiner hinterlegt ist.
- **Board**: `board` wählt, wohin das erzeugte Board geht (`docs`, `shared`, `local`); `board-others` schaltet den Abschnitt für Aufgaben um, die anderen Personen zugewiesen sind.
- **Inbox**: `inbox-decisions` bestimmt, wo eine offene Entscheidung wartet. Mit `immediate` landet sie in der Inbox, sobald sie verbucht ist; mit `at-start` darf ein Backlog-Eintrag sie behalten, bis die Arbeit daran beginnt.
- **Output depth**: `output-depth` (`verbose`, `normal`, `sparse`) steuert, wie viel der Assistent im Chat schreibt, nicht was dein Werkzeug anzeigt.
- **Session length**: `context-hint` (eine Token-Zahl, Standard 180000, oder `off`) ist die Kontextgröße, ab der der Assistent an der nächsten Aufgabengrenze `/clear` oder eine neue Sitzung vorschlägt; `task-wait-hours` (Standard 12) ist die Zeit, die eine begonnene Aufgabe ruhen darf, bevor sie als wartend gilt.
- **Dependencies** und **Docs audit**: `dependency-check` und `docs-audit-due` steuern die Erinnerungen, `act-deps` und `act-audit-docs` auszuführen.
- **Git hosting**: `target-branch`, `forge` und `forge-host` sagen dem Pull-Request-Skill, wohin er gehen soll. github.com und gitlab.com bekommen den Token, ohne genannt zu werden; ein selbst gehosteter Host erst, nachdem du ihn genannt hast.
- **Checks**: mechanische Wächter, die vor einer Aktion laufen (siehe unten).
- **Logging**: `logging` und `log-level` schreiben jede Agenten-Aktion nach `ai.log` im Projektwurzelverzeichnis, nicht versioniert, praktisch zum Mitverfolgen in einem zweiten Terminal.
- **Feedback**: freiwilliges Feedback an den Autor des Templates, siehe [Feedback](/agentic-coding-template-docs/de/guides/feedback/).
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

## Datei und Umgebung

`config.md` beschreibt das **Projekt** und ist versioniert. Secrets und Abweichungen pro Rechner oder pro Lauf gehören in die Umgebung (zum Beispiel `AGENTIC_FEEDBACK_URL` oder `ACT_FORGE_API_URL`); sie überschreibt die Datei für diesen Lauf, nie umgekehrt. Der Sitzungsstart nennt jeden aktiven Override aus der Umgebung, nur die Namen, nie die Werte.

## Die Datei ändern

Ändere die Werte in den Tabellen, nicht die Schlüsselnamen oder die Marken (`<!-- act:... -->`): Die liest die Mechanik. Ein Update behält deine Werte. Ändert sich das Projekt auf eine Weise, die `config.md` beschreibt, aktualisiert der Assistent sie im selben Schritt.
