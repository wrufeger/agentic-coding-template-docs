---
title: Einführung
description: Was das Template ist, für wen sie gedacht ist und wie sie in einem Bild funktioniert.
sidebar:
  order: 1
sourceHash: 96b3eed654b8cf45ebc7c0bea76a6c62b6c60da05b476fab4dc797afd1a02f02
---

Das Agentic-Coding-Template, kurz *act*, ist ein Satz von Dateien, den du in ein Projekt legst, damit dein
KI-Coding-Assistent nach einer festen, nachprüfbaren Methode arbeitet. Es enthält Regeln, Skills, Rollen für
Sub-Agenten, Hooks und Scripts. Es funktioniert in einem neuen und in einem bereits bestehenden Projekt.

## Was es dir bringt

- **Eine Arbeitsteilung.** Du setzt Ziele und entscheidest. Der Hauptassistent, der Orchestrator, plant, prüft
  und committet. Er gibt abgegrenzte Aufträge an spezialisierte Worker. Siehe [Rollen](/agentic-coding-template-docs/de/concepts/roles/).
- **Ein Vorgehen mit Belegen.** Eine Idee bekommt ein Konzept mit Optionen, bevor sie gebaut wird. Ein Ergebnis
  gilt nur als fertig, wenn ein Testlauf, ein Commit oder ein Aufruf nach außen es belegt.
- **Der Stand im Repository.** Aufgaben, Backlog, Fragen, Inbox und Journal liegen in `docs/ai/`, sodass jede
  Sitzung am Board weitermachen kann.
- **Wiederkehrende Arbeit als Skills.** Ein Skill ist eine schlichte `SKILL.md`, der jeder Assistent folgen kann,
  zum Beispiel `act-bug`, `act-commit`, `act-release`. Siehe die [Skills-Referenz](/agentic-coding-template-docs/de/reference/skills/).

## Für wen es gedacht ist

Für Teams und einzelne Entwickler, deren Projekt länger lebt als eine Sitzung: Arbeit wird zwischen Sitzungen
oder Personen übergeben, bestehender Code wird geändert, oder ein Fehler wie ein offengelegtes Geheimnis wäre
teuer.

## Was es nicht ist

- **Kein Framework und keine Bibliothek.** Nichts davon landet in deinem Build oder zur Laufzeit.
- **Nicht kostenlos.** Die Regeln werden zu Beginn jeder Sitzung geladen, mit einem Coding-Regelsatz etwa 8.000
  bis 9.000 Tokens, und für jeden Sub-Agenten noch einmal ungefähr so viel. Der Assistent leistet auch mehr pro
  Aufgabe: Tests als Beleg, ein Review, einen Journaleintrag. Für ein einmaliges Script oder einen
  Wegwerf-Prototyp kostet das mehr, als es bringt.
- **Keine Garantie in jedem Werkzeug.** Mechanische Durchsetzung über Hooks gibt es nur in Claude Code (siehe unten).

## So funktioniert es in einem Bild

Ein Projekt hat zwei Schichten, die sich nie vermischen.

| Schicht | Wo | Wem sie gehört |
| :--- | :--- | :--- |
| Template | `.act/` | Dem Template. Wird bei einem Update als Ganzes ersetzt, nie im Projekt bearbeitet. |
| Projekt | `docs/ai/` (Arbeitsstand), `docs/project/` (deine Dokumentation) | Dir. Ein Update überschreibt deine Inhalte nie. |

Drumherum liegen die kleinen Dateien, die jedes Werkzeug liest (`CLAUDE.md`, `AGENTS.md`, `.claude/`,
`.agents/skills/`), und `.act-local/`, das auf deinem Rechner bleibt. Eine Projektfassung einer Datei des
Templates kommt nach `docs/ai/local/<gleicher Pfad>` und gewinnt. Details: [Schichten und Overrides](/agentic-coding-template-docs/de/concepts/layers/).

## Unterstützte KI-Werkzeuge

| Werkzeug | Liest | Was es bekommt |
| :--- | :--- | :--- |
| Claude Code | `CLAUDE.md`, `.claude/` | Alles: Regeln per Import, Skills per Name, Sub-Agenten-Rollen mit Modell- und Effort-Stufe, Hooks, eine Statuszeile, das Board beim Sitzungsstart. |
| Codex, GitHub Copilot, Cursor | `AGENTS.md`, `.agents/skills/` | Regeln und Skills als Anweisungen. Keine Hooks, also wird nichts mechanisch durchgesetzt, und keine Sub-Agenten-Rollen. |
| Gemini CLI | `GEMINI.md`, `.agents/skills/` | Die Skills. Ein Projekt hat noch keine `GEMINI.md`, also richte Gemini CLI in den Einstellungen auf `AGENTS.md`. |
| Jeder andere Assistent | keine | Sag ihm, er soll `docs/ai/rules.md` lesen. Jeder Skill ist eine schlichte `SKILL.md`. |

Welche Werkzeuge im Einsatz sind, steht im Schlüssel `tools` in `docs/ai/config.md`, Standard `claude-code`.
Jedes Projekt bekommt `AGENTS.md` und die Skill-Kopien unter `.agents/skills/`.

## Voraussetzungen

Python 3.9 oder neuer, nur Standardbibliothek, für die Einrichtung, die Scripts und die Hooks. Weiter mit:
[ein neues Projekt starten](/agentic-coding-template-docs/de/getting-started/new-project/) oder
[ein bestehendes übernehmen](/agentic-coding-template-docs/de/getting-started/existing-project/).
