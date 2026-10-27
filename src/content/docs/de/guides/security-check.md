---
title: Sicherheitsprüfung
description: Wonach die Sicherheitsprüfung vor einem Commit sucht - gefährliche Muster, verwundbare Abhängigkeiten, die tiefe Prüfung - und was jeder Wert von security-check ausführt.
sidebar:
  order: 2
sourceHash: e10184f1aa8d2d2262e741b69a5d17f127af21faea3cd233754bd54373fbae4f
---

Die Sicherheitsprüfung wird mit einem Schlüssel gesetzt, `security-check`, in der Tabelle Checks von `docs/ai/config.md`. Anders als die übrigen Prüfungen nimmt sie nicht `block`, `warn` oder `off`, sondern eine Stufe.

| Wert | Führt aus |
| :--- | :--- |
| `off` | nichts |
| `local` (Standard) | den Scan nach gefährlichen Mustern |
| `deps` | den Musterscan plus die Abhängigkeitsabfrage |
| `full` | beides, plus die tiefe Prüfung auf Anforderung und vor einem Release |

## Gefährliche Muster (alle Stufen außer `off`)

Bei `git commit` werden die hinzugefügten Zeilen nach Konstrukten wie `eval`/`exec`, `shell=True`, `pickle.loads`, `yaml.load` ohne sicheren Loader, `v-html`, `innerHTML =` und per Zeichenkettenverkettung gebautem SQL durchsucht. Die SQL-Prüfungen verlangen eine Anweisungsstruktur (`SELECT ... FROM`, `INSERT INTO`, `UPDATE ... SET`, `DELETE ... FROM`); das Wort „update“ oder „select“ in Fließtext oder URL hält also keinen Commit auf. Das getaggte Template-Literal eines Query-Builders, in dem jedes `${…}` ein gebundener Parameter ist (``sql`select … where code = ${code}` `` in Kysely, Drizzle oder postgres.js, ``Prisma.sql`…` ``, ``$queryRaw`…` ``, ``$executeRaw`…` ``), wird nicht gemeldet; eine Zeile mit einem Raw-Helfer (`sql.raw`, `sql.unsafe`, `Prisma.raw`, `$queryRawUnsafe` und ähnliche), ein ungetaggtes Template-Literal oder echte `+`-Verkettung wird weiterhin gemeldet. Ein festes `DELETE … FROM`- oder `INSERT INTO`-Literal gilt nur dann als Verkettung, wenn seine Zeile ein Anführungszeichen und `+` enthält. Gesucht wird nur nach den Coding-Regelsätzen, die du in `docs/project/coding_rules.md` eingeschaltet hast.

- Ein Treffer stoppt den Commit **einmal** pro Datei und Muster, mit Fundstelle. Behebe ihn, oder committe erneut, um ihn durchzulassen.
- Eine Zeile mit `act:allow-danger` ist ausgenommen.
- Dokumentation (`.md`, `.txt`, `.rst`) und alles unter `.act/` wird nie gescannt.

Das ist getrennt von `secret-scan`, einer regulären `block`/`warn`/`off`-Prüfung, die einen Commit stoppt, dessen vorgemerkter Diff einen Schlüssel, Token, privaten Schlüssel, eine `.env`-Datei oder eine Zuweisung mit hoher Entropie enthält. Sie erkennt außerdem Zugangsdaten in einem URL-Query-String, einen Schlüssel in einfachen Anführungszeichen (`{'token': '...'}`), einen PHP-Array-Eintrag (`'token' => '...'`), einen Literal-Fallback hinter einer Umgebungsvariablen-Abfrage (`os.environ.get("API_TOKEN", "...")`, `process.env.API_TOKEN || "..."`) und ein Zugangsdaten-Paar in einem Wert in Anführungszeichen. Eine Zeile mit `act:allow-secret` ist ausgenommen.

Eine Datei, die keinen Kommentar tragen kann (JSON, etwa ein Script-Eintrag, dessen Name nach Zugangsdaten aussieht), wird stattdessen über eine Liste behandelt: `docs/ai/local/secret-accepted.md`, pro angenommener Zeile eine Zeile `- <path> <hash>: <reason>`. `<path>` ist relativ zur Projektwurzel mit `/`, `<hash>` ein Hash der Zeile. Du rechnest ihn nicht selbst aus: Die Sperrmeldung druckt für jeden Fund den fertigen Eintrag (Pfad und Hash, nie den Wert), den du einfügst. Die Ausnahme fällt, sobald sich die Zeile ändert oder dieselbe Zeile in einer anderen Datei steht; der Commit wird dann wieder gesperrt. Eine fehlende, zu große oder unlesbare Liste nimmt nichts aus, und ein Eintrag, der die Liste selbst nennt, wird ignoriert.

