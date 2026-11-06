---
title: "Konzept, Test, Review: was braucht was"
description: Eine Entscheidungstabelle - braucht eine Änderung zuerst ein Konzept, einen Test oder anderen Beleg, ein Review - mit der Regel hinter jeder Antwort.
sidebar:
  order: 6
sourceHash: a884a8f048b66a01a196620b6d9e62ee5e501fe08bba766f9dcaf68c533d9928
---

Nicht jede Änderung geht den ganzen [Von der Idee zum Commit](/agentic-coding-template-docs/de/start/walkthrough/). Das Template
verlangt drei Dinge, und hinter jedem steht eine Regel:

- **Zuerst ein Konzept** - `R-work-idea-first`: Eine Idee, ein Feature oder ein Änderungswunsch bekommt zuerst ein
  kurzes Konzept mit Optionen (`act-idea`) und eine Entscheidung, dann wird gebaut. Das bei etwas Kleinem zu
  überspringen ist erlaubt, aber der Assistent sagt es laut, damit du widersprechen kannst.
- **Beleg** - `R-work-evidence`: „Fertig“ gilt nur mit einem Testlauf, einem CI-Lauf, einem Log-Auszug oder
  Screenshot, einem Commit-Hash oder einem Aufruf nach außen. Ohne ihn ist ein Ergebnis „nicht verifiziert“. Vor einem
  Commit lässt `R-code-commit` Lint, Typprüfung und Tests laufen, aber nur dort, wo das Projekt sie eingerichtet hat.
- **Ein Review** - `R-code-commit`: Der `reviewer` läuft einmal je Aufgabe vor der Abnahme, nicht nach jedem Schritt,
  und schließt mit `ALLOW`, `CONDITIONAL` oder `BLOCK`. Bei einer trivialen Änderung (ein Tippfehler, nur Doku)
  überspringt der Assistent es und sagt es.

| Die Änderung | Zuerst ein Konzept? | Test oder Beleg? | Review? |
| :--- | :--- | :--- | :--- |
| Ein neues Feature oder ein Änderungswunsch | **Ja**, mit Optionen und deiner Entscheidung (`R-work-idea-first`). | **Ja**: Tests, wo das Projekt sie hat, dazu der Nachweis, dass das Feature funktioniert (`R-work-evidence`, `R-code-commit`). | **Ja**, einmal je Aufgabe (`R-code-commit`). |
| Eine kleine, genau beschriebene Änderung, etwa ein Label umbenennen | **Darf entfallen**; der Assistent sagt es laut (`R-work-idea-first`). | **Ja**, mindestens ein Lauf oder ein Blick auf das Ergebnis (`R-work-evidence`). | **Ja**, einmal je Aufgabe, außer sie ist trivial (`R-code-commit`). |
| Eine Fehlerbehebung | **Nein**: Ein Fehler ist keine Idee, `R-work-idea-first` gilt für Ideen, Features und Änderungswünsche. | **Ja, zuerst**: `act-bug` schreibt einen Test, der vor der Behebung fehlschlägt und danach besteht (`R-work-evidence`). | **Ja**, einmal je Aufgabe (`R-code-commit`). |
| Ein Tippfehler oder eine reine Doku-Änderung | **Darf entfallen**, laut gesagt (`R-work-idea-first`). | **Ja**, trotzdem: Der Commit-Hash ist ein Beleg, dazu ein Build oder Link-Check, wo es einen gibt (`R-work-evidence`). | **Entfällt**; der Assistent überspringt es und sagt es (`R-code-commit`). |
| Ein Ergebnis, das ein Worker zurückgibt | Entfällt. | **Ja**: kein Beleg, kein „fertig“ (`R-work-evidence`). | Einmal je Aufgabe, vor der Abnahme (`R-code-commit`). |

So liest du sie:

- „Ja“ ist der Normalfall, „darf entfallen“ ist eine Entscheidung, die der Assistent ankündigt und nie stillschweigend
  trifft.
- Ein Review-Urteil `CONDITIONAL` stoppt den Commit nicht. Die Bedingung wird im selben Schritt als Todo oder Frage in
  die Inbox gelegt und in der Commit-Nachricht genannt. `BLOCK` stoppt ihn (`R-code-commit`).
- Die Tabelle folgt den Vorgaben des Templates. Jede Regel lässt sich im Projekt abschalten oder ersetzen
  (`R-work-override`, [Schichten und Overrides](/agentic-coding-template-docs/de/concepts/layers/)); die Regeltexte
  stehen in der [Regeln](/agentic-coding-template-docs/de/reference/rules/).
