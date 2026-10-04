---
title: Tiers und Reasoning
description: Wie Rollen eine Modellkapazität (Tier) und eine Reasoning-Stufe bekommen, die -high-Varianten, Overrides und Caps.
sidebar:
  order: 5
sourceHash: bf8bee759db577f8ddb266ef767f74eef9e122a17b1705f3c1eefe176bb634c1
---

Jede Worker-Rolle hat einen **Tier** (wie viel Modellkapazität) und eine **Reasoning**-Stufe (wie viel sie vor der Antwort nachdenkt). Beides steht in einer werkzeugneutralen Skala in der Definition der Rolle. Ein echter Modellname erscheint nur in `.act/tiers.json` und wird angewendet, wenn die Datei der Rolle für dein Werkzeug erzeugt wird.

## Tiers

| Tier | Gedacht für | Standard-Cap (Tool-Aufrufe) |
| :--- | :--- | :--- |
| `light` | Lesen und Zählen | 10 |
| `standard` | Implementierung | 40 |
| `elevated` | Review und Sicherheitsurteil | 60 |
| `high` | eine Aufgabe, die mehr Reasoning braucht als `elevated` | 80 |
| `expert` | Eskalation nach zwei gescheiterten Versuchen an einer Aufgabe | 80 |

Für Claude Code ordnet `.act/tiers.json` `light` Haiku zu, `standard` Sonnet, `elevated` und `high` Opus (`high` mit einer Stufe mehr Reasoning) und `expert` dem Spitzenmodell. Andere Werkzeuge haben noch keine Zuordnung; bei ihnen behalten die erzeugten Dateien das Modell, das sie schon haben.

Die Reasoning-Skala lautet `none`, `low`, `medium`, `high`, `xhigh`, `max`.

## Pro Rolle

| Rolle | Tier | Reasoning |
| :--- | :--- | :--- |
| `quick-check` | `light` | `none` |
| `explorer` | `standard` | `low` |
| `builder`, `doc-writer`, `test-writer`, `optimizer` | `standard` | `medium` |
| `debugger` | `standard` | `high` |
| `reviewer` | `elevated` | `high` |
| `expert-solver` | `expert` | `max` |

Die [Rollenreferenz](/agentic-coding-template-docs/de/reference/roles/) wird aus dem Template erzeugt und ist immer aktuell; was jede Rolle tut, steht unter [Rollen](/agentic-coding-template-docs/de/concepts/roles/).

## Die -high-Varianten

Neben `.claude/agents/<role>.md` erzeugt das Template `.claude/agents/<role>-high.md`: dieselbe Rolle mit dem Reasoning eine Stufe weiter oben auf der Skala. Der Assistent nennt die `-high`-Variante für einen einzelnen Auftrag, der mehr Nachdenken braucht, ohne die Rolle dauerhaft anzuheben. Eine Rolle, die schon an der Spitze der Skala steht (`expert-solver`), hat keine Variante.

## Eine Rolle überschreiben

Die Tabelle Roles am Ende von `docs/ai/config.md` ist standardmäßig leer. Fülle eine Zeile, um eine Rolle zu ändern:

```markdown
| Role | Tier | Reasoning | Model |
| :--- | :--- | :--- | :--- |
| builder | elevated | high | |
```

`Tier` und `Reasoning` überschreiben die Werte des Templates; ein gefülltes `Model` legt das Modell direkt fest und gewinnt gegenüber `Tier`. Die eigene Rolle eines Projekts (siehe [Eigene Regeln, Skills und Rollen](/agentic-coding-template-docs/de/guides/own-skills-and-rules/)) wird dort auf dieselbe Weise benannt. Die erzeugten Dateien werden beim Sitzungsstart und bei jedem Update aufgefrischt; angefasst werden nur ihre Zeilen `model` und `effort`, nie deine eigenen Ergänzungen im Text der Rolle.

## Caps

Jeder Auftrag an einen Worker nennt seinen Tier, eine Schätzung und einen Cap für Tool-Aufrufe (`Cap: <n>`). Die Prüfung `worker-cap` erzwingt ihn mechanisch: Der Worker bekommt beim Erreichen des Caps einen Hinweis und wird ab dem 1,5-fachen Cap abgewiesen. Ohne Zeile `Cap:` gilt der Standard des Tiers (Tabelle oben); ohne Tier `standard`.

Der Assistent vermerkt nach jedem Ergebnis, ob es angenommen, nachgearbeitet oder eskaliert wurde. Zeigen eine Rolle und ein Tier viele Nacharbeiten, schlägt `doctor` einen höheren Tier vor; bei keiner über viele Ergebnisse einen niedrigeren. Es ist immer nur ein Vorschlag, nie eine Änderung im laufenden Betrieb; du entscheidest.
