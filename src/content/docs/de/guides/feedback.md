---
title: Rückmeldungen senden
description: Freiwillige Rückmeldung an den Autor der Vorlage - die Modi, Takt und Umfang, was nie gesendet wird und wo die lokale Kopie bleibt.
sidebar:
  order: 1
sourceHash: 97550675c4d74b5abcc0beb6c949535f613c480bff92c3625256831ea96ba126
---

Du kannst dem Autor der Vorlage zurückmelden, was der Arbeitsweise gutgetan hat oder fehlte. Rückmeldung ist freiwillig, betrifft **nur die Arbeitsweise, nie dein Projekt**, und alles, was den Rechner verlässt, wird auch lokal aufbewahrt.

Der Test für jeden Eintrag: Würde das jemandem helfen, der dein Projekt nie sieht? Eine Regel, die du ergänzen musstest, weil die Vorlage sie nicht hatte, ein Ablauf, der immer wieder scheiterte, ein Script, das sich verallgemeinern lässt: Das ist Rückmeldung. Eine Tatsache über dein Projekt (sein Name, sein Stack, eine Zahl, ein Zitat aus seiner Doku) ist es nicht.

## Modi

Drei Schlüssel im Abschnitt Feedback von `docs/ai/config.md` steuern das:

| `feedback` | Verhalten |
| :--- | :--- |
| `off` | nichts wird von selbst gesendet |
| `confirm` | der Assistent zeigt dir die Nutzlast und fragt |
| `automatic` | die Nutzlast wird ohne Rückfrage gesendet |
| `manual` | Einträge werden gesammelt, aber nie von selbst gesendet; nur der Skill `act-feedback` sendet |

`python .act/scripts/feedback.py --enable [--mode off|confirm|automatic|manual]` setzt den Modus; `--enable` ohne `--mode` bedeutet `automatic`, das ohne Rückfrage sendet; `--disable` schaltet es ab.

## Takt und Umfang

`feedback-cadence` ist eine Obergrenze, nie eine Pflicht: `manual`, `immediate`, `hourly`, `daily`, `weekly` (der übliche Wert) oder `adaptive`, das daraus lernt, wie oft auf Erinnerungen reagiert oder sie verschoben werden. Gibt es nichts zu melden, wird nichts gesendet, egal wie kurz der Takt ist.

`feedback-scope` sagt, was der Assistent **von sich aus** sammeln darf:

| Umfang | Sammelt |
| :--- | :--- |
| `a` | Kennzahlen |
| `b` | Regel- und Strukturänderungen |
| `c` | Werkzeugnutzung |

Ein von Hand geschriebener Befund landet immer im Ausgang, egal welcher Umfang gilt.

## Zwei Wege zum Senden

1. **Ein Satz nach dem Auslöser**, zum Beispiel `feedback: the update left a file behind`. Dieser Satz ist die Nachricht selbst, unverändert gesendet, auch mit `feedback: off`. Mit `off` verlassen nur der Text und der eigene Commit-Hash der Vorlage das Projekt, sonst nichts. Bei jedem anderen Modus geht die Projekt-Id mit, damit sich mehrere Nachrichten desselben Projekts unterscheiden lassen, aber nie die Repository-URL.
2. **Der Auslöser allein** (der Skill `act-feedback`). Der Assistent geht durch `.act/`, die erzeugten Dateien und `docs/ai/`, schreibt pro Befund einen Eintrag (zwei bis sechs Sätze), zeigt den Stapel mit `feedback.py --plan` vorab und sendet ihn nach deinem Modus und Takt.

Ein Fehler in der Vorlage selbst (ein Script oder Skill, der fehlschlägt, zwei Regeln, die sich widersprechen, eine Regel, die nie greift) wird gespeichert und, wo die Einwilligung es erlaubt, sofort gesendet, am Takt vorbei. Die Einwilligung umgeht er trotzdem nie: Mit `feedback: off` bleibt er im Ausgang.

## Was nie gesendet wird

Jede Zeichenkette, die das Projekt verlassen könnte, läuft zuerst durch eine Datenschutzprüfung: zugangsdatenähnliche Wörter, Mailadressen, IP-Adressen, absolute Pfade, lange Hex-Werte und jede URL außer dem Feedback-Endpunkt oder github.com. Ein Treffer wird **nicht stillschweigend entfernt**. Es wird nichts gesendet, und der Grund wird gemeldet, damit der Eintrag ohne diesen Teil neu geschrieben werden kann. Nichts über dein Projekt gehört ohnehin in einen Eintrag: keine Namen, Pfade, Zahlen, kein Code und keine Personen, und kein Lob, nur was konkret geholfen hat oder fehlte.

## Die lokale Kopie

- Jedes Senden schreibt eine vollständige Kopie seiner Nutzlast nach `.act-local/feedback/sent/` (per gitignore ausgeschlossen, verlässt nie deinen Checkout). Wartende Einträge und Buchführung liegen daneben in `.act-local/feedback/`.
- Das Journal des Projekts bekommt pro Senden eine Zeile: Datum, Art, Anzahl der Einträge und Schema-Version, nie Inhalt oder Titel.

Siehe auch die [Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/) für die drei Schlüssel und [Konfiguration](/agentic-coding-template-docs/de/concepts/configuration/) dafür, wie die Datei funktioniert.