## Abhängigkeitslücken (`deps`, `full`)

Eine Live-Abfrage bekannter Schwachstellen in deinen Abhängigkeiten. Sie nutzt `osv-scanner`, falls installiert, sonst `npm audit`, `pnpm audit`, `composer audit` oder `pip-audit` für das passende Ökosystem. Zu den Lock- und Requirement-Dateien, die sie liest, gehören `package-lock.json`, `pnpm-lock.yaml` (pnpm 9 oder neuer), `composer.lock`, `requirements.txt`, `go.mod` und `Cargo.lock`.

- **Beim Commit**: für genau die Lock-Dateien, die dieser Commit berührt. Der Scan läuft im Hintergrund; ist er nicht fertig, wird der Commit einmal mit „dependency scan running" abgelehnt, und der erneute Versuch liest das Ergebnis, das für den Tag zwischengespeichert ist.
- **Nach `git merge`, `git pull` oder `git cherry-pick`**: Die Lock-Dateien, die der Befehl hereingebracht hat, werden
  gleich danach geprüft. Nichts wird aufgehalten; ein Befund landet als ein Bericht in der Inbox, einmal pro
  Lock-Datei-Stand und Tag.
- **Beim Sitzungsstart**: einmal am Tag über jede Lock-Datei im Projekt, außer in Ordnern, die git ignoriert, und in verschachtelten Checkouts. Der Hinweis ist je Lock-Datei gruppiert und nennt das Alter des Scans; ein Ergebnis entfällt, sobald eine gescannte Lock-Datei sich geändert hat oder verschwunden ist.
- **Was einen Commit aufhält**: ein nicht akzeptierter Befund der Schwere high oder critical, mit Paket, Version, Advisory-Id, Schwere und behobener Version. Eine geringere oder unbekannte Schwere wird nur vermerkt. `pip-audit` meldet keine Schwere, seine Befunde werden daher nur vermerkt.
- **Einen Befund akzeptieren**: füge eine Zeile `- <advisory-id>: <reason>` in `docs/ai/local/security-accepted.md` ein, eine pro Zeile; `#`-Kommentare und Leerzeilen werden ignoriert. Die Id ist die, die das Scan-Werkzeug meldet (`npm audit` nutzt Zahlen, `osv-scanner` und `pnpm audit` nutzen GHSA-Ids); nach einem Wechsel des Paketmanagers brauchen die Einträge also neue Ids (`act-deps` weist darauf hin).
- **Fehler blockieren nie, außer ein unlesbarer Bericht mit Funden**: Ein fehlendes Werkzeug wird einmal pro Rechner mit seinem Installationsbefehl vermerkt; ein Netzwerk- oder Werkzeugfehler wird jedes Mal vermerkt, und der Commit geht durch, damit ein Rechner ohne Netz weiter committen kann. `python .act/scripts/security_scan.py --deps` meldet dann „scan incomplete“ statt „no known vulnerability found“. Endet ein Werkzeug mit seinem Exitcode für Funde, hinterlässt aber keinen lesbaren Bericht (bei `pip-audit`, dessen eigene schwere Fehler ebenfalls mit 1 enden, nur einen nicht leeren), hält das den Commit an, weil niemand sagen kann, was gefunden wurde: `security_scan.py --deps` endet mit 1 und einer Zeile `UNREAD FINDINGS`, und auch der Hinweis beim Sitzungsstart und der Bericht nach einem Merge zeigen es.

## Die tiefe Prüfung (`full`)

`python .act/scripts/security_deep.py [--since <ref> | --all]` führt Semgrep mit offenen Regelsätzen über die Dateien aus, die sich seit dem jüngsten Tag geändert haben (oder mit `--all` über den ganzen Baum). Sie läuft nur auf Anforderung und vor einem Release (`act-release`), nie bei jedem Commit, und bei einer anderen Stufe als `full` gibt sie eine Zeile aus und tut nichts, es sei denn, du übergibst `--force`. Der Release-Skill fügt einen Sicherheitsdurchgang durch die Rolle `reviewer` hinzu.

## Welche Stufe wählen

`local` kostet nichts und braucht kein Werkzeug. Wechsle zu `deps`, wenn das Projekt Lock-Dateien hat und du Befunde zu bekannten Schwachstellen haben willst, bevor sie ausgeliefert werden; zu `full` vor Releases. Siehe die [Konfigurationsreferenz](/agentic-coding-template-docs/de/reference/configuration/) für die genaue Zeile und [Konfiguration](/agentic-coding-template-docs/de/concepts/configuration/) dafür, wie Prüfungen allgemein funktionieren.
