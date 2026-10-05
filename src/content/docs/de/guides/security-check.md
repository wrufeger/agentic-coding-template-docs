---
title: Sicherheitsprüfung
description: Wonach die Sicherheitsprüfung vor einem Commit sucht - gefährliche Muster, verwundbare Abhängigkeiten, die tiefe Prüfung - und was jeder Wert von security-check ausführt.
sidebar:
  order: 2
sourceHash: 286567e1a34cc12e7792c670e05a3cb5f298fa9370946db1959074b6b313340d
---

Die Sicherheitsprüfung wird mit einem Schlüssel gesetzt, `security-check`, in der Tabelle Checks von `docs/ai/config.md`. Anders als die übrigen Prüfungen nimmt sie nicht `block`, `warn` oder `off`, sondern eine Stufe.

| Wert | Führt aus |
| :--- | :--- |
| `off` | nichts |
| `local` (Standard) | den Scan nach gefährlichen Mustern |
| `deps` | den Musterscan plus die Abhängigkeitsabfrage |
| `full` | beides, plus die tiefe Prüfung auf Anforderung und vor einem Release |

## Gefährliche Muster (alle Stufen außer `off`)

Bei `git commit` werden die hinzugefügten Zeilen nach Konstrukten wie `eval`/`exec`, `shell=True`, `pickle.loads`, `yaml.load` ohne sicheren Loader, `v-html`, `innerHTML =` und per Zeichenkettenverkettung gebautem SQL durchsucht. Gesucht wird nur nach den Coding-Regelsätzen, die du in `docs/project/coding_rules.md` eingeschaltet hast.

- Ein Treffer stoppt den Commit **einmal** pro Datei und Muster, mit Fundstelle. Behebe ihn, oder committe erneut, um ihn durchzulassen.
- Eine Zeile mit `act:allow-danger` ist ausgenommen.
- Dokumentation (`.md`, `.txt`, `.rst`) und alles unter `.act/` wird nie gescannt.

Das ist getrennt von `secret-scan`, einer regulären `block`/`warn`/`off`-Prüfung, die einen Commit stoppt, dessen vorgemerkter Diff einen Schlüssel, Token, privaten Schlüssel, eine `.env`-Datei oder eine Zuweisung mit hoher Entropie enthält. Eine Zeile mit `act:allow-secret` ist ausgenommen.

## Abhängigkeitslücken (`deps`, `full`)

Eine Live-Abfrage bekannter Schwachstellen in deinen Abhängigkeiten. Sie nutzt `osv-scanner`, falls installiert, sonst `npm audit`, `composer audit` oder `pip-audit` für das passende Ökosystem. Zu den Lock- und Requirement-Dateien, die sie liest, gehören `package-lock.json`, `composer.lock`, `requirements.txt`, `go.mod` und `Cargo.lock`.

- **Beim Commit**: für genau die Lock-Dateien, die dieser Commit berührt. Der Scan läuft im Hintergrund; ist er nicht fertig, wird der Commit einmal mit „dependency scan running" abgelehnt, und der erneute Versuch liest das Ergebnis, das für den Tag zwischengespeichert ist.
- **Nach `git merge`, `git pull` oder `git cherry-pick`**: Die Lock-Dateien, die der Befehl hereingebracht hat, werden
  gleich danach geprüft. Nichts wird aufgehalten; ein Befund landet als ein Bericht in der Inbox, einmal pro
  Lock-Datei-Stand und Tag.
- **Beim Sitzungsstart**: einmal am Tag über jede Lock-Datei im Projekt, gemeldet als eine Zeile.
- **Was einen Commit aufhält**: ein nicht akzeptierter Befund der Schwere high oder critical, mit Paket, Version, Advisory-Id, Schwere und behobener Version. Eine geringere oder unbekannte Schwere wird nur vermerkt. `pip-audit` meldet keine Schwere, seine Befunde werden daher nur vermerkt.
- **Einen Befund akzeptieren**: füge eine Zeile `- <advisory-id>: <reason>` in `docs/ai/local/security-accepted.md` ein, eine pro Zeile; `#`-Kommentare und Leerzeilen werden ignoriert.
- **Fehler blockieren nie**: Ein fehlendes Werkzeug wird einmal pro Rechner mit seinem Installationsbefehl vermerkt; ein Netzwerk- oder Werkzeugfehler wird jedes Mal vermerkt, und der Commit geht durch.

## Die tiefe Prüfung (`full`)

`python .act/scripts/security_deep.py [--since <ref> | --all]` führt Semgrep mit offenen Regelsätzen über die Dateien aus, die sich seit dem jüngsten Tag geändert haben (oder mit `--all` über den ganzen Baum). Sie läuft nur auf Anforderung und vor einem Release (`act-release`), nie bei jedem Commit, und bei einer anderen Stufe als `full` gibt sie eine Zeile aus und tut nichts, es sei denn, du übergibst `--force`. Der Release-Skill fügt einen Sicherheitsdurchgang durch die Rolle `reviewer` hinzu.

## Welche Stufe wählen

`local` kostet nichts und braucht kein Werkzeug. Wechsle zu `deps`, wenn das Projekt Lock-Dateien hat und du Befunde zu bekannten Schwachstellen haben willst, bevor sie ausgeliefert werden; zu `full` vor Releases. Siehe die [Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/) für die genaue Zeile und [Konfiguration](/agentic-coding-template-docs/de/concepts/configuration/) dafür, wie Prüfungen allgemein funktionieren.
